import { parse, serialise } from '../src/cookie.js';

describe('parse()', () => {
  test('returns the cookie value when the cookie exists', () => {
    expect(parse('foo=bar', 'foo')).toBe('bar');
  });

  test('returns `null` when the cookie does not exist', () => {
    expect(parse('foo=bar', 'qux')).toBeNull();
  });

  test('returns `null` when the cookie name is invalid', () => {
    expect(parse('foo=bar', 'fo o')).toBeNull();
  });

  test('returns `null` when the cookie value is invalid', () => {
    expect(parse('foo=ba r', 'foo')).toBeNull();
  });

  test('returns the cookie value with double quotes removed', () => {
    expect(parse('foo="bar"', 'foo')).toBe('bar');
  });

  test('returns the cookie value with decoded URI characters', () => {
    expect(parse('foo=ba%20r', 'foo')).toBe('ba r');
  });
});

describe('serialise()', () => {
  test('returns the cookie string when no options are provided', () => {
    expect(serialise('foo', 'bar')).toBe('foo=bar');
  });

  test('returns the cookie string with encoded URI characters', () => {
    expect(serialise('foo', 'ba r', { path: '/foo' })).toBe('foo=ba%20r; Path=/foo');
  });

  test('returns the cookie string with `path` option', () => {
    expect(serialise('foo', 'bar', { path: '/foo' })).toBe('foo=bar; Path=/foo');
  });

  test('returns the cookie string with `domain` option', () => {
    expect(serialise('foo', 'bar', { domain: 'example.com' })).toBe('foo=bar; Domain=example.com');
  });

  test('returns the cookie string with `expires` option', () => {
    expect(serialise('foo', 'bar', { expires: new Date('2025-01-01') })).toBe(
      'foo=bar; Expires=Wed, 01 Jan 2025 00:00:00 GMT',
    );
  });

  describe('returns the cookie string with `maxAge` option', () => {
    test('when `maxAge` is positive', () => {
      expect(serialise('foo', 'bar', { maxAge: 1000 })).toBe('foo=bar; Max-Age=1000');
    });

    test('when `maxAge` is negative', () => {
      expect(serialise('foo', 'bar', { maxAge: -1000 })).toBe('foo=bar; Max-Age=0');
    });

    test('when `maxAge` is `0`', () => {
      expect(serialise('foo', 'bar', { maxAge: 0 })).toBe('foo=bar');
    });
  });

  test('returns the cookie string with `secure` option', () => {
    expect(serialise('foo', 'bar', { secure: true })).toBe('foo=bar; Secure');
  });

  test('returns the cookie string with `httpOnly` option', () => {
    expect(serialise('foo', 'bar', { httpOnly: true })).toBe('foo=bar; HttpOnly');
  });

  describe('returns the cookie string with `sameSite` option', () => {
    test('when `sameSite` is `strict`', () => {
      expect(serialise('foo', 'bar', { sameSite: 'strict' })).toBe('foo=bar; SameSite=Strict');
    });

    test('when `sameSite` is `lax`', () => {
      expect(serialise('foo', 'bar', { sameSite: 'lax' })).toBe('foo=bar; SameSite=Lax');
    });

    test('when `sameSite` is `none`', () => {
      expect(serialise('foo', 'bar', { sameSite: 'none' })).toBe('foo=bar; SameSite=None');
    });
  });

  test('returns the cookie string with multiple options', () => {
    expect(
      serialise('foo', 'bar', {
        path: '/',
        domain: 'example.com',
        secure: true,
        httpOnly: true,
        sameSite: 'none',
      }),
    ).toBe('foo=bar; Path=/; Domain=example.com; Secure; HttpOnly; SameSite=None');
  });
});
