// Re-exports agregados por subdomínio.
// Consumidores devem preferir importar do arquivo de domínio diretamente:
//   import { createCardAction } from '@/features/board/server/actions/card.actions'
// Este barril existe para compatibilidade e conveniência.

export * from './board.actions';
export * from './card.actions';
export * from './list.actions';
export * from './comment.actions';
export * from './diagram.actions';
