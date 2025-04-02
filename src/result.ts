// Credit to https://github.com/supermacro/neverthrow/blob/master/src/result.ts.

interface IResult<T, E extends Error> {
  /**
   * Returns `true` if the result is an {@link Ok} variant of {@link Result}
   */
  isOk(): this is Ok<T, E>;
  /**
   * Returns `true` if the result is an {@link Err} variant of {@link Result}
   */
  isErr(): this is Err<T, E>;
  /**
   * Unwraps the {@link Result} and returns the value if it is an {@link Ok}
   * variant, otherwise throws the error.
   */
  unwrap(): T;
  /**
   * Unwraps the {@link Result} and returns the value if it is an {@link Ok}
   * variant, otherwise returns the provided default value.
   */
  unwrapOr<D>(defaultValue: D): T | D;
}

class Ok<T, E extends Error> implements IResult<T, E> {
  constructor(readonly value: T) {}

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return !this.isOk();
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr<D>(_defaultValue: D): T | D {
    return this.value;
  }
}

class Err<T, E extends Error> implements IResult<T, E> {
  constructor(readonly error: E) {}

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return !this.isOk();
  }

  unwrap(): T {
    throw this.error;
  }

  unwrapOr<D>(defaultValue: D): T | D {
    return defaultValue;
  }
}

export type Result<T, E extends Error> = Ok<T, E> | Err<T, E>;

export function OK<T>(value: T): Ok<T, never>;
export function OK<T extends void = void>(value: void): Ok<T, never>;
export function OK<T>(value: T): Ok<T, never> {
  return new Ok(value);
}

export function ERR<E extends Error>(error: E): Err<never, E> {
  return new Err(error);
}
