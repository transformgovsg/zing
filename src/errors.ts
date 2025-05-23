/**
 * Base class for all errors.
 */
export class BaseError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;
  }
}

/**
 * Thrown when the request content is too large.
 */
export class ContentTooLargeError extends BaseError {
  readonly type = 'CONTENT_TOO_LARGE_ERROR';

  constructor() {
    super('The request content is too large.');
  }
}

/**
 * Thrown when the request content type is not supported.
 */
export class UnsupportedContentTypeError extends BaseError {
  readonly type = 'UNSUPPORTED_CONTENT_TYPE_ERROR';

  constructor() {
    super('The request content type is not supported.');
  }
}

/**
 * Thrown when the request payload is not a valid JSON object.
 */
export class MalformedJSONError extends BaseError {
  readonly type = 'MALFORMED_JSON_ERROR';

  constructor() {
    super('The request payload is not a valid JSON object.');
  }
}

/**
 * Thrown when an unexpected error occurs.
 */
export class InternalServerError extends BaseError {
  readonly type = 'INTERNAL_SERVER_ERROR';

  constructor(cause: unknown) {
    super('An unexpected error occurred. Check the cause property for more details.');

    this.cause = cause;
  }
}
