import type { Handler, HTTPMethod } from '../src/types.js';
import { describeMatrix, describeMatrixWithOptions } from './_setup.js';

describeMatrix('Request', (ctx) => {
  describe('protocol', () => {
    test('returns the protocol', async () => {
      let actualProtocol: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        actualProtocol = req.protocol;

        res.ok();
      });

      ctx.app.route('GET', '/protocol', handler);

      const res = await ctx.request('GET', '/protocol');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualProtocol).toBe('http');
    });
  });

  describe('pathname', () => {
    test('returns the pathname', async () => {
      let actualPathname: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        actualPathname = req.pathname;

        res.ok();
      });

      ctx.app.get('/pathname', handler);

      const res = await ctx.request('GET', '/pathname');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualPathname).toBe('/pathname');
    });
  });

  describe('method', () => {
    test.each<HTTPMethod>(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'])(
      'returns the HTTP method (%s)',
      async (method) => {
        let actualMethod: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualMethod = req.method;

          res.ok();
        });

        ctx.app.route(method, `/${method}`, handler);

        const res = await ctx.request(method, `/${method}`);

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualMethod).toBe(method);
      },
    );
  });

  describe('get()', () => {
    describe('when the key is set', () => {
      test('returns the value', async () => {
        let actualValue: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          req.set('foo', 'bar');
          actualValue = req.get('foo');

          res.ok();
        });

        ctx.app.get('/kv', handler);

        const res = await ctx.request('GET', '/kv');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualValue).toBe('bar');
      });

      test('returns the value even if the default value is provided', async () => {
        let actualValue: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          req.set('foo', 'bar');
          actualValue = req.get('foo', 'qux');

          res.ok();
        });

        ctx.app.get('/kv', handler);

        const res = await ctx.request('GET', '/kv');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualValue).toBe('bar');
      });
    });

    describe('when the key is not set', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualValue: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualValue = req.get('foo');

          res.ok();
        });

        ctx.app.get('/kv', handler);

        const res = await ctx.request('GET', '/kv');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualValue).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualValue: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualValue = req.get('foo', 'bar');

          res.ok();
        });

        ctx.app.get('/kv', handler);

        const res = await ctx.request('GET', '/kv');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualValue).toBe('bar');
      });
    });
  });

  describe('set()', () => {
    test('removes the key if the value is `undefined`', async () => {
      let actualValue: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        req.set('foo', 'bar');
        req.set('foo', undefined);
        actualValue = req.get('foo');

        res.ok();
      });

      ctx.app.get('/kv', handler);

      const res = await ctx.request('GET', '/kv');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualValue).toBeNull();
    });

    test('removes the key if the value is `null`', async () => {
      let actualValue: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        req.set('foo', 'bar');
        req.set('foo', null);
        actualValue = req.get('foo');

        res.ok();
      });

      ctx.app.get('/kv', handler);

      const res = await ctx.request('GET', '/kv');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualValue).toBeNull();
    });
  });

  describe('cookie()', () => {
    describe('when the cookie exists', () => {
      test('returns the cookie value', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualCookie = req.cookie('foo');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie', {
          headers: {
            cookie: 'foo=bar',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBe('bar');
      });

      test('returns the cookie value even if the default value is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualCookie = req.cookie('foo', 'qux');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie', {
          headers: {
            cookie: 'foo=bar',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBe('bar');
      });
    });

    describe('when the cookie does not exist', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualCookie = req.cookie('foo');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualCookie = req.cookie('foo', 'bar');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBe('bar');
      });
    });

    describe('when the cookie name is invalid', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          // Use an invalid cookie name (contains ' ').
          actualCookie = req.cookie('fo o');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie', {
          headers: {
            cookie: 'fo o=bar',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          // Use an invalid cookie name (contains ' ').
          actualCookie = req.cookie('fo o', 'qux');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie', {
          headers: {
            cookie: 'fo o=bar',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBe('qux');
      });
    });

    describe('when the cookie value is invalid', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualCookie = req.cookie('foo');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie', {
          headers: {
            cookie: 'foo=ba r',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualCookie: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualCookie = req.cookie('foo', 'qux');

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie', {
          headers: {
            cookie: 'foo=ba r',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualCookie).toBe('qux');
      });
    });

    test('returns the cookie value with decoded URI characters', async () => {
      let actualCookie: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        actualCookie = req.cookie('foo');

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie', {
        headers: {
          cookie: 'foo=ba%20r',
        },
      });

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualCookie).toBe('ba r');
    });

    test('returns the cookie value with double quotes removed', async () => {
      let actualCookie: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        actualCookie = req.cookie('foo');

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie', {
        headers: {
          cookie: 'foo="bar"',
        },
      });

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualCookie).toBe('bar');
    });
  });

  describe('param()', () => {
    describe('when the parameter exists', () => {
      test('returns the parameter value', async () => {
        let actualParam: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualParam = req.param('foo');

          res.ok();
        });

        ctx.app.get('/param/:foo', handler);

        const res = await ctx.request('GET', '/param/bar');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualParam).toBe('bar');
      });

      test('returns the parameter value even if the default value is provided', async () => {
        let actualParam: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualParam = req.param('foo', 'qux');

          res.ok();
        });

        ctx.app.get('/param/:foo', handler);

        const res = await ctx.request('GET', '/param/bar');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualParam).toBe('bar');
      });
    });

    describe('when the parameter does not exist', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualParam: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualParam = req.param('foo');

          res.ok();
        });

        ctx.app.get('/param', handler);

        const res = await ctx.request('GET', '/param');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualParam).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualParam: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualParam = req.param('foo', 'bar');

          res.ok();
        });

        ctx.app.get('/param', handler);

        const res = await ctx.request('GET', '/param');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualParam).toBe('bar');
      });
    });
  });

  describe('query()', () => {
    describe('when the query exists', () => {
      test('returns the query value', async () => {
        let actualQuery: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQuery = req.query('foo');

          res.ok();
        });

        ctx.app.get('/query', handler);

        const res = await ctx.request('GET', '/query?foo=bar');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQuery).toBe('bar');
      });

      test('returns the query value even if the default value is provided', async () => {
        let actualQuery: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQuery = req.query('foo', 'qux');

          res.ok();
        });

        ctx.app.get('/query', handler);

        const res = await ctx.request('GET', '/query?foo=bar');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQuery).toBe('bar');
      });
    });

    describe('when the query does not exist', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualQuery: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQuery = req.query('foo');

          res.ok();
        });

        ctx.app.get('/query', handler);

        const res = await ctx.request('GET', '/query');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQuery).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualQuery: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQuery = req.query('foo', 'bar');

          res.ok();
        });

        ctx.app.get('/query', handler);

        const res = await ctx.request('GET', '/query');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQuery).toBe('bar');
      });
    });

    test('returns the value of the first occurrence of the query name', async () => {
      let actualQuery: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        actualQuery = req.query('foo');

        res.ok();
      });

      ctx.app.get('/query', handler);

      const res = await ctx.request('GET', '/query?foo=bar&foo=baz');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualQuery).toBe('bar');
    });
  });

  describe('queries()', () => {
    describe('when the query exists', () => {
      test('returns the query values', async () => {
        let actualQueries: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQueries = req.queries('foo');

          res.ok();
        });

        ctx.app.get('/queries', handler);

        const res = await ctx.request('GET', '/queries?foo=bar&foo=qux');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQueries).toEqual(['bar', 'qux']);
      });

      test('returns the query values even if the default value is provided', async () => {
        let actualQueries: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQueries = req.queries('foo', ['qux', '123']);

          res.ok();
        });

        ctx.app.get('/queries', handler);

        const res = await ctx.request('GET', '/queries?foo=bar&foo=qux');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQueries).toEqual(['bar', 'qux']);
      });
    });

    describe('when the query does not exist', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualQueries: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQueries = req.queries('foo');

          res.ok();
        });

        ctx.app.get('/queries', handler);

        const res = await ctx.request('GET', '/queries');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQueries).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualQueries: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualQueries = req.queries('foo', ['bar', 'qux']);

          res.ok();
        });

        ctx.app.get('/queries', handler);

        const res = await ctx.request('GET', '/queries');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualQueries).toEqual(['bar', 'qux']);
      });
    });
  });

  describe('header()', () => {
    describe('when the header exists', () => {
      test('returns the header value', async () => {
        let actualHeader: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualHeader = req.header('foo');

          res.ok();
        });

        ctx.app.get('/header', handler);

        const res = await ctx.request('GET', '/header', {
          headers: {
            foo: 'bar',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualHeader).toBe('bar');
      });

      test('returns the header value even if it is an array', async () => {
        let actualHeader: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualHeader = req.header('foo', 'qux');

          res.ok();
        });

        ctx.app.get('/header', handler);

        const res = await ctx.request('GET', '/header', {
          headers: {
            foo: 'bar',
          },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualHeader).toBe('bar');
      });
    });

    describe('when the header does not exist', () => {
      test('returns `null` if no default value is provided', async () => {
        let actualHeader: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualHeader = req.header('foo');

          res.ok();
        });

        ctx.app.get('/header', handler);

        const res = await ctx.request('GET', '/header');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualHeader).toBeNull();
      });

      test('returns the default value if it is provided', async () => {
        let actualHeader: unknown;

        const handler = vi.fn<Handler>((req, res) => {
          actualHeader = req.header('foo', 'bar');

          res.ok();
        });

        ctx.app.get('/header', handler);

        const res = await ctx.request('GET', '/header');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualHeader).toBe('bar');
      });
    });

    test('combines the values of the `set-cookie` header', async () => {
      let actualHeader: unknown;

      const handler = vi.fn<Handler>((req, res) => {
        actualHeader = req.header('set-cookie');

        res.ok();
      });

      ctx.app.get('/header', handler);

      const headers = new Headers();
      headers.append('set-cookie', 'foo=bar');
      headers.append('set-cookie', 'qux=123');

      const res = await ctx.request('GET', '/header', { headers });

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(actualHeader).toBe('foo=bar, qux=123');
    });
  });

  describe('body()', () => {
    test.each<HTTPMethod>(['PATCH', 'POST', 'PUT'])(
      'returns the body for HTTP method (%s)',
      async (method) => {
        let actualBody: unknown;

        const handler = vi.fn<Handler>(async (req, res) => {
          const result = await req.body();
          actualBody = result.unwrap();

          res.ok();
        });

        ctx.app.route(method, '/body', handler);

        const res = await ctx.request(method, '/body', {
          body: 'foobar',
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualBody).toEqual(new TextEncoder().encode('foobar'));
      },
    );

    describe('when the request content is too large', () => {
      test(
        'responds with a `413` status code',
        {
          // Retrying helps handle intermittent `fetch` errors (like `ECONNRESET` or `EPIPE`) that
          // can occur when the server closes the connection due to an error when parsing the
          // request body before `fetch` finishes transmitting the large request body.
          retry: 2,
        },
        async () => {
          let actualBody: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.body();
            actualBody = result.unwrap();

            res.ok();
          });

          ctx.app.post('/body', handler);

          const res = await ctx.request('POST', '/body', {
            body: 'a' + 'a'.repeat(1024 * 1024),
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(413);
          expect(res.headers.get('connection')).toBe('close');
          expect(actualBody).toBeUndefined();
        },
      );
    });
  });

  describe('text()', () => {
    test.each<HTTPMethod>(['PATCH', 'POST', 'PUT'])(
      'returns the parsed text for HTTP method (%s)',
      async (method) => {
        let actualText: unknown;

        const handler = vi.fn<Handler>(async (req, res) => {
          const result = await req.text();
          actualText = result.unwrap();

          res.ok();
        });

        ctx.app.route(method, '/text', handler);

        const res = await ctx.request(method, '/text', {
          body: 'foobar',
          headers: { 'content-type': 'text/plain' },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualText).toEqual('foobar');
      },
    );

    describe('when the request content is too large', () => {
      test(
        'responds with a `413` status code',
        {
          // Retrying helps handle intermittent `fetch` errors (like `ECONNRESET` or `EPIPE`) that
          // can occur when the server closes the connection due to an error when parsing the
          // request body before `fetch` finishes transmitting the large request body.
          retry: 2,
        },
        async () => {
          let actualText: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.text();
            actualText = result.unwrap();

            res.ok();
          });

          ctx.app.post('/text', handler);

          const res = await ctx.request('POST', '/text', {
            body: 'a' + 'a'.repeat(1024 * 1024),
            headers: { 'content-type': 'text/plain' },
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(413);
          expect(res.headers.get('connection')).toBe('close');
          expect(actualText).toBeUndefined();
        },
      );
    });

    describe('when the content type is not supported', () => {
      test('responds with a `415` status code', async () => {
        let actualText: unknown;

        const handler = vi.fn<Handler>(async (req, res) => {
          const result = await req.text();
          actualText = result.unwrap();

          res.ok();
        });

        ctx.app.post('/text', handler);

        const res = await ctx.request('POST', '/text', {
          body: 'foobar',
          headers: { 'content-type': 'application/json' },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(415);
        expect(res.headers.get('connection')).toBe('close');
        expect(actualText).toBeUndefined();
      });
    });
  });

  describe('json()', () => {
    test.each<HTTPMethod>(['PATCH', 'POST', 'PUT'])(
      'returns the parsed JSON for HTTP method (%s)',
      async (method) => {
        let actualJSON: unknown;

        const handler = vi.fn<Handler>(async (req, res) => {
          const result = await req.json();
          actualJSON = result.unwrap();

          res.ok();
        });

        ctx.app.route(method, '/json', handler);

        const res = await ctx.request(method, '/json', {
          body: { foo: 'bar' },
          headers: { 'content-type': 'application/json' },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(actualJSON).toEqual({ foo: 'bar' });
      },
    );

    describe('when the request content is too large', () => {
      test(
        'responds with a `413` status code',
        {
          // Retrying helps handle intermittent `fetch` errors (like `ECONNRESET` or `EPIPE`) that
          // can occur when the server closes the connection due to an error when parsing the
          // request body before `fetch` finishes transmitting the large request body.
          retry: 2,
        },
        async () => {
          let actualJSON: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.json();
            actualJSON = result.unwrap();

            res.ok();
          });

          ctx.app.post('/json', handler);

          const res = await ctx.request('POST', '/json', {
            body: { foo: 'a'.repeat(1024 * 1024) },
            headers: { 'content-type': 'application/json' },
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(413);
          expect(res.headers.get('connection')).toBe('close');
          expect(actualJSON).toBeUndefined();
        },
      );
    });

    describe('when the content type is not supported', () => {
      test('responds with a `415` status code', async () => {
        let actualJSON: unknown;

        const handler = vi.fn<Handler>(async (req, res) => {
          const result = await req.json();
          actualJSON = result.unwrap();

          res.ok();
        });

        ctx.app.post('/json', handler);

        const res = await ctx.request('POST', '/json', {
          body: { foo: 'bar' },
          headers: { 'content-type': 'text/plain' },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(415);
        expect(res.headers.get('connection')).toBe('close');
        expect(actualJSON).toBeUndefined();
      });
    });

    describe('when the JSON is malformed', () => {
      test('responds with a `422` status code', async () => {
        let actualJSON: unknown;

        const handler = vi.fn<Handler>(async (req, res) => {
          const result = await req.json();
          actualJSON = result.unwrap();

          res.ok();
        });

        ctx.app.post('/json', handler);

        const res = await ctx.request('POST', '/json', {
          body: '{ foo: "bar" }',
          headers: { 'content-type': 'application/json' },
        });

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(422);
        expect(res.headers.get('connection')).toBe('close');
        expect(actualJSON).toBeUndefined();
      });
    });
  });
});

describeMatrixWithOptions(
  'Request with custom `maxBodySize` option',
  { maxBodySize: 100 },
  (ctx) => {
    describe('body()', () => {
      test.each<HTTPMethod>(['PATCH', 'POST', 'PUT'])(
        'returns the body for HTTP method (%s)',
        async (method) => {
          let actualBody: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.body();
            actualBody = result.unwrap();

            res.ok();
          });

          ctx.app.route(method, '/body', handler);

          const res = await ctx.request(method, '/body', {
            body: 'a' + 'a'.repeat(99),
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(200);
          expect(actualBody).toEqual(new TextEncoder().encode('a' + 'a'.repeat(99)));
        },
      );

      describe('when the request content is too large', () => {
        test('responds with a `413` status code', async () => {
          let actualBody: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.body();
            actualBody = result.unwrap();

            res.ok();
          });

          ctx.app.post('/body', handler);

          const res = await ctx.request('POST', '/body', {
            body: 'a' + 'a'.repeat(100),
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(413);
          expect(res.headers.get('connection')).toBe('close');
          expect(actualBody).toBeUndefined();
        });
      });
    });

    describe('text()', () => {
      test.each<HTTPMethod>(['PATCH', 'POST', 'PUT'])(
        'returns the parsed text for HTTP method (%s)',
        async (method) => {
          let actualText: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.text();
            actualText = result.unwrap();

            res.ok();
          });

          ctx.app.route(method, '/text', handler);

          const res = await ctx.request(method, '/text', {
            body: 'a' + 'a'.repeat(99),
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(200);
          expect(actualText).toBe('a' + 'a'.repeat(99));
        },
      );

      describe('when the request content is too large', () => {
        test('responds with a `413` status code', async () => {
          let actualText: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.text();
            actualText = result.unwrap();

            res.ok();
          });

          ctx.app.post('/text', handler);

          const res = await ctx.request('POST', '/text', {
            body: 'a' + 'a'.repeat(100),
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(413);
          expect(res.headers.get('connection')).toBe('close');
          expect(actualText).toBeUndefined();
        });
      });
    });

    describe('json()', () => {
      test.each<HTTPMethod>(['PATCH', 'POST', 'PUT'])(
        'returns the parsed JSON for HTTP method (%s)',
        async (method) => {
          let actualJSON: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.json();
            actualJSON = result.unwrap();

            res.ok();
          });

          ctx.app.route(method, '/json', handler);

          const res = await ctx.request(method, '/json', {
            body: { foo: 'bar' },
            headers: { 'content-type': 'application/json' },
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(200);
          expect(actualJSON).toEqual({ foo: 'bar' });
        },
      );

      describe('when the request content is too large', () => {
        test('responds with a `413` status code', async () => {
          let actualJSON: unknown;

          const handler = vi.fn<Handler>(async (req, res) => {
            const result = await req.json();
            actualJSON = result.unwrap();

            res.ok();
          });

          ctx.app.post('/json', handler);

          const res = await ctx.request('POST', '/json', {
            body: { foo: 'a'.repeat(100) },
            headers: { 'content-type': 'application/json' },
          });

          expect(handler).toHaveBeenCalled();

          expect(res.status).toBe(413);
          expect(res.headers.get('connection')).toBe('close');
          expect(actualJSON).toBeUndefined();
        });
      });
    });
  },
);
