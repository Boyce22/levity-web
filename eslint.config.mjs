import js from '@eslint/js';
import globals from 'globals';
import svelte from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import tseslint from 'typescript-eslint';
export default tseslint.config(js.configs.recommended, ...tseslint.configs.recommended, ...svelte.configs.recommended, { languageOptions: { globals: globals.browser } }, { files: ['**/*.svelte'], languageOptions: { parser: svelteParser, parserOptions: { parser: tseslint.parser } }, rules: { 'svelte/no-navigation-without-resolve': 'off', 'no-undef': 'off' } }, { ignores: ['.next/**', '.svelte-kit/**', 'build/**', 'node_modules/**', 'rename-snake-case.js', 'src/app/**', 'src/features/**', 'src/contracts/**', 'src/infra/**', 'src/proxy.ts', 'src/ui/**'] });
