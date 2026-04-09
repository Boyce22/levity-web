import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import reactHooks from "eslint-plugin-react-hooks";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Eleva react-hooks/exhaustive-deps de warn → error.
  // Toda omissão de dependência precisa ser justificada explicitamente com um
  // comentário `// eslint-disable-next-line react-hooks/exhaustive-deps`
  // que explique o motivo (ex: "lido via ref", "estável por garantia do React").
  {
    plugins: { "react-hooks": reactHooks },
    rules: {
      "react-hooks/exhaustive-deps": "error",
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
