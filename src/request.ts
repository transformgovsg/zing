import type { IncomingMessage } from 'node:http';

import { parse } from './cookie.js';
import {
  ContentTooLargeError,
  InternalServerError,
  MalformedJSONError,
  UnsupportedContentTypeError,
} from './errors.js';
import type { Options } from './options.js';
import type { Result } from './result.js';
import { ERR, OK } from './result.js';
import type { HTTPMethod } from './types.js';

const ALLOWED_HTTP_METHODS_WITH_BODY: readonly HTTPMethod[] = ['PATCH', 'POST', 'PUT'];

export default class Request {
  readonly node: IncomingMessage;

  #kv = new Map<string, unknown>();
  #body: Uint8Array | null = null;

  #options: Options;
  #url: URL;

  constructor(req: IncomingMessage, options: Options) {
    this.node = req;
    this.#options = options;

    const protocol =
      req.socket && 'encrypted' in req.socket && req.socket.encrypted ? 'https' : 'http';
    this.#url = new URL(req.url!, `${protocol}://${req.headers.host}`);
  }

  /**
   * Returns the protocol of the request.
   */
  get protocol(): 'http' | 'https' {
    return this.#url.protocol === 'http:' ? 'http' : 'https';
  }

  /**
   * Returns the pathname of the request.
   */
  get pathname() {
    return this.#url.pathname;
  }

  /**
   * Returns the HTTP method of the request.
   */
  get method() {
    return this.node.method as HTTPMethod;
  }

  /**
   * Returns the value of the given key from the request-scoped key-value
   * store. If the key is not found and no default value is provided, `null`
   * is returned.
   *
   * @param key - The key to get the value of.
   * @param defaultValue - An optional default value to return if the key is not found.
   */
  get<T = unknown>(key: string, defaultValue?: T): T | null {
    const value = this.#kv.get(key);
    if (!value) {
      return defaultValue ?? null;
    }

    return value as T;
  }

  /**
   * Stores a value in the request-scoped key-value store. The store persists
   * only for the duration of the current request. If the value is `undefined`
   * or `null`, the key is removed from the store.
   *
   * @param key - The key to store the value under.
   * @param value - The value to store.
   */
  set(key: string, value: unknown) {
    if (value === undefined || value === null) {
      this.#kv.delete(key);
      return;
    }

    this.#kv.set(key, value);
  }

  /**
   * Returns the value of the given cookie name from the request. If the
   * cookie is not found and no default value is provided, `null` is returned.
   *
   * @param name - The name of the cookie to get the value of.
   * @param defaultValue - An optional default value to return if the cookie is not found.
   */
  cookie(name: string, defaultValue?: string) {
    const cookie = this.header('cookie');
    if (!cookie) {
      return defaultValue ?? null;
    }

    return parse(cookie, name) ?? defaultValue ?? null;
  }

  /**
   * Returns the value of the given parameter name from the request. If
   * the parameter is not found and no default value is provided, `null` is
   * returned.
   *
   * @param name - The name of the parameter to get the value of.
   * @param defaultValue - An optional default value to return if the parameter is not found.
   */
  param(name: string, defaultValue?: string) {
    const params = this.get<Map<string, string>>('_params');
    if (!params) {
      return defaultValue ?? null;
    }

    const value = params.get(name);
    if (!value) {
      return defaultValue ?? null;
    }

    return value;
  }

  /**
   * Returns the value of the first occurrence of the given query name from
   * the request. If the query is not found and no default value is provided,
   * `null` is returned.
   *
   * @param name - The name of the query to get the value of.
   * @param defaultValue - An optional default value to return if the query is not found.
   */
  query(name: string, defaultValue?: string) {
    const value = this.#url.searchParams.get(name);
    if (!value) {
      return defaultValue ?? null;
    }

    return value;
  }

  /**
   * Returns the values of all occurrences of the given query name from the
   * request. If the query is not found and no default value is provided, `null`
   * is returned.
   *
   * @param name - The name of the query to get the values of.
   * @param defaultValue - An optional default value to return if the query is not found.
   */
  queries(name: string, defaultValue?: string[]) {
    const value = this.#url.searchParams.getAll(name);
    if (value.length === 0) {
      return defaultValue ?? null;
    }

    return value;
  }

  /**
   * Returns the value of the given header name from the request. If the
   * header is not found and no default value is provided, `null` is returned.
   *
   * @param name - The name of the header to get the value of.
   * @param defaultValue - An optional default value to return if the header is not found.
   */
  header(name: string, defaultValue?: string) {
    name = name.toLowerCase();

    const value = this.node.headers[name];
    if (!value) {
      return defaultValue ?? null;
    }

    // Only `set-cookie` header will be an array.
    // https://nodejs.org/api/http.html#messageheaders
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value;
  }

  /**
   * Returns a {@link Result} with the body of the request as a {@link Uint8Array}
   * or `null` if the HTTP method is not `PATCH`, `POST`, or `PUT`.
   *
   * Errors that may be returned:
   * - {@link ContentTooLargeError} - If the body is too large.
   * - {@link InternalServerError} - If an error occurs while reading the body.
   */
  async body(): Promise<Result<Uint8Array | null, ContentTooLargeError | InternalServerError>> {
    const contentLength = this.header('content-length');

    if (!ALLOWED_HTTP_METHODS_WITH_BODY.includes(this.method)) {
      return OK(null);
    }

    if (!contentLength || contentLength === '0') {
      return OK(null);
    }

    if (Number(contentLength) > this.#options.maxBodySize) {
      return ERR(new ContentTooLargeError());
    }

    if (this.#body) {
      return OK(this.#body);
    }

    return new Promise<Result<Uint8Array, ContentTooLargeError | InternalServerError>>(
      (resolve) => {
        let totalLength = 0;
        const chunks: Uint8Array[] = [];

        const onData = (chunk: Uint8Array) => {
          totalLength += chunk.length;

          if (totalLength > this.#options.maxBodySize) {
            this.node.removeListener('data', onData);
            this.node.removeListener('end', onEnd);
            this.node.removeListener('error', onError);

            resolve(ERR(new ContentTooLargeError()));
          }

          chunks.push(chunk);
        };

        const onEnd = () => {
          this.node.removeListener('data', onData);
          this.node.removeListener('end', onEnd);
          this.node.removeListener('error', onError);

          this.#body = Buffer.concat(chunks);
          resolve(OK(this.#body));
        };

        const onError = (err: Error) => {
          this.node.removeListener('data', onData);
          this.node.removeListener('end', onEnd);
          this.node.removeListener('error', onError);

          resolve(ERR(new InternalServerError(err)));
        };

        this.node.on('data', onData);
        this.node.on('end', onEnd);
        this.node.on('error', onError);
      },
    );
  }

  /**
   * Returns a {@link Result} with the body of the request as a string or
   * `null` if the HTTP method is not `PATCH`, `POST`, or `PUT`.
   *
   * Errors that may be returned:
   * - {@link ContentTooLargeError} - If the body is too large.
   * - {@link InternalServerError} - If an error occurs while reading the body.
   * - {@link UnsupportedContentTypeError} - If the content type is not `text/plain`.
   */
  async text(): Promise<
    Result<string | null, ContentTooLargeError | InternalServerError | UnsupportedContentTypeError>
  > {
    const contentType = this.header('content-type')?.split(';')[0];

    if (!contentType || contentType !== 'text/plain') {
      return ERR(new UnsupportedContentTypeError());
    }

    const result = await this.body();
    if (result.isErr()) {
      return ERR(result.error);
    }

    return OK(result.value?.toString() ?? null);
  }

  /**
   * Returns a {@link Result} with the body of the request as a JSON object or
   * `null` if the HTTP method is not `PATCH`, `POST`, or `PUT`.
   *
   * Errors that may be returned:
   * - {@link ContentTooLargeError} - If the body is too large.
   * - {@link InternalServerError} - If an error occurs while reading the body.
   * - {@link UnsupportedContentTypeError} - If the content type is not `application/json`.
   * - {@link MalformedJSONError} - If the body is not valid JSON.
   */
  async json<T = unknown>(): Promise<
    Result<
      T | null,
      ContentTooLargeError | InternalServerError | UnsupportedContentTypeError | MalformedJSONError
    >
  > {
    const contentType = this.header('content-type')?.split(';')[0];

    if (!contentType || contentType !== 'application/json') {
      return ERR(new UnsupportedContentTypeError());
    }

    const result = await this.body();
    if (result.isErr()) {
      return ERR(result.error);
    }

    if (!result.value) {
      return OK(null);
    }

    try {
      return OK(JSON.parse(result.value.toString()));
    } catch (err) {
      if (err instanceof SyntaxError) {
        return ERR(new MalformedJSONError());
      }

      return ERR(new InternalServerError(err));
    }
  }
}
