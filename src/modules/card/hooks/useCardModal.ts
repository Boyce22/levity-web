import { useState, useEffect, useCallback } from "react";
import { Card as CardType, updateCardDetailsAction } from "@/modules/board/actions/board";
import { getCommentsAction, createCommentAction, Comment } from "@/modules/board/actions/comments";
import { getCardHistoryAction } from "@/modules/board/actions/history";

export function useCardModal(card: CardType | null, onUpdate: (card: CardType) => void) {
  // Card fields
  const [content, setContent] = useState(card?.content || "");
  const [description, setDescription] = useState(card?.description || "");
  const [coverUrl, setCoverUrl] = useState(card?.cover_url || "");
  const [dueDate, setDueDate] = useState(card?.due_date || "");
  const [selectedLabel, setSelectedLabel] = useState(card?.label || null);
  const [selectedPriority, setSelectedPriority] = useState(card?.priority || null);
  const [assigneeId, setAssigneeId] = useState(card?.assignee_id || null);

  // UI states
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "comments">("description");
  const [savedStatus, setSavedStatus] = useState<"idle" | "saving" | "saved">("idle");

  // Comments
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // History
  const [history, setHistory] = useState<any[]>([]);

  // Auto-save description
  useEffect(() => {
    if (!isEditingDesc || description === card?.description) return;
    setSavedStatus("saving");
    const timer = setTimeout(async () => {
      await handleSave({ description });
      setSavedStatus("saved");
      setTimeout(() => setSavedStatus("idle"), 2000);
    }, 1500);
    return () => clearTimeout(timer);
  }, [description, isEditingDesc]);

  // Load data
  useEffect(() => {
    if (!card) return;
    const load = async () => {
      const [commentsData, historyData] = await Promise.all([
        getCommentsAction(card.id, 3, null),
        getCardHistoryAction(card.id),
      ]);
      setComments(commentsData);
      setHasMoreComments(commentsData.filter((c) => !c.parent_id).length === 3);
      setHistory(historyData);
      setLoadingComments(false);
    };
    load();
  }, [card]);

  const handleSave = useCallback(async (overrides?: Partial<CardType>) => {
    if (!card) return;
    const changes = {
      content,
      description,
      cover_url: coverUrl,
      assignee_id: assigneeId,
      due_date: dueDate,
      label: selectedLabel,
      priority: selectedPriority,
      ...overrides,
    };
    onUpdate({ ...card, ...changes });
    await updateCardDetailsAction(card.id, changes);
  }, [card, content, description, coverUrl, assigneeId, dueDate, selectedLabel, selectedPriority, onUpdate]);

  const toggleAssignee = useCallback(async (userId: string) => {
    const next = assigneeId === userId ? null : userId;
    setAssigneeId(next);
    await handleSave({ assignee_id: next });
  }, [assigneeId, handleSave]);

  const handleLabelSelect = useCallback(async (labelId: string) => {
    const next = selectedLabel === labelId ? null : labelId;
    setSelectedLabel(next as any);
    await handleSave({ label: next  as any });
  }, [selectedLabel, handleSave]);

  const handlePrioritySelect = useCallback(async (pId: string) => {
    const next = selectedPriority === pId ? null : pId;
    setSelectedPriority(next as any);
    await handleSave({ priority: next  as any });
  }, [selectedPriority, handleSave]);

  const handleCoverUpload = useCallback(async (url: string) => {
    setCoverUrl(url);
    await handleSave({ cover_url: url });
  }, [handleSave]);

  const handleRemoveCover = useCallback(async () => {
    setCoverUrl("");
    await handleSave({ cover_url: "" });
  }, [handleSave]);

  const handlePostComment = useCallback(async (commentText: string, parentId: string | null = null) => {
    if (!card) return;
    const newComment = await createCommentAction(card.id, commentText, parentId);
    if (newComment) setComments((prev) => [...prev, newComment]);
  }, [card]);

  const loadMoreComments = useCallback(async () => {
    if (!card) return;
    setIsLoadingMore(true);
    const parents = comments.filter((c) => !c.parent_id);
    const cursor = parents[0]?.created_at || null;
    if (cursor) {
      const more = await getCommentsAction(card.id, 3, cursor);
      setComments((prev) => [...prev, ...more]);
      setHasMoreComments(more.filter((c) => !c.parent_id).length === 3);
    }
    setIsLoadingMore(false);
  }, [card, comments]);

  return {
    content,
    setContent,
    description,
    setDescription,
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
    history,
    handleSave,
    toggleAssignee,
    handleLabelSelect,
    handlePrioritySelect,
    handleCoverUpload,
    handleRemoveCover,
  };
}