import Router, { indexAny, indexCommonPrefix, Node } from '../src/router.js';

describe('Node', () => {
  test('initialises a new node with default values', () => {
    const node = new Node();

    expect(node.type).toBe('static');
    expect(node.fragment).toBe('');
    expect(node.indicies).toBe('');
    expect(node.children).toEqual([]);
    expect(node.name).toBeNull();
    expect(node.data).toBeNull();
  });

  describe('createChild()', () => {
    test('creates a static child node if given a regular character', () => {
      const node = new Node();
      const child = node.createChild('a');

      expect(node.indicies).toBe('a');
      expect(node.children).toEqual([child]);

      expect(child.type).toBe('static');
      expect(child.fragment).toBe('');
      expect(child.indicies).toBe('');
      expect(child.children).toEqual([]);
      expect(child.name).toBeNull();
      expect(child.data).toBeNull();
    });

    test('creates a dynamic child node if given a colon character', () => {
      const node = new Node();
      const child = node.createChild(':');

      expect(node.indicies).toBe(':');
      expect(node.children).toEqual([child]);

      expect(child.type).toBe('dynamic');
      expect(child.fragment).toBe('');
      expect(child.indicies).toBe('');
      expect(child.children).toEqual([]);
      expect(child.name).toBeNull();
      expect(child.data).toBeNull();
    });

    test('creates a catch-all child node if given an asterisk character', () => {
      const node = new Node();
      const child = node.createChild('*');

      expect(node.indicies).toBe('*');
      expect(node.children).toEqual([child]);

      expect(child.type).toBe('catch-all');
      expect(child.fragment).toBe('');
      expect(child.indicies).toBe('');
      expect(child.children).toEqual([]);
      expect(child.name).toBeNull();
      expect(child.data).toBeNull();
    });
  });

  describe('findChild()', () => {
    test('returns the child node that matches the given character', () => {
      const node = new Node();
      const child = node.createChild('a');

      expect(node.findChild('a')).toBe(child);
    });

    test('returns `null` if no child node matches the given character', () => {
      const node = new Node();

      expect(node.findChild('a')).toBeNull();
    });
  });

  describe('stringify()', () => {
    test('returns a human-readable string representation of the node and its children', () => {
      const node = new Node({ fragment: '/' });

      const staticChild = node.createChild('f');
      staticChild.fragment = 'foo';
      staticChild.data = true;

      const dynamicChild = node.createChild(':');
      dynamicChild.fragment = ':bar';
      dynamicChild.name = 'bar';
      dynamicChild.data = true;

      const catchAllChild = node.createChild('*');
      catchAllChild.fragment = '*qux';
      catchAllChild.name = 'qux';
      catchAllChild.data = true;

      expect(node.stringify()).toMatchInlineSnapshot(`
        "
        └── /, type=static, indicies=[f, :, *], data=N
            ├── foo, type=static, data=Y
            ├── :bar, type=dynamic, name=bar, data=Y
            └── *qux, type=catch-all, name=qux, data=Y
        "
      `);
    });
  });
});

describe('Router', () => {
  describe('addRoute()', () => {
    test('correctly builds the router with multiple static patterns', () => {
      const router = new Router();

      router.addRoute('GET', '/one', true);
      router.addRoute('GET', '/one/', true);
      router.addRoute('GET', '/two', true);
      router.addRoute('GET', '/three', true);
      router.addRoute('GET', '/users/me', true);
      router.addRoute('GET', '/users/me/profile', true);
      router.addRoute('GET', '/static/js/preview.js', true);

      expect(router.stringify()).toMatchInlineSnapshot(`
        "
        GET
        └── /, type=static, indicies=[o, t, u, s], data=N
            ├── one, type=static, indicies=[/], data=Y
            │   └── /, type=static, data=Y
            ├── t, type=static, indicies=[w, h], data=N
            │   ├── wo, type=static, data=Y
            │   └── hree, type=static, data=Y
            ├── users/me, type=static, indicies=[/], data=Y
            │   └── /profile, type=static, data=Y
            └── static/js/preview.js, type=static, data=Y
        "
      `);
    });

    test('correctly builds the router with multiple dynamic patterns', () => {
      const router = new Router();

      router.addRoute('GET', '/users/:id', true);
      router.addRoute('GET', '/users/:id/profile', true);
      router.addRoute('GET', '/invoices/:id/pay', true);
      router.addRoute('GET', '/invoices/:id/refund', true);
      router.addRoute('GET', '/invoices/:id', true);

      expect(router.stringify()).toMatchInlineSnapshot(`
        "
        GET
        └── /, type=static, indicies=[u, i], data=N
            ├── users/, type=static, indicies=[:], data=N
            │   └── :, type=dynamic, indicies=[/], name=id, data=Y
            │       └── /profile, type=static, data=Y
            └── invoices/, type=static, indicies=[:], data=N
                └── :, type=dynamic, indicies=[/], name=id, data=Y
                    └── /, type=static, indicies=[p, r], data=N
                        ├── pay, type=static, data=Y
                        └── refund, type=static, data=Y
        "
      `);
    });

    test('correctly builds the router with multiple catch-all patterns', () => {
      const router = new Router();

      router.addRoute('GET', '/static/js/*filepath', true);
      router.addRoute('GET', '/static/css/*filepath', true);

      expect(router.stringify()).toMatchInlineSnapshot(`
        "
        GET
        └── /static/, type=static, indicies=[j, c], data=N
            ├── js/, type=static, indicies=[*], data=N
            │   └── *, type=catch-all, name=filepath, data=Y
            └── css/, type=static, indicies=[*], data=N
                └── *, type=catch-all, name=filepath, data=Y
        "
      `);
    });

    test('correctly builds the router with a mixture of static, dynamic and catch-all patterns', () => {
      const router = new Router();

      router.addRoute('GET', '/one', true);
      router.addRoute('GET', '/one/', true);
      router.addRoute('GET', '/two', true);
      router.addRoute('GET', '/three', true);
      router.addRoute('GET', '/users/me', true);
      router.addRoute('GET', '/users/me/profile', true);
      router.addRoute('GET', '/static/js/preview.js', true);

      router.addRoute('GET', '/users/:id', true);
      router.addRoute('GET', '/users/:id/profile', true);
      router.addRoute('GET', '/invoices/:id/pay', true);
      router.addRoute('GET', '/invoices/:id/refund', true);
      router.addRoute('GET', '/invoices/:id', true);

      router.addRoute('GET', '/static/js/*filepath', true);
      router.addRoute('GET', '/static/css/*filepath', true);

      router.addRoute('GET', '/static/media/:type/*filepath', true);
      router.addRoute('GET', '/*splat', true);

      expect(router.stringify()).toMatchInlineSnapshot(`
        "
        GET
        └── /, type=static, indicies=[o, t, u, s, i, *], data=N
            ├── one, type=static, indicies=[/], data=Y
            │   └── /, type=static, data=Y
            ├── t, type=static, indicies=[w, h], data=N
            │   ├── wo, type=static, data=Y
            │   └── hree, type=static, data=Y
            ├── users/, type=static, indicies=[m, :], data=N
            │   ├── me, type=static, indicies=[/], data=Y
            │   │   └── /profile, type=static, data=Y
            │   └── :, type=dynamic, indicies=[/], name=id, data=Y
            │       └── /profile, type=static, data=Y
            ├── static/, type=static, indicies=[j, c, m], data=N
            │   ├── js/, type=static, indicies=[p, *], data=N
            │   │   ├── preview.js, type=static, data=Y
            │   │   └── *, type=catch-all, name=filepath, data=Y
            │   ├── css/, type=static, indicies=[*], data=N
            │   │   └── *, type=catch-all, name=filepath, data=Y
            │   └── media/, type=static, indicies=[:], data=N
            │       └── :, type=dynamic, indicies=[/], name=type, data=N
            │           └── /, type=static, indicies=[*], data=N
            │               └── *, type=catch-all, name=filepath, data=Y
            ├── invoices/, type=static, indicies=[:], data=N
            │   └── :, type=dynamic, indicies=[/], name=id, data=Y
            │       └── /, type=static, indicies=[p, r], data=N
            │           ├── pay, type=static, data=Y
            │           └── refund, type=static, data=Y
            └── *, type=catch-all, name=splat, data=Y
        "
      `);
    });

    test('returns an error if a dynamic parameter is not named', () => {
      const router = new Router();

      const result = router.addRoute('GET', '/foo/:', true);
      expect(result.isErr()).toBe(true);
      expect(result.isErr() && result.error).toBeInstanceOf(Error);
      expect(result.isErr() && result.error.message).toBe('Dynamic parameter must have a name.');
    });

    test('returns an error if a catch-all parameter is not named', () => {
      const router = new Router();

      const result = router.addRoute('GET', '/foo/*', true);
      expect(result.isErr()).toBe(true);
      expect(result.isErr() && result.error).toBeInstanceOf(Error);
      expect(result.isErr() && result.error.message).toBe('Catch-all parameter must have a name.');
    });

    test('returns an error if a catch-all parameter is not the last path segment', () => {
      const router = new Router();

      const result = router.addRoute('GET', '/foo/*bar/qux', true);
      expect(result.isErr()).toBe(true);
      expect(result.isErr() && result.error).toBeInstanceOf(Error);
      expect(result.isErr() && result.error.message).toBe(
        'Catch-all parameter must be the last path segment.',
      );
    });

    test.each<string>(['/foo/:bar:qux', '/foo/:bar*qux', '/foo/*bar*qux', '/foo/*bar:qux'])(
      'returns an error if multiple parameters are in the same path segment: %s',
      (pattern) => {
        const router = new Router();

        const result = router.addRoute('GET', pattern, true);
        expect(result.isErr()).toBe(true);
        expect(result.isErr() && result.error).toBeInstanceOf(Error);
        expect(result.isErr() && result.error.message).toBe(
          'Only one dynamic or catch-all parameter is allowed per path segment.',
        );
      },
    );
  });

  describe('findRoute()', () => {
    test('correctly finds a route with multiple static pathnames', () => {
      const router = new Router();

      router.addRoute('GET', '/one', '/one');
      router.addRoute('GET', '/one/', '/one/');
      router.addRoute('GET', '/two', '/two');
      router.addRoute('GET', '/three', '/three');
      router.addRoute('GET', '/users/me', '/users/me');
      router.addRoute('GET', '/users/me/profile', '/users/me/profile');
      router.addRoute('GET', '/static/js/preview.js', '/static/js/preview.js');

      expect(router.findRoute('GET', '/one')).toEqual({
        data: '/one',
        params: null,
      });
      expect(router.findRoute('GET', '/one/')).toEqual({
        data: '/one/',
        params: null,
      });
      expect(router.findRoute('GET', '/two')).toEqual({
        data: '/two',
        params: null,
      });
      expect(router.findRoute('GET', '/three')).toEqual({
        data: '/three',
        params: null,
      });
      expect(router.findRoute('GET', '/users/me')).toEqual({
        data: '/users/me',
        params: null,
      });
      expect(router.findRoute('GET', '/users/me/profile')).toEqual({
        data: '/users/me/profile',
        params: null,
      });
      expect(router.findRoute('GET', '/static/js/preview.js')).toEqual({
        data: '/static/js/preview.js',
        params: null,
      });
    });

    test('correctly finds a route with multiple dynamic pathnames', () => {
      const router = new Router();

      router.addRoute('GET', '/users/:id', '/users/:id');
      router.addRoute('GET', '/users/:id/profile', '/users/:id/profile');
      router.addRoute('GET', '/invoices/:id/pay', '/invoices/:id/pay');
      router.addRoute('GET', '/invoices/:id/refund', '/invoices/:id/refund');
      router.addRoute('GET', '/invoices/:id', '/invoices/:id');

      expect(router.findRoute('GET', '/users/123')).toEqual({
        data: '/users/:id',
        params: new Map([['id', '123']]),
      });
      expect(router.findRoute('GET', '/users/456/profile')).toEqual({
        data: '/users/:id/profile',
        params: new Map([['id', '456']]),
      });
      expect(router.findRoute('GET', '/invoices/123/pay')).toEqual({
        data: '/invoices/:id/pay',
        params: new Map([['id', '123']]),
      });
      expect(router.findRoute('GET', '/invoices/456/refund')).toEqual({
        data: '/invoices/:id/refund',
        params: new Map([['id', '456']]),
      });
      expect(router.findRoute('GET', '/invoices/789')).toEqual({
        data: '/invoices/:id',
        params: new Map([['id', '789']]),
      });
    });

    test('correctly finds a route with multiple catch-all pathnames', () => {
      const router = new Router();

      router.addRoute('GET', '/static/js/*filepath', '/static/js/*filepath');
      router.addRoute('GET', '/static/css/*filepath', '/static/css/*filepath');

      expect(router.findRoute('GET', '/static/js/foobar/something.js')).toEqual({
        data: '/static/js/*filepath',
        params: new Map([['filepath', 'foobar/something.js']]),
      });
      expect(router.findRoute('GET', '/static/css/foobar/something.css')).toEqual({
        data: '/static/css/*filepath',
        params: new Map([['filepath', 'foobar/something.css']]),
      });
    });

    test('correctly finds a route with a mixture of static, dynamic and catch-all pathnames', () => {
      const router = new Router();

      router.addRoute('GET', '/one', '/one');
      router.addRoute('GET', '/one/', '/one/');
      router.addRoute('GET', '/two', '/two');
      router.addRoute('GET', '/three', '/three');
      router.addRoute('GET', '/users/me', '/users/me');
      router.addRoute('GET', '/users/me/profile', '/users/me/profile');
      router.addRoute('GET', '/static/js/preview.js', '/static/js/preview.js');

      router.addRoute('GET', '/users/:id', '/users/:id');
      router.addRoute('GET', '/users/:id/profile', '/users/:id/profile');
      router.addRoute('GET', '/invoices/:id/pay', '/invoices/:id/pay');
      router.addRoute('GET', '/invoices/:id/refund', '/invoices/:id/refund');
      router.addRoute('GET', '/invoices/:id', '/invoices/:id');

      router.addRoute('GET', '/static/js/*filepath', '/static/js/*filepath');
      router.addRoute('GET', '/static/css/*filepath', '/static/css/*filepath');

      router.addRoute('GET', '/static/media/:type/*filepath', '/static/media/:type/*filepath');
      router.addRoute('GET', '/*splat', '/*splat');

      expect(router.findRoute('GET', '/one')).toEqual({
        data: '/one',
        params: null,
      });
      expect(router.findRoute('GET', '/one/')).toEqual({
        data: '/one/',
        params: null,
      });
      expect(router.findRoute('GET', '/two')).toEqual({
        data: '/two',
        params: null,
      });
      expect(router.findRoute('GET', '/three')).toEqual({
        data: '/three',
        params: null,
      });
      expect(router.findRoute('GET', '/users/me')).toEqual({
        data: '/users/me',
        params: null,
      });
      expect(router.findRoute('GET', '/users/me/profile')).toEqual({
        data: '/users/me/profile',
        params: null,
      });
      expect(router.findRoute('GET', '/static/js/preview.js')).toEqual({
        data: '/static/js/preview.js',
        params: null,
      });

      expect(router.findRoute('GET', '/users/123')).toEqual({
        data: '/users/:id',
        params: new Map([['id', '123']]),
      });
      expect(router.findRoute('GET', '/users/456/profile')).toEqual({
        data: '/users/:id/profile',
        params: new Map([['id', '456']]),
      });
      expect(router.findRoute('GET', '/invoices/123/pay')).toEqual({
        data: '/invoices/:id/pay',
        params: new Map([['id', '123']]),
      });
      expect(router.findRoute('GET', '/invoices/456/refund')).toEqual({
        data: '/invoices/:id/refund',
        params: new Map([['id', '456']]),
      });
      expect(router.findRoute('GET', '/invoices/789')).toEqual({
        data: '/invoices/:id',
        params: new Map([['id', '789']]),
      });

      expect(router.findRoute('GET', '/static/js/foobar/something.js')).toEqual({
        data: '/static/js/*filepath',
        params: new Map([['filepath', 'foobar/something.js']]),
      });
      expect(router.findRoute('GET', '/static/css/foobar/something.css')).toEqual({
        data: '/static/css/*filepath',
        params: new Map([['filepath', 'foobar/something.css']]),
      });

      expect(router.findRoute('GET', '/static/media/image/something.jpg')).toEqual({
        data: '/static/media/:type/*filepath',
        params: new Map([
          ['type', 'image'],
          ['filepath', 'something.jpg'],
        ]),
      });
      expect(router.findRoute('GET', '/the/quick/brown/fox/jumps/over/the/lazy/dog')).toEqual({
        data: '/*splat',
        params: new Map([['splat', 'the/quick/brown/fox/jumps/over/the/lazy/dog']]),
      });
    });
  });
});

describe('indexCommonPrefix()', () => {
  test('returns the index of the first occurence of a differing character', () => {
    expect(indexCommonPrefix('abc', 'abd')).toBe(2);
    expect(indexCommonPrefix('hello', 'help')).toBe(3);
  });

  test('returns the length of the shorter string if strings share a common prefix', () => {
    expect(indexCommonPrefix('abc', 'abcdef')).toBe(3);
    expect(indexCommonPrefix('abcdef', 'abc')).toBe(3);
  });

  test('returns the length of the strings if they are identical', () => {
    expect(indexCommonPrefix('abc', 'abc')).toBe(3);
  });

  test('returns `0` if strings do not share a common prefix', () => {
    expect(indexCommonPrefix('abc', 'def')).toBe(0);
    expect(indexCommonPrefix('abc', '')).toBe(0);
    expect(indexCommonPrefix('', 'abc')).toBe(0);
    expect(indexCommonPrefix('', '')).toBe(0);
  });
});

describe('indexAny', () => {
  test('returns the index of the first occurence of a character from the given set', () => {
    expect(indexAny('hello', 'l')).toBe(2);
    expect(indexAny('hello', 'o')).toBe(4);
  });

  test('returns the index of the first occurence of any character from the given set', () => {
    expect(indexAny('hello', 'lo')).toBe(2);
    expect(indexAny('hello', 'ol')).toBe(2);
  });

  test('returns the length of the string if no characters from the given set are present', () => {
    expect(indexAny('hello', 'xyz')).toBe(5);
    expect(indexAny('hello', '')).toBe(5);
    expect(indexAny('', 'xyz')).toBe(0);
    expect(indexAny('', '')).toBe(0);
  });
});
