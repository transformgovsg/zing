# 0003: Usage of Result Type for Error Handling 🛠️

## Status

✅ Accepted

## 🤔 Context

Handling errors effectively is crucial for robust applications. Traditional methods in TypeScript, such as throwing exceptions (`throw new Error(...)`) and using `try...catch` blocks, have drawbacks:

1.  **Implicit Failure:** Function signatures don't explicitly indicate that an operation might fail, requiring callers to inspect the implementation or rely on documentation (which might be outdated) to know if they need a `try...catch`.
2.  **Unhandled Exceptions:** Uncaught exceptions, especially in asynchronous code (Promises), can lead to application crashes or unexpected states.
3.  **Error Swallowing:** `try...catch` blocks can sometimes inadvertently swallow errors if not implemented carefully.
4.  **Distinguishing Expected vs. Exceptional Errors:** Exceptions are often better suited for truly exceptional, unrecoverable situations, not for predictable failure modes (e.g., resource not found, invalid input).

We need a more explicit and type-safe mechanism to represent operations that can either succeed with a value or fail with a specific error. The `Result` pattern, common in functional languages like Rust, provides such a mechanism. We have implemented a basic `Result<T, E>` type (`Ok<T, E>` and `Err<T, E>`) within this project to facilitate this pattern.

## 🎯 Decision

1.  **Return `Result` for Predictable Failures:** Functions that can fail in a controlled way (e.g., data fetching, validation, parsing) should return a `Result<T, E>` instead of throwing exceptions for those failure cases. Use the `OK(value)` factory function for success and the `ERR(error)` factory function for failure, ensuring the `error` is specific and informative.

2.  **Explicitly Handle Both `Ok` and `Err` Cases:** Callers of functions returning `Result<T, E>` **must** explicitly handle both `Ok` and `Err` cases. This typically involves using `isOk()`/`isErr()` type guards to safely access `.value` or `.error`. Use `unwrap()` cautiously (⚠️) only when an `Err` is truly unrecoverable at that point, and use `unwrapOr(defaultValue)` for providing fallbacks.

3.  **Use Specific, Discriminable Error Types:** Strive to use specific custom `Error` subclasses for the `E` type parameter in `Err<T, E>`. These custom error classes **must** include a `readonly type: string` property (e.g., `readonly type = 'VALIDATION_ERROR';`) to serve as a discriminant. This allows for reliable type checking (e.g., using `switch (error.type)`) and enables callers to implement more granular error handling based on the specific kind of error encountered.

4.  **Reserve Exceptions for Exceptional Errors:** Continue using standard exceptions (`throw`) for truly exceptional, unexpected, or unrecoverable errors (e.g., programming mistakes, critical system failures). Do not use `throw` for expected failure conditions that should be represented by `Err`.

## ⚖️ Consequences

### Advantages

- **Explicitness & Type Safety:** Function signatures clearly indicate potential failure (`Result<T, E>`), enforced by the TypeScript compiler.
- **Forced Error Handling:** Callers are required to consciously handle the `Err` case, reducing the likelihood of unhandled errors.
- **Improved Readability:** Makes the success and failure paths explicit in the code flow.
- **Clear Distinction:** Separates predictable failures (`Err`) from exceptional circumstances (`throw`).

### Disadvantages

- **Increased Verbosity:** Requires explicit checks (`isOk`/`isErr`) or unwrapping (`unwrap`/`unwrapOr`), which can add verbosity compared to `try...catch` for simple cases.
- **Initial Learning Curve:** Developers need time to understand and consistently apply the `Result` pattern.
- **Interoperability Effort:** Requires careful adaptation when interacting with code (libraries, built-in APIs) that primarily relies on exceptions.
