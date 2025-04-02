import getPort from 'get-port';

import type { HTTPMethod, JSONObject } from '../src/types.js';
import Zing from '../src/zing.js';

type RequestFunction = (
  method: HTTPMethod,
  path: string,
  options?: {
    body?: string | JSONObject;
    headers?: Headers | Record<string, string>;
  },
) => Promise<Response>;

export function describeMatrix(
  title: string,
  fn: (ctx: { app: Zing; request: RequestFunction }) => Promise<void> | void,
) {
  describe(title, async () => {
    let app: Zing | null = null;
    let request: RequestFunction | null = null;

    beforeEach(async () => {
      app = new Zing();

      const port = await getPort();
      await app.listen(port);

      request = async (method, path, options = {}) => {
        return fetch(`http://localhost:${port}${path}`, {
          method,
          body: options?.body
            ? typeof options.body === 'string'
              ? options.body
              : JSON.stringify(options.body)
            : undefined,
          headers: options?.headers,
        });
      };
    });

    afterEach(async () => {
      await app?.shutdown();

      app = null;
      request = null;
    });

    await fn({
      get app() {
        if (!app) {
          throw new Error('App is not initialised');
        }

        return app;
      },

      get request() {
        if (!request) {
          throw new Error('Request function is not initialised');
        }

        return request;
      },
    });
  });
}
