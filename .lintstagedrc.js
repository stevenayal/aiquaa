module.exports = {
  '**/*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
  ],
  '**/*.{json,md,yml,yaml,html,css,scss}': [
    'prettier --write',
  ],
  '**/*.{ts,tsx}': [
    'pnpm -r typecheck',
  ],
}
