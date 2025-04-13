export interface Options {
  /**
   * The maximum size of the request body in bytes.
   *
   * @default 1_048_576
   */
  maxBodySize: number;
}

/**
 * The default options for Zing.
 */
export const DEFAULT_OPTIONS: Options = {
  maxBodySize: 1_048_576,
};
