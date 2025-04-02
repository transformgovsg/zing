import type { Result } from './result.js';
import { ERR, OK } from './result.js';
import type { HTTPMethod } from './types.js';

export type RouteData = boolean | number | string | unknown[] | Record<string, unknown>;

export interface RouteResult<T extends RouteData> {
  data: T;
  params: Map<string, string> | null;
}

export class Node<T extends RouteData = RouteData> {
  type: 'static' | 'dynamic' | 'catch-all';
  fragment: string;
  indicies: string;
  children: Node<T>[];
  name: string | null;
  data: T | null;

  constructor({
    type = 'static',
    fragment = '',
    indicies = '',
    children = [],
    name = null,
    data = null,
  }: Partial<Node<T>> = {}) {
    this.type = type;
    this.fragment = fragment;
    this.indicies = indicies;
    this.children = children;
    this.name = name;
    this.data = data;
  }

  /**
   * Creates a new child node and adds it to this node's children.
   * The type of child node created depends on the character provided:
   * - `:` creates a dynamic node
   * - `*` creates a catch-all node
   * - Any other character creates a static node
   *
   * @param char - The character to create a child node for.
   */
  createChild(char: string): Node<T> {
    const child = new Node<T>();

    switch (char) {
      case ':':
        child.type = 'dynamic';
        break;
      case '*':
        child.type = 'catch-all';
        break;
    }

    this.indicies += char;
    this.children.push(child);

    return child;
  }

  /**
   * Returns the child node that matches the given character.
   * Looks through this node's indices to find a matching child.
   *
   * @param char - The character to search for.
   */
  findChild(char: string) {
    for (let i = 0; i < this.indicies.length; i++) {
      if (this.indicies[i] === char) {
        return this.children[i];
      }
    }

    return null;
  }

  /**
   * Returns a human-readable string representation of the node and its children.
   */
  stringify() {
    let result = '\n';

    const stack: [Node<T>, string, boolean][] = [[this, '', true]];

    while (stack.length > 0) {
      const item = stack.pop();
      if (!item) {
        continue;
      }

      const [node, prefix, isLast] = item;

      result += `${prefix}${isLast ? '└── ' : '├── '}`;
      result += `${node.fragment}, type=${node.type}, `;

      if (node.indicies.length > 0) {
        result += `indicies=[${node.indicies.split('').join(', ')}], `;
      }
      if (node.name) {
        result += `name=${node.name}, `;
      }

      result += `data=${node.data ? 'Y' : 'N'}`;
      result += '\n';

      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        const isLastChild = i === node.children.length - 1;
        stack.push([child, prefix + (isLast ? '    ' : '│   '), isLastChild]);
      }
    }

    return result;
  }
}

export default class Router<T extends RouteData = RouteData> {
  #nodes = new Map<HTTPMethod, Node<T>>();

  /**
   * Returns a human-readable string representation of the router.
   */
  stringify() {
    let result = '\n';

    for (const [method, node] of this.#nodes.entries()) {
      result += `${method}`;
      result += node.stringify();
    }

    return result;
  }

  /**
   * Adds a route to the router.
   *
   * @param method - The HTTP method to add the route for.
   * @param pattern - The pattern to add the route for.
   * @param data - The data to associate with the route.
   */
  addRoute(method: HTTPMethod, pattern: string, data: T): Result<void, Error> {
    let node = this.#nodes.get(method);
    if (!node) {
      node = new Node<T>();
      this.#nodes.set(method, node);
    }

    // Normalise the pattern to always start with a `/`.
    if (!pattern.startsWith('/')) {
      pattern = '/' + pattern;
    }

    while (pattern.length > 0) {
      if (node.fragment.length > 0) {
        const i = indexCommonPrefix(node.fragment, pattern);

        if (i < node.fragment.length) {
          const child = new Node<T>({
            type: node.type,
            fragment: node.fragment.slice(i),
            indicies: node.indicies,
            children: node.children,
            name: node.name,
            data: node.data,
          });

          node.fragment = pattern.slice(0, i);
          node.indicies = child.fragment[0];
          node.children = [child];
          node.name = null;
          node.data = null;
        }

        pattern = pattern.slice(i);

        switch (node.type) {
          case 'dynamic':
          case 'catch-all':
            pattern = pattern.slice(indexAny(pattern, '/'));
            break;
        }

        if (pattern.length > 0) {
          node = node.findChild(pattern[0]) ?? node.createChild(pattern[0]);
        }

        continue;
      }

      switch (node.type) {
        case 'static': {
          const i = indexAny(pattern, ':*');
          node.fragment = pattern.slice(0, i);
          pattern = pattern.slice(i);
          break;
        }

        case 'dynamic': {
          const i = indexAny(pattern, '/');
          const name = pattern.slice(1, i);

          if (name.length === 0) {
            return ERR(new Error('Dynamic parameter must have a name.'));
          }
          if (name.includes(':') || name.includes('*')) {
            return ERR(
              new Error('Only one dynamic or catch-all parameter is allowed per path segment.'),
            );
          }

          node.fragment = ':';
          node.name = name;
          pattern = pattern.slice(i);
          break;
        }

        case 'catch-all': {
          const i = indexAny(pattern, '/');
          const name = pattern.slice(1, i);

          if (name.length === 0) {
            return ERR(new Error('Catch-all parameter must have a name.'));
          }
          if (name.length + 1 !== pattern.length) {
            return ERR(new Error('Catch-all parameter must be the last path segment.'));
          }
          if (name.includes(':') || name.includes('*')) {
            return ERR(
              new Error('Only one dynamic or catch-all parameter is allowed per path segment.'),
            );
          }

          node.fragment = '*';
          node.name = name;
          pattern = pattern.slice(pattern.length);
          break;
        }
      }

      if (pattern.length > 0) {
        node = node.createChild(pattern[0]);
      }
    }

    node.data = data;
    return OK();
  }

  /**
   * Returns the data and parameters for the route that matches the given
   * pathname. If no route is found, `null` is returned.
   *
   * @param method - The HTTP method to find the route for.
   * @param pathname - The pathname to find the route for.
   */
  findRoute(method: HTTPMethod, pathname: string): RouteResult<T> | null {
    const node = this.#nodes.get(method);
    if (!node) {
      return null;
    }

    const params = new Map<string, string>();
    const data = this.#lookup(node, pathname, params);
    if (!data) {
      return null;
    }

    return {
      data,
      params: params.size > 0 ? params : null,
    };
  }

  #lookup(node: Node<T>, pathname: string, params: Map<string, string>): T | null {
    const i = indexCommonPrefix(node.fragment, pathname);

    if (i === pathname.length) {
      return node.data;
    }

    pathname = pathname.slice(i);

    let child = node.findChild(pathname[0]);
    if (child) {
      const data = this.#lookup(child, pathname, params);
      if (data) {
        return data;
      }
    }

    child = node.findChild(':');
    if (child) {
      const i = indexAny(pathname, '/');
      const value = pathname.slice(0, i);

      params.set(child.name!, value);

      if (i === pathname.length) {
        return child.data;
      }

      if (child.children.length === 1) {
        const data = this.#lookup(child.children[0], pathname.slice(i), params);
        if (data) {
          return data;
        }
      }

      params.delete(child.name!);
    }

    child = node.findChild('*');
    if (child) {
      params.set(child.name!, pathname);
      return child.data;
    }

    return null;
  }
}

/**
 * Returns the index of the first occurence of a character that differs between
 * `a` and `b`, or the length of the shorter string if `a` and `b` are identical.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 */
export function indexCommonPrefix(a: string, b: string): number {
  const l = Math.min(a.length, b.length);

  for (let i = 0; i < l; i++) {
    if (a[i] !== b[i]) {
      return i;
    }
  }

  return l;
}

/**
 * Returns the index of the first occurence of any character from `chars` in
 * `s`, or the length of `s` if no characters from `chars` is present in `s`.
 *
 * @param s - The string to search within.
 * @param chars - The characters to search for.
 */
export function indexAny(s: string, chars: string): number {
  let earliest = s.length;

  for (const char of chars) {
    for (let i = 0; i < s.length; i++) {
      if (s[i] === char && i < earliest) {
        earliest = i;
      }
    }
  }

  return earliest;
}
