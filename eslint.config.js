// import js from "@eslint/js";
// import globals from "globals";
// import reactHooks from "eslint-plugin-react-hooks";
// import reactRefresh from "eslint-plugin-react-refresh";
// import { defineConfig, globalIgnores } from "eslint/config";

// export default defineConfig([
//   /* ------------------ GLOBAL IGNORES ------------------ */
//   globalIgnores([
//     "dist",
//     "functions/**", // 🔑 IGNORE Firebase backend
//   ]),

//   /* ------------------ FRONTEND (VITE + REACT) ------------------ */
//   {
//     files: ["**/*.{js,jsx}"],
//     ignores: ["functions/**"],

//     extends: [
//       js.configs.recommended,
//       reactHooks.configs.flat.recommended,
//       reactRefresh.configs.vite,
//     ],

//     languageOptions: {
//       ecmaVersion: "latest",
//       sourceType: "module",
//       globals: globals.browser,
//       parserOptions: {
//         ecmaFeatures: { jsx: true },
//       },
//     },

//     rules: {
//       "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
//     },
//   },

//   /* ------------------ FIREBASE FUNCTIONS (NODE) ------------------ */
//   {
//     files: ["functions/**/*.js"],

//     languageOptions: {
//       ecmaVersion: 2021,
//       sourceType: "commonjs",
//       globals: globals.node,
//     },

//     rules: {
//       "no-undef": "off",
//       "no-unused-vars": "off",
//     },
//   },
// ]);
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([ "dist",
  "functions/**", ]),

  // ---------------- FRONTEND ----------------
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  // ---------------- CONTEXTS (FIX) ----------------
  {
    files: ['src/context/**/*.{js,jsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])

