import type { Handler } from '../src/types.js';
import { describeMatrix } from './_setup.js';

describeMatrix('Response', (ctx) => {
  describe('status()', () => {
    test('responds with the status code', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.status(400);
      });

      ctx.app.get('/status', handler);

      const res = await ctx.request('GET', '/status');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(400);
    });

    test('does not overwrite the status code if the response has already been sent', async () => {
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
        res.ok();
      });

      ctx.app.get('/ok', handler);

      const res = await ctx.request('GET', '/ok');

      expect(handler).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe('cookie()', () => {
    test('sets the cookie header', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar');

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar');
    });

    test('does not overwrite the cookie header if the response has already been sent', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar');

        res.ok();

        res.cookie('foo', 'qux');
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar');
    });

    test('sets the cookie header with encoded URI characters', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'ba r');

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=ba%20r');
    });

    test('sets the cookie header with `path` option', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar', { path: '/foo' });

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar; Path=/foo');
    });

    test('sets the cookie header with `domain` option', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar', { domain: 'example.com' });

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar; Domain=example.com');
    });

    test('sets the cookie header with `expires` option', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar', { expires: new Date('2025-01-01') });

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar; Expires=Wed, 01 Jan 2025 00:00:00 GMT');
    });

    describe('sets the cookie header with `maxAge` option', () => {
      test('when `maxAge` is positive', async () => {
        const handler = vi.fn<Handler>((_, res) => {
          res.cookie('foo', 'bar', { maxAge: 1000 });

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toBe('foo=bar; Max-Age=1000');
      });

      test('when `maxAge` is negative', async () => {
        const handler = vi.fn<Handler>((_, res) => {
          res.cookie('foo', 'bar', { maxAge: -1000 });

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toBe('foo=bar; Max-Age=0');
      });

      test('when `maxAge` is `0`', async () => {
        const handler = vi.fn<Handler>((_, res) => {
          res.cookie('foo', 'bar', { maxAge: 0 });

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toBe('foo=bar');
      });
    });

    test('sets the cookie header with `secure` option', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar', { secure: true });

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar; Secure');
    });

    test('sets the cookie header with `httpOnly` option', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar', { httpOnly: true });

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe('foo=bar; HttpOnly');
    });

    describe('sets the cookie header with `sameSite` option', () => {
      test('when `sameSite` is `strict`', async () => {
        const handler = vi.fn<Handler>((_, res) => {
          res.cookie('foo', 'bar', { sameSite: 'strict' });

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toBe('foo=bar; SameSite=Strict');
      });

      test('when `sameSite` is `lax`', async () => {
        const handler = vi.fn<Handler>((_, res) => {
          res.cookie('foo', 'bar', { sameSite: 'lax' });

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toBe('foo=bar; SameSite=Lax');
      });

      test('when `sameSite` is `none`', async () => {
        const handler = vi.fn<Handler>((_, res) => {
          res.cookie('foo', 'bar', { sameSite: 'none' });

          res.ok();
        });

        ctx.app.get('/cookie', handler);

        const res = await ctx.request('GET', '/cookie');

        expect(handler).toHaveBeenCalled();

        expect(res.status).toBe(200);
        expect(res.headers.get('set-cookie')).toBe('foo=bar; SameSite=None');
      });
    });

    test('sets the cookie header with multiple options', async () => {
      const handler = vi.fn<Handler>((_, res) => {
        res.cookie('foo', 'bar', {
          path: '/',
          domain: 'example.com',
          secure: true,
          httpOnly: true,
          sameSite: 'none',
        });

        res.ok();
      });

      ctx.app.get('/cookie', handler);

      const res = await ctx.request('GET', '/cookie');

      expect(handler).toHaveBeenCalled();

      expect(res.status).toBe(200);
      expect(res.headers.get('set-cookie')).toBe(
        'foo=bar; Path=/; Domain=example.com; Secure; HttpOnly; SameSite=None',
      );
    });
  });

  describe('header()', () => {
    test('sets the header', async () => {
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
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
      const handler = vi.fn<Handler>((_, res) => {
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
