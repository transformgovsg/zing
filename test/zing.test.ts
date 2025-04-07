import { HTTPStatusCode } from '../src/http-status-code.js';
import type { ErrorHandler, Handler, HTTPMethod, Middleware } from '../src/types.js';
import { describeMatrix } from './_setup.js';

describeMatrix('Zing', (ctx) => {
  describe('route()', () => {
    test.each<HTTPMethod>(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])(
      'adds a route for the method `%s`',
      async (method) => {
        const handler = vi.fn<Handler>((_, res) => {
          res.ok();
        });

        ctx.app.route(method, '/', handler);

        const res = await ctx.request(method, '/');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('');
      },
    );

    test.each<HTTPMethod>(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])(
      'adds a route for the method `%s` with middleware',
      async (method) => {
        let order = '';

        const mh1 = vi.fn<Handler>();
        const middleware1: Middleware = (next) => {
          return mh1.mockImplementation(async (req, res) => {
            order += '1';
            await next(req, res);
            order += '1';
          });
        };

        const mh2 = vi.fn<Handler>();
        const middleware2: Middleware = (next) => {
          return mh2.mockImplementation(async (req, res) => {
            order += '2';
            await next(req, res);
            order += '2';
          });
        };

        const mh3 = vi.fn<Handler>();
        const middleware3: Middleware = (next) => {
          return mh3.mockImplementation(async (req, res) => {
            order += '3';
            await next(req, res);
            order += '3';
          });
        };

        const handler = vi.fn<Handler>((_, res) => {
          order += '4';
          res.ok();
        });

        ctx.app.route(method, '/', middleware1, middleware2, middleware3, handler);

        const res = await ctx.request(method, '/');

        expect(mh1).toHaveBeenCalled();
        expect(mh2).toHaveBeenCalled();
        expect(mh3).toHaveBeenCalled();
        expect(handler).toHaveBeenCalled();

        expect(order).toBe('1234321');

        expect(res.status).toBe(200);
        expect(await res.text()).toBe('');
      },
    );
  });

  describe('get()', () => {
    test('adds a route for the `GET` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.get('/', handler);

      const res = await ctx.request('GET', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `GET` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.get('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('GET', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('head()', () => {
    test('adds a route for the `HEAD` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.head('/', handler);

      const res = await ctx.request('HEAD', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `HEAD` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.head('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('HEAD', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('patch()', () => {
    test('adds a route for the `PATCH` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.patch('/', handler);

      const res = await ctx.request('PATCH', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `PATCH` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.patch('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('PATCH', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('post()', () => {
    test('adds a route for the `POST` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.post('/', handler);

      const res = await ctx.request('POST', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `POST` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.post('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('POST', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('put()', () => {
    test('adds a route for the `PUT` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.put('/', handler);

      const res = await ctx.request('PUT', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `PUT` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.put('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('PUT', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('delete()', () => {
    test('adds a route for the `DELETE` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.delete('/', handler);

      const res = await ctx.request('DELETE', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `DELETE` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.delete('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('DELETE', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });
  });

  describe('options()', () => {
    test('adds a route for the `OPTIONS` method', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.options('/', handler);

      const res = await ctx.request('OPTIONS', '/');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(await res.text()).toBe('');
    });

    test('adds a route for the `OPTIONS` method with middleware', async () => {
      let order = '';

      const mh1 = vi.fn<Handler>();
      const middleware1: Middleware = (next) => {
        return mh1.mockImplementation(async (req, res) => {
          order += '1';
          await next(req, res);
          order += '1';
        });
      };

      const mh2 = vi.fn<Handler>();
      const middleware2: Middleware = (next) => {
        return mh2.mockImplementation(async (req, res) => {
          order += '2';
          await next(req, res);
          order += '2';
        });
      };

      const mh3 = vi.fn<Handler>();
      const middleware3: Middleware = (next) => {
        return mh3.mockImplementation(async (req, res) => {
          order += '3';
          await next(req, res);
          order += '3';
        });
      };

      const handler = vi.fn<Handler>((_, res) => {
        order += '4';
        res.ok();
      });

      ctx.app.options('/', middleware1, middleware2, middleware3, handler);

      const res = await ctx.request('OPTIONS', '/');

      expect(mh1).toHaveBeenCalled();
      expect(mh2).toHaveBeenCalled();
      expect(mh3).toHaveBeenCalled();
      expect(handler).toHaveBeenCalled();

      expect(order).toBe('1234321');

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
          const handler = vi.fn<Handler>((_, res) => {
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
        const handler = vi.fn<Handler>((_, res) => {
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
          const handler = vi.fn<Handler>(() => {
            throw new Error('Kaboom!');
          });

          ctx.app.route(method, '/kaboom', handler);

          const res = await ctx.request(method, '/kaboom');

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(500);
          expect(res.headers.get('connection')).toBe('close');
          expect(await res.text()).toBe('Internal Server Error');
        },
      );

      test('(HEAD) responds with a `500` status', async () => {
        const handler = vi.fn<Handler>(() => {
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
          const handler = vi.fn<Handler>(() => {
            throw new Error('Kaboom!');
          });

          ctx.app.route(method, '/kaboom', handler);

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
        const handler = vi.fn<Handler>(() => {
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
          const handler = vi.fn<Handler>(() => {
            throw new Error('Kaboom!');
          });

          ctx.app.route(method, '/kaboom', handler);

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
        const handler = vi.fn<Handler>(() => {
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
