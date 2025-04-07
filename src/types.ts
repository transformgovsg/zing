import type Request from './request.js';
import type Response from './response.js';

export type HTTPMethod = 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';

export type MIME = 'application/json; charset=utf-8' | 'text/plain; charset=utf-8';

export type HTTPHeaderKey =
  | 'access-control-allow-credentials'
  | 'access-control-allow-headers'
  | 'access-control-allow-methods'
  | 'access-control-allow-origin'
  | 'access-control-expose-headers'
  | 'access-control-max-age'
  | 'age'
  | 'allow'
  | 'cache-control'
  | 'connection'
  | 'content-length'
  | 'content-type'
  | 'cookie'
  | 'date'
  | 'etag'
  | 'expires'
  | 'last-modified'
  | 'location'
  | 'set-cookie'
  | `x-${string}`;

export type HTTPHeaderValue<Key extends HTTPHeaderKey> = Key extends 'content-type' ? MIME : string;

export type HTTPHeaders = {
  [Key in HTTPHeaderKey]?: HTTPHeaderValue<Key>;
};

type JSONPrimitive = string | number | boolean | null | Date;
type JSONValue = JSONPrimitive | JSONValue[] | JSONObject;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type Handler = (req: Request, res: Response) => Promise<void> | void;
export type ErrorHandler = (err: unknown, req: Request, res: Response) => Promise<void> | void;
export type Middleware = (next: Handler) => Handler;
