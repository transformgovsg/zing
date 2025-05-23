import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Server as HTTPServer } from 'node:http';
import { createServer as createHTTPServer } from 'node:http';
import type { Socket } from 'node:net';

import { ContentTooLargeError, MalformedJSONError, UnsupportedContentTypeError } from './errors.js';
import { HTTPStatusCode } from './http-status-code.js';
import type { Options } from './options.js';
import { DEFAULT_OPTIONS } from './options.js';
import Request from './request.js';
import Response from './response.js';
import Router from './router.js';
import type { ErrorHandler, Handler, HTTPMethod, Middleware } from './types.js';

/**
 * The default 404 handler.
 */
const DEFAULT_404_HANDLER: Handler = (_, res) => {
  res.text(HTTPStatusCode.NotFound, 'Not Found');
};

/**
 * The default error handler.
 */
const DEFAULT_ERROR_HANDLER: ErrorHandler = (err, _, res) => {
  // Always close the connection when an error occurs.
  res.header('connection', 'close');

  if (err instanceof ContentTooLargeError) {
    res.text(HTTPStatusCode.ContentTooLarge, 'Content Too Large');
    return;
  }
  if (err instanceof UnsupportedContentTypeError) {
    res.text(HTTPStatusCode.UnsupportedMediaType, 'Unsupported Media Type');
    return;
  }
  if (err instanceof MalformedJSONError) {
    res.text(HTTPStatusCode.UnprocessableContent, 'Unprocessable Content');
    return;
  }

  res.text(HTTPStatusCode.InternalServerError, 'Internal Server Error');
};

/**
 * A lightweight web framework.
 */
export default class Zing {
  #isListening = false;
  #isShuttingDown = false;
  #activeRequestCountPerSocket = new Map<Socket, number>();
  #middleware: Middleware[] = [];
  #fn404Handler: Handler = DEFAULT_404_HANDLER;
  #fnErrorHandler: ErrorHandler = DEFAULT_ERROR_HANDLER;

  #options: Options;
  #server: HTTPServer;
  #router: Router<{ handler: Handler }>;

  constructor(options: Partial<Options> = {}) {
    this.#options = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.#server = createHTTPServer(this.#dispatch.bind(this));
    this.#router = new Router();
  }

  /**
   * Starts listening for incoming connections on the specified port.
   *
   * @param port - The port to listen on. Defaults to `8080`.
   */
  async listen(port = 8080) {
    if (this.#isListening) {
      return;
    }
    this.#isListening = true;

    await new Promise<void>((resolve, reject) => {
      // Track active connections.
      this.#server.on('connection', (socket) => {
        this.#activeRequestCountPerSocket.set(socket, 0);
        socket.on('close', () => this.#activeRequestCountPerSocket.delete(socket));
      });

      // Track ongoing requests.
      this.#server.on('request', (req, res) => {
        this.#activeRequestCountPerSocket.set(
          req.socket,
          (this.#activeRequestCountPerSocket.get(req.socket) ?? 0) + 1,
        );

        res.on('finish', () => {
          this.#activeRequestCountPerSocket.set(
            req.socket,
            (this.#activeRequestCountPerSocket.get(req.socket) ?? 0) - 1,
          );

          // If the server is closing and there are no more active requests, destroy the socket.
          if (this.#isShuttingDown && this.#activeRequestCountPerSocket.get(req.socket) === 0) {
            req.socket.destroy();
          }
        });
      });

      this.#server.once('error', (err) => {
        reject(err);
      });

      this.#server.listen(port, resolve);
    });
  }

  /**
   * Gracefully shuts down the server by stopping it from accepting new
   * connections and closing all idle connections. After a specified timeout,
   * all connections will be closed.
   *
   * @param timeout - The timeout in milliseconds. Defaults to `10000`.
   */
  async shutdown(timeout = 10000) {
    if (this.#isShuttingDown) {
      return;
    }
    this.#isShuttingDown = true;

    let timeoutRef: NodeJS.Timeout | null = null;
    try {
      await new Promise<void>((resolve, reject) => {
        // Stops the server from accepting new connections and closes all idle connections.
        this.#server.close((err) => {
          if (err) {
            reject(err);
            return;
          }

          resolve();
        });

        // Some idle connections may not be closed immediately, so we manually close them.
        for (const [socket, count] of this.#activeRequestCountPerSocket.entries()) {
          if (socket.readyState === 'open' && count === 0) {
            socket.destroy();
          }
        }

        timeoutRef = setTimeout(() => {
          this.#server.closeAllConnections();
        }, timeout);
      });
    } finally {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    }
  }

  /**
   * Adds a route with the specified HTTP method, pattern, optional route-level
   * middleware and handler.
   *
   * @param method - The HTTP method to add the route for.
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   *
   * @throws {Error} If the given pattern is invalid.
   */
  route(method: HTTPMethod, pattern: string, ...args: [...Middleware[], Handler]) {
    let handler = args.at(-1) as Handler;
    const middleware = args.slice(0, -1) as Middleware[];

    for (let i = middleware.length - 1; i >= 0; i--) {
      handler = middleware[i](handler);
    }

    const result = this.#router.addRoute(method, pattern, { handler });

    if (result.isErr()) {
      throw result.error;
    }
  }

  /**
   * Adds a `GET` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  get(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('GET', pattern, ...args);
  }

  /**
   * Adds a `HEAD` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  head(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('HEAD', pattern, ...args);
  }

  /**
   * Adds a `PATCH` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  patch(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('PATCH', pattern, ...args);
  }

  /**
   * Adds a `POST` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  post(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('POST', pattern, ...args);
  }

  /**
   * Adds a `PUT` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  put(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('PUT', pattern, ...args);
  }

  /**
   * Adds a `DELETE` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  delete(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('DELETE', pattern, ...args);
  }

  /**
   * Adds a `OPTIONS` route with the specified pattern, optional route-level
   * middleware and handler.
   *
   * @param pattern - The pattern to match the route against.
   * @param args - The middleware and handler to call when the route is matched.
   */
  options(pattern: string, ...args: [...Middleware[], Handler]) {
    this.route('OPTIONS', pattern, ...args);
  }

  /**
   * Adds an application-level middleware to be called for each incoming
   * request regardless of whether it matches a route or not.
   *
   * @param middleware - The middleware to be called for each request.
   */
  use(...middleware: Middleware[]) {
    this.#middleware.push(...middleware);
  }

  /**
   * Sets the handler to call when a route is not found.
   *
   * @param handler - The handler to call when a route is not found.
   */
  set404Handler(handler: Handler) {
    this.#fn404Handler = handler;
  }

  /**
   * Sets the handler to call when an error occurs.
   *
   * @param handler - The handler to call when an error occurs.
   */
  setErrorHandler(handler: ErrorHandler) {
    this.#fnErrorHandler = handler;
  }

  async #dispatch(nodeReq: IncomingMessage, nodeRes: ServerResponse) {
    const req = new Request(nodeReq, this.#options);
    const res = new Response(nodeRes);

    try {
      const route = this.#router.findRoute(req.method, req.pathname);
      if (route) {
        req.set('_params', route.params);
      }

      let handler = route ? route.data.handler : this.#fn404Handler;
      for (let i = this.#middleware.length - 1; i >= 0; i--) {
        handler = this.#middleware[i](handler);
      }

      await handler(req, res);
    } catch (err) {
      try {
        await this.#fnErrorHandler(err, req, res);
      } catch (err) {
        await DEFAULT_ERROR_HANDLER(err, req, res);
      }
    }
  }
}
