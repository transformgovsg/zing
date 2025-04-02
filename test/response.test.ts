import type { RouteHandler } from '../src/types.js';
import { describeMatrix } from './_setup.js';

describeMatrix('Response', (ctx) => {
  describe('status()', () => {
    test('responds with the status code', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.status(400);
      });

      ctx.app.get('/status', handler);

      const res = await ctx.request('GET', '/status');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    test('does not overwrite the status code if the response has already been sent', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.status(400);
        res.status(401);
      });

      ctx.app.get('/status', handler);

      const res = await ctx.request('GET', '/status');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(400);
    });
  });

  describe('ok()', () => {
    test('responds with a `200` status code', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.ok();
      });

      ctx.app.get('/ok', handler);

      const res = await ctx.request('GET', '/ok');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('header()', () => {
    test('sets the header', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.header('x-foo', 'bar');

        res.ok();
      });

      ctx.app.get('/header', handler);

      const res = await ctx.request('GET', '/header');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('x-foo')).toBe('bar');
    });

    test('overwrites the header with the latest value of the same key', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.header('x-foo', 'bar');
        res.header('x-foo', 'qux');

        res.ok();
      });

      ctx.app.get('/header', handler);

      const res = await ctx.request('GET', '/header');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('x-foo')).toBe('qux');
    });

    test('does not overwrite the header with the latest value if the response has already been sent', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.header('x-foo', 'bar');

        res.ok();

        res.header('x-foo', 'qux');
      });

      ctx.app.get('/header', handler);

      const res = await ctx.request('GET', '/header');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('x-foo')).toBe('bar');
    });
  });

  describe('json()', () => {
    test('sends a JSON response', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.json(200, {
          hello: 'world',
          foo: 123,
          bar: false,
          quz: new Date('2024-10-31'),
        });
      });

      ctx.app.get('/json', handler);

      const res = await ctx.request('GET', '/json');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('72');
      expect(await res.text()).toBe(
        '{"hello":"world","foo":123,"bar":false,"quz":"2024-10-31T00:00:00.000Z"}',
      );
    });

    test('sends only the status code if the request method is `HEAD`', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.json(200, {
          hello: 'world',
          foo: 123,
          bar: false,
          quz: new Date('2024-10-31'),
        });
      });

      ctx.app.head('/json', handler);

      const res = await ctx.request('HEAD', '/json');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('72');
      expect(await res.text()).toBe('');
    });
  });

  describe('text()', () => {
    test('sends a text response', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.text(200, 'hello');
      });

      ctx.app.get('/text', handler);

      const res = await ctx.request('GET', '/text');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('5');
      expect(await res.text()).toBe('hello');
    });

    test('sends only the status code if the request method is `HEAD`', async () => {
      const handler = vi.fn<RouteHandler>((_, res) => {
        res.text(200, 'hello');
      });

      ctx.app.head('/text', handler);

      const res = await ctx.request('HEAD', '/text');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('5');
      expect(await res.text()).toBe('');
    });
  });
});
