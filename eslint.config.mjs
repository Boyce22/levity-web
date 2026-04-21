import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";
import tailwindcss from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },

  {
    plugins: { tailwindcss },
    settings: {
      tailwindcss: {
        // Para Tailwind v4, use false
        config: false,
        // Ou para Tailwind v3, aponte para o arquivo
        // config: "./tailwind.config.js",
      },
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/enforces-shorthand": "warn",
      "tailwindcss/no-contradicting-classname": "error",
      "tailwindcss/no-custom-classname": "off",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    ".claude/**",
    "docs/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;