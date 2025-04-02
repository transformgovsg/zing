/** @type {import("lint-staged").Config} */
const config = {
  '*.{js,mjs,ts,md,json}': 'prettier --write',
  '*.{js,mjs,ts}': 'eslint --fix',
};

export default config;
