// Config ESLint — TypeScript strict, alignée sur CLAUDE.md (« pas de any »).
// Volontairement minimale : @typescript-eslint (déjà en devDeps) + recommandé ESLint.
// Pas de plugin react/react-native pour l'instant (non installés) — à ajouter plus
// tard si besoin, sans réécrire ce socle.
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    es2021: true,
    node: true,
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    // Règle impérative du projet : aucun any.
    '@typescript-eslint/no-explicit-any': 'error',
    // Tolère les variables/args préfixés _ (signatures, destructuring partiel).
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // TS gère l'inférence des retours ; pas d'annotation imposée.
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  ignorePatterns: ['node_modules', 'babel.config.js', '*.config.js'],
};
