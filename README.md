# Levity Web

Frontend SvelteKit do Levity. A aplicação ativa está em `src/routes` e `src/lib`.

```text
src/
  routes/  # páginas, form actions e endpoints BFF
  lib/     # UI reutilizável, contratos, mappers, estilos e cliente da API
```

O código anterior em Next.js/React está arquivado em `legacy/next-react` e não entra no build, typecheck ou lint.

## Comandos

```bash
npm run dev
npm run check
npm run lint
npm run test
npm run build
```

Para o estado da migração e contratos da API, veja [a documentação de migração](docs/frontend-migration/README.md).
