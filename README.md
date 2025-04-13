# Zing

A lightweight HTTP framework for **Node.js**.

## 🚧 Roadmap

- [x] ~~Cookies~~
- [x] ~~Middleware~~
- [ ] Server-sent events
- [ ] Header, query, and body schema validation

## 📦 Install

```sh
pnpm add @transformgovsg/zing
```

Alternatively, using yarn or npm:

```sh
yarn add @transformgovsg/zing
```

```sh
npm install @transformgovsg/zing
```

## 🚀 Usage

```js
import Zing, { HTTPStatusCode } from '@transformgovsg/zing';

const app = new Zing();

// Simplest route.
app.get('/', (_, res) => {
  res.ok();
});

// Route with a dynamic parameter.
app.get('/hello/:name', (req, res) => {
  res.text(HTTPStatusCode.OK, `Dynamic parameter: ${req.param('name')}!`);
});

// Route with a catch-all parameter.
app.get('/hello/*name', (req, res) => {
  res.text(HTTPStatusCode.OK, `Catch-all parameter: ${req.param('name')}!`);
});

await app.listen(8080);

process.on('SIGTERM', async () => {
  await app.shutdown();
});

process.on('SIGINT', async () => {
  await app.shutdown();
});
```

## 🔌 API

- [Zing.constructor()](#zingconstructor)
- [Zing.listen()](#zinglisten)
- [Zing.shutdown()](#zingshutdown)
- [Zing.route()](#zingroute)
- [Zing.get()](#zingget)
- [Zing.head()](#zinghead)
- [Zing.patch()](#zingpatch)
- [Zing.post()](#zingpost)
- [Zing.put()](#zingput)
- [Zing.delete()](#zingdelete)
- [Zing.options()](#zingoptions)
- [Zing.use()](#zinguse)
- [Zing.set404Handler()](#zingset404handler)
- [Zing.setErrorHandler()](#zingseterrorhandler)
- [Request.node](#requestnode)
- [Request.protocol](#requestprotocol)
- [Request.pathname](#requestpathname)
- [Request.method](#requestmethod)
- [Request.get()](#requestget)
- [Request.set()](#requestset)
- [Request.cookie()](#requestcookie)
- [Request.param()](#requestparam)
- [Request.query()](#requestquery)
- [Request.queries()](#requestqueries)
- [Request.header()](#requestheader)
- [Request.body()](#requestbody)
- [Request.text()](#requesttext)
- [Request.json()](#requestjson)
- [Response.node](#responsenode)
- [Response.finished](#responsefinished)
- [Response.status()](#responsestatus)
- [Response.ok()](#responseok)
- [Response.cookie()](#responsecookie)
- [Response.json()](#responsejson)
- [Response.text()](#responsetext)
- [Response.header()](#responseheader)

### Zing.constructor()

Creates a new Zing application.

**Type**

```ts
constructor(options?: Partial<Options>);
```

**Parameters**

- `options` - The options for the Zing application.
  - `maxBodySize` - The maximum size of the body of a request. Default: `1_048_576`.

**Example**

```ts
const app = new Zing();
```

With custom options:

```ts
const app = new Zing({ maxBodySize: 4 * 1024 }); // Limit to 4KB.
```

[⬆️ Back to top](#-api)

### Zing.listen()

Starts the HTTP server and listens on the given port for incoming requests.

**Type**

```ts
listen(port?: number): Promise<void>;
```

**Parameters**

- `port` - The port to listen on. Default: `8080`.

**Example**

```ts
await app.listen(); // Listen on port 8080.
await app.listen(8123); // Listen on port 8123.
```

[⬆️ Back to top](#-api)

### Zing.shutdown()

Shuts down the HTTP server.

**Type**

```ts
shutdown(timeout?: number): Promise<void>;
```

**Parameters**

- `timeout` - The time in milliseconds to wait for active requests to finish before forcefully shutting down the HTTP server. Default: `10000`.

**Example**

```ts
await app.shutdown(); // Shutdown the HTTP server after 10 seconds.
await app.shutdown(5000); // Shutdown the HTTP server after 5 seconds.
```

[⬆️ Back to top](#-api)

### Zing.route()

Adds a route to the application.

**Type**

```ts
route(method: 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS', pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `method` - The HTTP method to match against the request method.
- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.route('GET', '/', (req, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.route('GET', '/', logger, (req, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.get()

Adds a `GET` route to the application.

**Type**

```ts
get(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.get('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.get('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.head()

Adds a `HEAD` route to the application.

**Type**

```ts
head(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.head('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.head('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.patch()

Adds a `PATCH` route to the application.

**Type**

```ts
patch(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.patch('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.patch('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.post()

Adds a `POST` route to the application.

**Type**

```ts
post(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.post('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.post('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.put()

Adds a `PUT` route to the application.

**Type**

```ts
put(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.put('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.put('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.delete()

Adds a `DELETE` route to the application.

**Type**

```ts
delete(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.delete('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.delete('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.options()

Adds a `OPTIONS` route to the application.

**Type**

```ts
options(pattern: string, ...args: [...Middleware[], Handler]): void;
```

**Parameters**

- `pattern` - The pattern to match against the request pathname.
- `args` - The middleware and handler to call when the route is matched.

**Throws**

- `Error` - If the `pattern` is invalid.

**Example**

```ts
app.options('/', (_, res) => {
  res.ok();
});
```

With middleware:

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.options('/', logger, (_, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

### Zing.use()

Adds an application-level middleware to be called for each incoming request regardless of whether it matches a route or not.

**Type**

```ts
use(...middleware: Middleware[]): void;
```

**Parameters**

- `middleware` - The middleware to be called for each request.

**Example**

```ts
function logger(next: Handler) {
  return async (req, res) => {
    console.log(`${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.use(logger);
```

Middleware with configuration:

```ts
function logger(options: { prefix: string }): Middleware {
  return (next) => async (req, res) => {
    console.log(`${options.prefix} ${req.method} ${req.pathname}`);
    await next(req, res);
  };
}

app.use(logger({ prefix: '[Zing] ' }));
```

[⬆️ Back to top](#-api)

### Zing.set404Handler()

Sets the handler to call when no route is matched.

By default, Zing has a default 404 handler that sends a `404 Not Found` response. If you want to customize the response, you can set your own 404 handler.

**Type**

```ts
set404Handler(handler: Handler): void;
```

**Parameters**

- `handler` - The handler to call when no route is matched.

**Example**

```ts
app.set404Handler((_, res) => {
  res.json(404, { message: 'Not Found' });
});
```

[⬆️ Back to top](#-api)

### Zing.setErrorHandler()

Sets the handler to call when an error occurs.

By default, Zing has a default error handler that sends a `500 Internal Server Error` response. The default error handler also handles a few Zing specific errors:

- `ContentTooLargeError`
  - When the request body is too large.
  - Sends a `413 Content Too Large` response.
- `UnsupportedContentTypeError`
  - When trying to parse a request body with an unsupported content type.
  - Sends a `415 Unsupported Media Type` response.
- `MalformedJSONError`
  - When trying to parse a request body as JSON but the body is not valid JSON.
  - Sends a `422 Unprocessable Content` response.
- `InternalServerError`
  - When an unknown error occurs.
  - Sends a `500 Internal Server Error` response.

If you want to customize the response, you can set your own error handler.

**Type**

```ts
setErrorHandler(handler: ErrorHandler): void;
```

**Parameters**

- `handler` - The handler to call when an error occurs.

**Example**

```ts
app.setErrorHandler((_err, _req, res) => {
  res.json(500, { message: 'Internal Server Error' });
});
```

If you just want to handle a few specific errors, you can do something like the following:

```ts
app.setErrorHandler((err, _req, res) => {
  if (err instanceof XXXError) {
    res.json(422, { message: 'Unprocessable Content' });
    return;
  }

  // Rethrow the error so that it can be handled by the default error handler.
  throw err;
});
```

[⬆️ Back to top](#-api)

### Request

#### Request.node

Returns the underlying Node.js request object.

**Type**

```ts
node: IncomingMessage;
```

[⬆️ Back to top](#-api)

#### Request.protocol

Returns the protocol of the request.

**Type**

```ts
protocol: 'http' | 'https';
```

**Example**

```ts
app.get('/', (req, res) => {
  const protocol = req.protocol;

  res.ok();
});
```

[⬆️ Back to top](#-api)

#### Request.pathname

Returns the pathname of the request.

**Type**

```ts
pathname: string;
```

**Example**

```ts
app.get('/', (req, res) => {
  const pathname = req.pathname;
});
```

[⬆️ Back to top](#-api)

#### Request.method

Returns the method of the request.

**Type**

```ts
method: 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'DELETE' | 'OPTIONS';
```

**Example**

```ts
app.get('/', (req, res) => {
  const method = req.method;
});
```

[⬆️ Back to top](#-api)

#### Request.get()

Returns the value of the given key from the request-scoped key-value store. If the key is not found and no default value is provided, `null` is returned.

**Type**

```ts
get<T = unknown>(key: string, defaultValue?: T): T | null;
```

**Parameters**

- `key` - The key to get the value of.
- `defaultValue` - The default value to return if the key is not found.

**Example**

```ts
app.get('/', (req, res) => {
  const value = req.get('key', 'defaultValue');
});
```

[⬆️ Back to top](#-api)

#### Request.set()

Stores a value in the request-scoped key-value store.

**Type**

```ts
set(key: string, value: unknown): void;
```

**Parameters**

- `key` - The key to store the value under.
- `value` - The value to store.

**Example**

```ts
app.get('/', (req, res) => {
  req.set('key', 'value');
});
```

[⬆️ Back to top](#-api)

#### Request.cookie()

Returns the value of the given cookie name from the request. If the cookie is not found and no default value is provided, `null` is returned.

**Type**

```ts
cookie(name: string, defaultValue?: string): string | null;
```

**Parameters**

- `name` - The name of the cookie to get the value of.
- `defaultValue` - The default value to return if the cookie is not found.

**Example**

```ts
app.get('/', (req, res) => {
  const value = req.cookie('name', 'defaultValue');
});
```

[⬆️ Back to top](#-api)

#### Request.param()

Returns the value of the given parameter name from the request. If the parameter is not found and no default value is provided, `null` is returned.

**Type**

```ts
param(name: string, defaultValue?: string): string | null;
```

**Parameters**

- `name` - The name of the parameter to get the value of.
- `defaultValue` - The default value to return if the parameter is not found.

**Example**

```ts
app.get('/', (req, res) => {
  const value = req.param('name', 'defaultValue');
});
```

[⬆️ Back to top](#-api)

#### Request.query()

Returns the value of the first occurrence of the given query name from the request. If the query is not found and no default value is provided, `null` is returned.

**Type**

```ts
query(name: string, defaultValue?: string): string | null;
```

**Parameters**

- `name` - The name of the query to get the value of.
- `defaultValue` - The default value to return if the query is not found.

**Example**

```ts
app.get('/', (req, res) => {
  const value = req.query('name', 'defaultValue');
});
```

[⬆️ Back to top](#-api)

#### Request.queries()

Returns the values of all occurrences of the given query name from the request. If the query is not found and no default value is provided, an empty array is returned.

**Type**

```ts
queries(name: string, defaultValue?: string[]): string[];
```

**Parameters**

- `name` - The name of the query to get the values of.
- `defaultValue` - The default value to return if the query is not found.

**Example**

```ts
app.get('/', (req, res) => {
  const values = req.queries('name', ['defaultValue1', 'defaultValue2']);
});
```

[⬆️ Back to top](#-api)

#### Request.header()

Returns the value of the first occurrence of the given header name from the request. If the header is not found and no default value is provided, `null` is returned.

**Type**

```ts
header(name: string, defaultValue?: string): string | null;
```

**Parameters**

- `name` - The name of the header to get the value of.
- `defaultValue` - The default value to return if the header is not found.

**Example**

```ts
app.get('/', (req, res) => {
  const value = req.header('name', 'defaultValue');
});
```

[⬆️ Back to top](#-api)

#### Request.body()

Returns the body of the request or `null` if the HTTP method is not `PATCH`, `POST`, or `PUT`.

**Type**

```ts
async body(): Promise<Result<Uint8Array | null, ContentTooLargeError | InternalServerError>>;
```

**Example**

```ts
app.get('/', async (req, res) => {
  const result = await req.body();

  if (result.isErr()) {
    res.json(500, { message: 'Internal Server Error' });
    return;
  }

  const body = result.value; // The body of the request.
});
```

```ts
app.get('/', async (req, res) => {
  const result = await req.body();

  const body = result.unwrap(); // The body of the request or throws an error if the result is an error.
  const body = result.unwrapOr(null); // The body of the request or `null` if the result is an error.
```

[⬆️ Back to top](#-api)

#### Request.text()

Returns the body of the request as a string or `null` if the HTTP method is not `PATCH`, `POST`, or `PUT`.

**Type**

```ts
async text(): Promise<Result<string | null, ContentTooLargeError | InternalServerError | UnsupportedContentTypeError>>;
```

**Example**

```ts
app.get('/', async (req, res) => {
  const result = await req.text();

  if (result.isErr()) {
    res.json(500, { message: 'Internal Server Error' });
    return;
  }

  const text = result.value; // The body of the request as a string.
});
```

```ts
app.get('/', async (req, res) => {
  const result = await req.text();

  const text = result.unwrap(); // The body of the request as a string or throws an error if the result is an error.
  const text = result.unwrapOr(null); // The body of the request as a string or `null` if the result is an error.
```

[⬆️ Back to top](#-api)

#### Request.json()

Returns the body of the request as a JSON object or `null` if the HTTP method is not `PATCH`, `POST`, or `PUT`.

**Type**

```ts
async json<T = unknown>(): Promise<Result<T | null, ContentTooLargeError | InternalServerError | UnsupportedContentTypeError | MalformedJSONError>>;
```

**Example**

```ts
app.get('/', async (req, res) => {
  const result = await req.json();

  if (result.isErr()) {
    res.json(500, { message: 'Internal Server Error' });
    return;
  }

  const json = result.value; // The body of the request as a JSON object.
});
```

```ts
app.get('/', async (req, res) => {
  const result = await req.json();

  const json = result.unwrap(); // The body of the request as a JSON object or throws an error if the result is an error.
  const json = result.unwrapOr(null); // The body of the request as a JSON object or `null` if the result is an error.
```

[⬆️ Back to top](#-api)

### Response

#### Response.node

Returns the underlying Node.js response object.

**Type**

```ts
node: ServerResponse;
```

[⬆️ Back to top](#-api)

#### Response.finished

Returns `true` if the response has been sent, otherwise `false`.

**Type**

```ts
finished: boolean;
```

**Example**

```ts
app.get('/', (req, res) => {
  const finished = res.finished;
});
```

[⬆️ Back to top](#-api)

#### Response.status()

Sets the status code of the response.

**Type**

```ts
status(code: (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode]): void;
```

**Parameters**

- `code` - The status code to set.

**Example**

```ts
app.get('/', (req, res) => {
  res.status(200);
});
```

[⬆️ Back to top](#-api)

#### Response.ok()

Sets the status code of the response to `200`.

**Type**

```ts
ok(): void;
```

**Example**

```ts
app.get('/', (req, res) => {
  res.ok();
});
```

[⬆️ Back to top](#-api)

#### Response.cookie()

Sets a cookie on the response.

**Type**

```ts
cookie(name: string, value: string, options?: CookieOptions): void;
```

**Parameters**

- `name` - The name of the cookie to set.
- `value` - The value of the cookie to set.
- `options` - The options for the cookie.

**Example**

```ts
app.get('/', (req, res) => {
  res.cookie('name', 'value', {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  });
});
```

[⬆️ Back to top](#-api)

#### Response.json()

Sets the status code of the response to the given status code and the body to the given JSON object. It will automatically set the `Content-Type` and `Content-Length` headers.

**Type**

```ts
json(code: (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode], data: JSONObject): void;
```

**Parameters**

- `code` - The status code to set.
- `data` - The JSON object to set the body to.

**Example**

```ts
app.get('/', (req, res) => {
  res.json(200, { message: 'Hello, world!' });
});
```

[⬆️ Back to top](#-api)

#### Response.text()

Sets the status code of the response to the given status code and the body to the given string. It will automatically set the `Content-Type` and `Content-Length` headers.

**Type**

```ts
text(code: (typeof HTTPStatusCode)[keyof typeof HTTPStatusCode], data: string): void;
```

**Parameters**

- `code` - The status code to set.
- `data` - The string to set the body to.

**Example**

```ts
app.get('/', (req, res) => {
  res.text(200, 'Hello, world!');
});
```

[⬆️ Back to top](#-api)

#### Response.header()

Sets the value of the given header key on the response.

**Type**

```ts
header<Key extends Exclude<HTTPHeaderKey, 'set-cookie'>>(key: Key, value: HTTPHeaderValue<Key>): void;
```

**Parameters**

- `key` - The key of the header to set.
- `value` - The value of the header to set.

**Example**

```ts
app.get('/', (req, res) => {
  res.header('Content-Type', 'application/json');
});
```

[⬆️ Back to top](#-api)

## 📜 License

This project is licensed under the MIT License.
