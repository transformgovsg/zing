import { HTTPStatusCode } from '../src/http-status-code.js';
import type { ErrorHandler, HTTPMethod, RouteHandler } from '../src/types.js';
import { describeMatrix } from './_setup.js';

describeMatrix('Zing', (ctx) => {
  describe('addRoute()', () => {
    test.each<HTTPMethod>(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])(
      'adds a route for the method `%s`',
      async (method) => {
        const handler = vi.fn<RouteHandler>((_, res) => {
          res.ok();
        });

        ctx.app.addRoute(method, '/', handler);

        const res = await ctx.request(method, '/');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('');
      },
    );
  });

  describe('get()', () => {
    test('adds a route for the `GET` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.get('/', handler);

      const res = await ctx.request('GET', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('head()', () => {
    test('adds a route for the `HEAD` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.head('/', handler);

      const res = await ctx.request('HEAD', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('patch()', () => {
    test('adds a route for the `PATCH` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.patch('/', handler);

      const res = await ctx.request('PATCH', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('post()', () => {
    test('adds a route for the `POST` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.post('/', handler);

      const res = await ctx.request('POST', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('put()', () => {
    test('adds a route for the `PUT` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.put('/', handler);

      const res = await ctx.request('PUT', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('delete()', () => {
    test('adds a route for the `DELETE` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.delete('/', handler);

      const res = await ctx.request('DELETE', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('options()', () => {
    test('adds a route for the `OPTIONS` method', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.options('/', handler);

      const res = await ctx.request('OPTIONS', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('set404Handler()', () => {
    describe('default 404 handler', () => {
      test.each<HTTPMethod>(['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'])(
        '(%s) responds with a `404` status',
        async (method) => {
          const res = await ctx.request(method, '/404');

          expect(res.status).toBe(404);
          expect(await res.text()).toBe('Not Found');
        },
      );

      test('(HEAD) responds with a `404` status', async () => {
        const res = await ctx.request('HEAD', '/404');

        expect(res.status).toBe(404);
        expect(await res.text()).toBe('');
      });
    });

    describe('custom 404 handler', () => {
      test.each<HTTPMethod>(['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'])(
        '(%s) responds with a `404` status',
        async (method) => {
          const handler = vi.fn<RouteHandler>((_, res) => {
            res.json(HTTPStatusCode.NotFound, { message: 'This is a custom 404 handler.' });
          });

          ctx.app.set404Handler(handler);

          const res = await ctx.request(method, `/404`);

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(404);
          expect(await res.text()).toBe('{"message":"This is a custom 404 handler."}');
        },
      );

      test('(HEAD) responds with a `404` status', async () => {
        const handler = vi.fn<RouteHandler>((_, res) => {
          res.json(HTTPStatusCode.NotFound, { message: 'Not found' });
        });

        ctx.app.set404Handler(handler);

        const res = await ctx.request('HEAD', '/404');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(404);
        expect(await res.text()).toBe('');
      });
    });
  });

  describe('setErrorHandler()', () => {
    describe('default error handler', () => {
      test.each<HTTPMethod>(['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'])(
        '(%s) responds with a `500` status',
        async (method) => {
          const handler = vi.fn<RouteHandler>(() => {
            throw new Error('Kaboom!');
          });

          ctx.app.addRoute(method, '/kaboom', handler);

          const res = await ctx.request(method, '/kaboom');

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(500);
          expect(res.headers.get('connection')).toBe('close');
          expect(await res.text()).toBe('Internal Server Error');
        },
      );

      test('(HEAD) responds with a `500` status', async () => {
        const handler = vi.fn<RouteHandler>(() => {
          throw new Error('Kaboom!');
        });

        ctx.app.head('/kaboom', handler);

        const res = await ctx.request('HEAD', '/kaboom');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(500);
        expect(res.headers.get('connection')).toBe('close');
        expect(await res.text()).toBe('');
      });
    });

    describe('custom error handler', () => {
      test.each<HTTPMethod>(['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'])(
        '(%s) responds with a `500` status',
        async (method) => {
          const handler = vi.fn<RouteHandler>(() => {
            throw new Error('Kaboom!');
          });

          ctx.app.addRoute(method, '/kaboom', handler);

          const errorHandler = vi.fn<ErrorHandler>((_err, _req, res) => {
            res.json(HTTPStatusCode.InternalServerError, {
              message: 'This is a custom error handler.',
            });
          });

          ctx.app.setErrorHandler(errorHandler);

          const res = await ctx.request(method, '/kaboom');

          expect(handler).toHaveBeenCalled();
          expect(errorHandler).toHaveBeenCalled();

          expect(res.status).toBe(500);
          expect(res.headers.get('connection')).toBe('keep-alive');
          expect(await res.text()).toBe('{"message":"This is a custom error handler."}');
        },
      );

      test('(HEAD) responds with a `500` status', async () => {
        const handler = vi.fn<RouteHandler>(() => {
          throw new Error('Kaboom!');
        });

        ctx.app.head('/kaboom', handler);

        const errorHandler = vi.fn<ErrorHandler>((_err, _req, res) => {
          res.json(HTTPStatusCode.InternalServerError, {
            message: 'This is a custom error handler.',
          });
        });

        ctx.app.setErrorHandler(errorHandler);

        const res = await ctx.request('HEAD', '/kaboom');

        expect(handler).toHaveBeenCalled();
        expect(errorHandler).toHaveBeenCalled();

        expect(res.status).toBe(500);
        expect(res.headers.get('connection')).toBe('close');
        expect(await res.text()).toBe('');
      });
    });

    describe('when kaboom again in custom error handler', () => {
      test.each<HTTPMethod>(['GET', 'PATCH', 'POST', 'PUT', 'DELETE', 'OPTIONS'])(
        '(%s) responds with a `500` status',
        async (method) => {
          const handler = vi.fn<RouteHandler>(() => {
            throw new Error('Kaboom!');
          });

          ctx.app.addRoute(method, '/kaboom', handler);

          const errorHandler = vi.fn<ErrorHandler>(() => {
            throw new Error('Kaboom again!');
          });

          ctx.app.setErrorHandler(errorHandler);

          const res = await ctx.request(method, '/kaboom');

          expect(handler).toHaveBeenCalled();
          expect(errorHandler).toHaveBeenCalled();

          expect(res.status).toBe(500);
          expect(res.headers.get('connection')).toBe('close');
          expect(await res.text()).toBe('Internal Server Error');
        },
      );

      test('(HEAD) responds with a `500` status', async () => {
        const handler = vi.fn<RouteHandler>(() => {
          throw new Error('Kaboom!');
        });

        ctx.app.head('/kaboom', handler);

        const errorHandler = vi.fn<ErrorHandler>(() => {
          throw new Error('Kaboom again!');
        });

        ctx.app.setErrorHandler(errorHandler);

        const res = await ctx.request('HEAD', '/kaboom');

        expect(handler).toHaveBeenCalled();
        expect(errorHandler).toHaveBeenCalled();

        expect(res.status).toBe(500);
        expect(res.headers.get('connection')).toBe('close');
        expect(await res.text()).toBe('');
      });
    });
  });
});
