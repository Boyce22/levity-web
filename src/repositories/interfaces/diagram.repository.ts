
export interface DiagramRecord {
  id: string;
  card_id: string;
  data: any; // JSON structure for the diagram
  created_at: string;
  updated_at: string;
}

export interface IDiagramRepository {
  /** Finds a diagram by card_id. Returns null if not found. */
  findByCardId(cardId: string): Promise<DiagramRecord | null>;

  /** Creates or updates a diagram for a specific card. */
  save(cardId: string, data: any): Promise<DiagramRecord>;

  /** Deletes a diagram by card_id. */
  deleteByCardId(cardId: string): Promise<void>;
}
