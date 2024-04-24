export default [
  {
    "root": true,
    "env": {
      "browser": true,
      "es2021": true
    },
    "extends": [
      "eslint:recommended",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "plugins": ["react", "@typescript-eslint"],
    "rules": {
      // Your rules here
    },
    "settings": {
      "react": {
        "version": "detect"
      }
    },
    "overrides": [
      {
        "files": ["*.ts", "*.tsx"],
        "linterOptions": {
          "reportUnusedDisableDirectives": true
        }
      }
    ]
  }
];