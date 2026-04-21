import {  useState, useEffect, useCallback, useRef } from "react";
import type { Card as CardType  } from '@/contracts/Board';
import { updateCardDetailsAction, getCardHistoryAction } from '@/features/board/server/actions/card.actions';
import { getCommentsAction, createCommentAction, deleteCommentAction } from '@/features/board/server/actions/comment.actions';
import { getDiagramAction, saveDiagramAction } from '@/features/board/server/actions/diagram.actions';
import type { Comment } from '@/contracts/Comment';
import { parseProgress, parseChecklistCounts } from "@/features/board/components/card/utils/parseProgress";

// PRÉ-REQUISITO: `onUpdate` deve ser estabilizado com useCallback no componente pai.
// Se não for, todos os callbacks deste hook serão recriados a cada render do pai.
export function useCardModal(
  card: CardType | null,
  onUpdate: (card: CardType) => void,
  tags: any[],
  priorities: any[],
  workspaceId: string,
  initialTab: "description" | "comments" | "diagram" = "description"
) {
  // Card fields
  const [content, setContent] = useState(card?.content || "");
  const [description, setDescription] = useState(card?.description || "");
  const [coverUrl, setCoverUrl] = useState(card?.coverUrl || "");
  const [dueDate, setDueDate] = useState(card?.dueDate || "");
  const [selectedLabel, setSelectedLabel] = useState(card?.label || null);
  const [selectedPriority, setSelectedPriority] = useState(card?.priority || null);
  const [assigneeId, setAssigneeId] = useState(card?.assigneeId || null);

  // UI states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "comments" | "diagram">(initialTab);
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Diagram
  const [diagramData, setDiagramData] = useState<any>(undefined);
  const [loadingDiagram, setLoadingDiagram] = useState(false);
  const [isSavingDiagram, setIsSavingDiagram] = useState(false);

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  // Ref de guarda para fetchComments: evita incluir `loadingComments` (estado) nas deps
  // do useCallback, o que recriaria a função a cada mudança de loading e causaria
  // re-execuções desnecessárias do useEffect que depende de fetchComments.
  const loadingCommentsRef = useRef(false);

  // Ref para o timer do debounce: permite cancelar o timer anterior sem depender
  // de uma variável local (que seria recriada a cada render da closure do useEffect).
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs dos valores mais recentes dos campos do card: permite que handleSave (modo completo)
  // e o callback do debounce leiam o estado atualizado mesmo dentro de uma janela de 3s,
  // evitando stale closure sem adicionar todos os campos às deps do useCallback.
  // Atualizado sincronamente a cada render (sem useEffect para não atrasar 1 frame).
  const latestValuesRef = useRef({ content, description, coverUrl, assigneeId, dueDate, selectedLabel, selectedPriority });
  latestValuesRef.current = { content, description, coverUrl, assigneeId, dueDate, selectedLabel, selectedPriority };

  // Ref para handleSave: permite que o debounce sempre chame a versão mais recente
  // sem adicionar handleSave às dependências do useEffect de auto-save.
  const handleSaveRef = useRef<(overrides?: Partial<CardType>) => Promise<void>>(async () => {});

  // Sync state & reset on card change
  useEffect(() => {
    if (!card) return;
    setContent(card.content || "");
    setDescription(card.description || "");
    setCoverUrl(card.coverUrl || "");
    setDueDate(card.dueDate || "");
    setSelectedLabel(card.label || null);
    setSelectedPriority(card.priority || null);
    setAssigneeId(card.assigneeId || null);

    // Reset data & loaded flags
    setComments([]);
    setCommentsLoaded(false);
    loadingCommentsRef.current = false;
    setHistory([]);
    setHistoryLoaded(false);
    setDiagramData(undefined);
    setLoadingComments(false);
  }, [card?.id]);

  // handleSave com modo "partial" — quando overrides é passado, envia APENAS os campos do
  // override para evitar histórico fantasma de campos que não mudaram (stale closure problem).
  // Modo completo lê valores via latestValuesRef para garantir dados atualizados mesmo quando
  // chamado de dentro de closures estáveis (debounce, keydown handler).
  const handleSave = useCallback(async (overrides?: Partial<CardType>) => {
    if (!card) return;

    if (overrides) {
      // Modo parcial: ações rápidas (label, priority, assignee, dueDate, cover)
      onUpdate({ ...card, ...overrides });
      await updateCardDetailsAction(card.id, overrides, workspaceId);
      return;
    }

    // Modo completo: lê da ref para não sofrer stale closure na janela de debounce
    const { content, description, coverUrl, assigneeId, dueDate, selectedLabel, selectedPriority } = latestValuesRef.current;
    const changes = {
      content,
      description,
      progress: parseProgress(description),
      coverUrl,
      assigneeId,
      dueDate,
      label: selectedLabel,
      priority: selectedPriority,
    };
    onUpdate({ ...card, ...changes });
    await updateCardDetailsAction(card.id, changes, workspaceId);
  }, [card, onUpdate, workspaceId]); // campos de estado removidos: lidos via latestValuesRef

  // Mantém handleSaveRef sincronizado com a versão mais recente de handleSave
  useEffect(() => {
    handleSaveRef.current = handleSave;
  }, [handleSave]);

  // Auto-save description — debounce com timer via ref e valores via latestValuesRef
  useEffect(() => {
    if (!isEditingDesc || description === card?.description) return;
    setSavedStatus("saving");

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      // Lê o valor mais recente da ref: garante que o save usa o estado final após
      // múltiplas digitações dentro da janela de 3s, sem incluir handleSave nas deps.
      const { description: latestDesc } = latestValuesRef.current;
      const progress = parseProgress(latestDesc);
      await handleSaveRef.current({ description: latestDesc, progress });
      setSavedStatus("saved");
      setTimeout(() => setSavedStatus("idle"), 2000);
    }, 3000); // 3s para evitar múltiplas entradas de histórico

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [description, isEditingDesc]); // handleSave removido: acessado via handleSaveRef

  // Load Comments — loadingComments via ref para não recriar fetchComments a cada mudança de loading
  const fetchComments = useCallback(async () => {
    if (!card || commentsLoaded || loadingCommentsRef.current) return;
    loadingCommentsRef.current = true;
    setLoadingComments(true);
    try {
      const commentsData = await getCommentsAction(card.id, 3, null);
      setComments(commentsData.data);
      setHasMoreComments(commentsData.data.filter((c) => !c.parentId).length === 3);
      setCommentsLoaded(true);
    } finally {
      loadingCommentsRef.current = false;
      setLoadingComments(false);
    }
  }, [card, commentsLoaded]); // loadingComments removido: lido via ref

  // Load History
  const fetchHistory = useCallback(async () => {
    if (!card || historyLoaded) return;
    const historyData = await getCardHistoryAction(workspaceId, card.id);
    setHistory(historyData);
    setHistoryLoaded(true);
  }, [card, historyLoaded, workspaceId]);

  // Load Diagram
  const fetchDiagram = useCallback(async () => {
    if (!card) return;
    setLoadingDiagram(true);
    const data = await getDiagramAction(card.id);
    setDiagramData(data || null);
    setLoadingDiagram(false);
  }, [card]);

  // Trigger lazy loads por tab
  useEffect(() => {
    if (activeTab === "description" && !historyLoaded) {
      fetchHistory();
    } else if (activeTab === "comments" && !commentsLoaded) {
      fetchComments();
    }
  }, [activeTab, historyLoaded, commentsLoaded, fetchHistory, fetchComments]);

  // Lazy load diagram quando tab fica ativa
  useEffect(() => {
    if (activeTab === "diagram" && diagramData === undefined && !loadingDiagram) {
      fetchDiagram();
    }
  }, [activeTab, diagramData, loadingDiagram, fetchDiagram]);

  // toggleAssignee — chama onUpdate via handleSave(partial), sem sync effect separado
  const toggleAssignee = useCallback(async (userId: string) => {
    const next = assigneeId === userId ? null : userId;
    setAssigneeId(next);
    await handleSave({ assigneeId: next });
  }, [assigneeId, handleSave]);

  const handleLabelSelect = useCallback(async (labelId: string) => {
    const next = selectedLabel === labelId ? null : labelId;
    setSelectedLabel(next as any);
    await handleSave({ label: next as any });
  }, [selectedLabel, handleSave]);

  const handlePrioritySelect = useCallback(async (pId: string) => {
    const next = selectedPriority === pId ? null : pId;
    setSelectedPriority(next as any);
    await handleSave({ priority: next as any });
  }, [selectedPriority, handleSave]);

  const handleCoverUpload = useCallback(async (url: string) => {
    setCoverUrl(url);
    await handleSave({ coverUrl: url });
  }, [handleSave]);

  const handleRemoveCover = useCallback(async () => {
    setCoverUrl("");
    await handleSave({ coverUrl: "" });
  }, [handleSave]);

  // Substitui setDescription puro: propaga onUpdate imediatamente para o board
  // (optimistic update) sem depender de um useEffect com múltiplas dependências.
  // A interface pública mantém o nome `setDescription` no return.
  const handleDescriptionChange = useCallback((newDesc: string) => {
    setDescription(newDesc);
    if (!card) return;
    onUpdate({
      ...card,
      description: newDesc,
      progress: parseProgress(newDesc),
    });
  }, [card, onUpdate]);

  const handlePostComment = useCallback(async (commentText: string, parentId: string | null = null) => {
    if (!card) return;
    const newComment = await createCommentAction(card.id, commentText, parentId);
    if (newComment) setComments((prev) => [newComment, ...prev]);
  }, [card]);

  const loadMoreComments = useCallback(async () => {
    if (!card) return;
    setIsLoadingMore(true);
    const parents = comments.filter((c) => !c.parentId);
    const cursor = parents[parents.length - 1]?.createdAt || null;
    if (cursor) {
      const more = await getCommentsAction(card.id, 3, cursor);
      setComments((prev) => [...prev, ...more.data]);
      setHasMoreComments(more.data.filter((c) => !c.parentId).length === 3);
    }
    setIsLoadingMore(false);
  }, [card, comments]);

  const handleDeleteComment = useCallback(async (commentId: string) => {
    // Optimistic update: remove imediatamente da UI
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      await deleteCommentAction(commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  }, []);

  const handleSaveDiagram = useCallback(async (data: any) => {
    if (!card) return;
    setIsSavingDiagram(true);
    // Optimistic Update: atualiza localmente antes de confirmar no servidor
    setDiagramData(data);
    try {
      await saveDiagramAction(card.id, data);
    } catch (error) {
      console.error("Failed to save diagram:", error);
    } finally {
      setIsSavingDiagram(false);
    }
  }, [card]);

  const checklistCounts = parseChecklistCounts(description);

  return {
    content,
    setContent,
    description,
    // setDescription mapeado para handleDescriptionChange para garantir propagação imediata
    // ao board sem sync effect — interface pública inalterada
    setDescription: handleDescriptionChange,
    coverUrl,
    dueDate,
    setDueDate,
    selectedLabel,
    selectedPriority,
    assigneeId,
    isEditingTitle,
    setIsEditingTitle,
    isEditingDesc,
    setIsEditingDesc,
    activeTab,
    setActiveTab,
    savedStatus,
    comments,
    loadingComments,
    hasMoreComments,
    isLoadingMore,
    loadMoreComments,
    handlePostComment,
    handleDeleteComment,
    history,
    handleSave,
    toggleAssignee,
    handleLabelSelect,
    handlePrioritySelect,
    handleCoverUpload,
    handleRemoveCover,
    checklistCounts,
    diagramData,
    loadingDiagram,
    isSavingDiagram,
    handleSaveDiagram,
  };
}
