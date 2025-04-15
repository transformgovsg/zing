# Changelog

All notable changes to this project will be documented in this file.

## 0.4.0 (2025-04-15)

### BREAKING CHANGES ⚠️

- fix(request)!: replace `Buffer.concat` with manual `Uint8Array` merging in `body()` ([#17](https://github.com/transformgovsg/zing/pull/17)) ([5a21670](https://github.com/transformgovsg/zing/commit/5a21670633e3c42b6da929267dae6829630144e9))

### Bug Fixes 🐛

- fix: export `Options` type ([#16](https://github.com/transformgovsg/zing/pull/16)) ([1a46c0a](https://github.com/transformgovsg/zing/commit/1a46c0a163a43da0c7233b5162fd6f981f2910c5))

### Feature ✨

- feat: add option to configure `maxBodySize` when reading request content ([#14](https://github.com/transformgovsg/zing/pull/14)) ([395ce42](https://github.com/transformgovsg/zing/commit/395ce424d80a4ee38e0238dac1b54fdb7d38fa42))

## 0.3.0 (2025-04-13)

### BREAKING CHANGES ⚠️

- refactor!: rename `ZingError` to `BaseError` ([#13](https://github.com/transformgovsg/zing/pull/13)) ([ad5d4df](https://github.com/transformgovsg/zing/commit/ad5d4df127653e8b733512fe38129ac77048523b))

### Feature ✨

- feat: add option to configure `maxBodySize` when reading request content ([#14](https://github.com/transformgovsg/zing/pull/14)) ([395ce42](https://github.com/transformgovsg/zing/commit/395ce424d80a4ee38e0238dac1b54fdb7d38fa42))

## 0.2.0 (2025-04-12)

### Feature ✨

- feat: support parsing and serialising of cookies in requests and responses ([#8](https://github.com/transformgovsg/zing/pull/8)) ([edd331d](https://github.com/transformgovsg/zing/commit/edd331d1aa6023da07bafe330417cae6975d4ade))

## 0.1.0 (2025-04-08)

### Initial Release 🚀

This initial release of `@transformgovsg/zing` provides a lightweight web framework for building web applications.

To use the framework, install it using your preferred package manager:

```sh
pnpm add @transformgovsg/zing
```
