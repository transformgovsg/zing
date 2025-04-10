import type { ServerResponse } from 'node:http';

import type { SerialiseOptions } from './cookie.js';
import { serialise } from './cookie.js';
import { HTTPStatusCode } from './http-status-code.js';
import type { HTTPHeaderKey, HTTPHeaders, HTTPHeaderValue, JSONObject } from './types.js';

export default class Response {
  readonly node: ServerResponse;

  constructor(res: ServerResponse) {
    this.node = res;
  }

  /**
   * Returns `true` if the response has been sent, otherwise `false`.
   */
  get finished() {
    return this.node.writableFinished;
  }

  /**
   * Sends the HTTP response with the specified status code and ends the
   * response. If the response has already been sent, this method is a no-op
   * and does nothing.
   *
   * @param code - The HTTP status code to send (e.g., 200, 404, 500).
   */
  status(code: (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode]) {
    if (this.finished) {
      return;
    }

    this.node.writeHead(code).end();
  }

  /**
   * Sends a 200 status code to the response and ends the response. If the
   * response has already been sent, this method is a no-op and does nothing.
   *
   * This method is a shorthand for `status(HTTPStatusCode.OK)`.
   */
  ok() {
    this.status(HTTPStatusCode.OK);
  }

  /**
   * Sets a cookie on the response. If the response has already been sent,
   * this method does nothing.
   *
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * @param options - The options for the cookie.
   */
  cookie(name: string, value: string, options?: SerialiseOptions) {
    if (this.finished) {
      return;
    }

    this.node.setHeader('Set-Cookie', serialise(name, value, options));
  }

  /**
   * Sets the given header key and value on the response. If the response has
   * already been sent, this method does nothing.
   *
   * @param key - The key of the header to set.
   * @param value - The value of the header to set.
   */
  header<Key extends Exclude<HTTPHeaderKey, 'set-cookie'>>(key: Key, value: HTTPHeaderValue<Key>) {
    if (this.finished) {
      return;
    }

    this.node.setHeader(key, value);
  }

  /**
   * Sends a JSON response with the specified status code and ends the response.
   * If the response has already been sent, this method is a no-op and does
   * nothing.
   *
   * @param code - The HTTP status code to send (e.g., 200, 404, 500).
   * @param data - The JSON data to send in the response body.
   */
  json(code: (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode], data: JSONObject) {
    if (this.finished) {
      return;
    }

    const raw = JSON.stringify(data);
    const headers: HTTPHeaders = {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(raw).toString(),
    };

    if (this.node.req.method === 'HEAD') {
      this.node.writeHead(code, headers).end();
      return;
    }

    this.node.writeHead(code, headers).end(raw);
  }

  /**
   * Sends a text response with the specified status code and ends the response.
   * If the response has already been sent, this method is a no-op and does
   * nothing.
   *
   * @param code - The HTTP status code to send (e.g., 200, 404, 500).
   * @param data - The text data to send in the response body.
   */
  text(code: (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode], data: string) {
    if (this.finished) {
      return;
    }

    const headers: HTTPHeaders = {
      'content-type': 'text/plain; charset=utf-8',
      'content-length': Buffer.byteLength(data).toString(),
    };

    if (this.node.req.method === 'HEAD') {
      this.node.writeHead(code, headers).end();
      return;
    }

    this.node.writeHead(code, headers).end(data);
  }
}
