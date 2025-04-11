// Reference: https://github.com/jshttp/cookie/blob/master/src/index.ts
const VALID_COOKIE_NAME_REGEX = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
const VALID_COOKIE_VALUE_REGEX = /^[\u0021-\u003A\u003C-\u007E]*$/;

/**
 * Parses the cookie string and returns the value of the given cookie name.
 * If the cookie is not found, `null` is returned.
 *
 * @param cookie - The cookie string to parse.
 * @param name - The name of the cookie to get the value of.
 */
export function parse(cookie: string, name: string) {
  // A quick way to check if the `name` is present in the cookie.
  if (cookie.indexOf(name) === -1) {
    return null;
  }

  for (let kv of cookie.trim().split(';')) {
    kv = kv.trim();

    const equalPos = kv.indexOf('=');
    if (equalPos === -1) {
      continue;
    }

    const key = kv.slice(0, equalPos).trim();
    if (key !== name || !VALID_COOKIE_NAME_REGEX.test(key)) {
      continue;
    }

    let value = kv.slice(equalPos + 1).trim();

    // Remove double quotes from the cookie value if present.
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    if (!VALID_COOKIE_VALUE_REGEX.test(value)) {
      continue;
    }

    return decodeURIComponent(value);
  }

  return null;
}

/**
 * The options for serialising a cookie.
 */
export interface SerialiseOptions {
  /**
   * The path for which the cookie is valid.
   */
  path?: string;
  /**
   * The domain for which the cookie is valid.
   */
  domain?: string;
  /**
   * The date and time when the cookie will expire.
   * If `expires` and `maxAge` are both provided, `maxAge` will take precedence.
   */
  expires?: Date;
  /**
   * The maximum age of the cookie in seconds.
   * If `expires` and `maxAge` are both provided, `maxAge` will take precedence.
   *
   * - `maxAge` = 0: No `Max-Age` header will be set.
   * - `maxAge` > 0: The cookie will expire after the given number of seconds.
   * - `maxAge` < 0: The cookie will expire immediately, equivalent `Max-Age=0`.
   */
  maxAge?: number;
  /**
   * Whether the cookie is only accessible via HTTPS.
   */
  secure?: boolean;
  /**
   * Whether the cookie is only accessible via HTTP(S) requests and not via
   * JavaScript.
   */
  httpOnly?: boolean;
  /**
   * The `same-site` attribute for the cookie.
   */
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * Serialises the given cookie name and value into a cookie string.
 *
 * @param name - The name of the cookie to serialise.
 * @param value - The value of the cookie to serialise.
 * @param options - The options to serialise the cookie with.
 */
export function serialise(name: string, value: string, options?: SerialiseOptions) {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  if (options?.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options?.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options?.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options?.maxAge) {
    if (options.maxAge > 0) {
      cookie += `; Max-Age=${options.maxAge | 0}`;
    }
    if (options.maxAge < 0) {
      cookie += '; Max-Age=0';
    }
  }

  if (options?.secure) {
    cookie += '; Secure';
  }

  if (options?.httpOnly) {
    cookie += '; HttpOnly';
  }

  switch (options?.sameSite) {
    case 'strict':
      cookie += '; SameSite=Strict';
      break;
    case 'lax':
      cookie += '; SameSite=Lax';
      break;
    case 'none':
      cookie += '; SameSite=None';
      break;
  }

  return cookie;
}
