{
  "extends": "@eslint/js",
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "react-hooks", "react-refresh"],
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-refresh/only-export-components": "warn",
    "prefer-const": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn"
  },
  "env": {
    "browser": true,
    "node": true,
    "es2022": true
  }
}
