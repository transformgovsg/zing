import { ERR, OK } from '../src/result.js';

describe('OK', () => {
  describe('isOk()', () => {
    test('returns `true`', () => {
      const result = OK(1);
      expect(result.isOk()).toBe(true);
    });
  });

  describe('isErr()', () => {
    test('returns `false`', () => {
      const result = OK(1);
      expect(result.isErr()).toBe(false);
    });
  });

  describe('unwrap()', () => {
    test('returns the value', () => {
      const result = OK(1);
      expect(result.unwrap()).toBe(1);
    });
  });

  describe('unwrapOr()', () => {
    test('returns the value', () => {
      const result = OK(1);
      expect(result.unwrapOr(2)).toBe(1);
    });
  });
});

describe('ERR', () => {
  describe('isOk()', () => {
    test('returns `false`', () => {
      const result = ERR(new Error('foobar'));
      expect(result.isOk()).toBe(false);
    });
  });

  describe('isErr()', () => {
    test('returns `true`', () => {
      const result = ERR(new Error('foobar'));
      expect(result.isErr()).toBe(true);
    });
  });

  describe('unwrap()', () => {
    test('throws the error', () => {
      const result = ERR(new Error('foobar'));
      expect(() => result.unwrap()).toThrow('foobar');
    });
  });

  describe('unwrapOr()', () => {
    test('returns the default value', () => {
      const result = ERR(new Error('foobar'));
      expect(result.unwrapOr(2)).toBe(2);
    });
  });
});
