import { useState, useRef } from "react";

export function useMentions(allUsers: any[]) {
  const [mentionState, setMentionState] = useState<{
    active: boolean;
    query: string;
    target: "desc" | "comment" | null;
    index: number;
    filteredUsers: any[];
  }>({ active: false, query: "", target: null, index: 0, filteredUsers: [] });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMentionTextChange = (
    val: string,
    target: "comment",
    cursorIdx: number,
  ) => {
    const beforeCursor = val.slice(0, cursorIdx);
    const match = beforeCursor.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      const query = match[1];
      const filtered = allUsers
        .filter(
          (u) =>
            u.username.toLowerCase().startsWith(query.toLowerCase()) ||
            (u.display_name &&
              u.display_name.toLowerCase().startsWith(query.toLowerCase())),
        )
        .slice(0, 5);
      setMentionState({
        active: true,
        query,
        target,
        index: 0,
        filteredUsers: filtered,
      });
    } else {
      setMentionState((prev) => ({ ...prev, active: false }));
    }
  };

  const handleMentionSelect = (user: any, currentText: string, setText: (t: string) => void) => {
    if (!mentionState.active || !mentionState.target) return;
    const val = currentText;
    const cursor = textareaRef.current?.selectionStart || val.length;
    const textBefore = val.slice(0, cursor);
    const textAfter = val.slice(cursor);
    const match = textBefore.match(/(?:^|\s)@(\w*)$/);
    if (match) {
      const start = textBefore.lastIndexOf("@" + mentionState.query);
      const newBefore = textBefore.slice(0, start) + `@${user.username} `;
      setText(newBefore + textAfter);
      setMentionState((prev) => ({ ...prev, active: false }));
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.setSelectionRange(newBefore.length, newBefore.length);
      }, 0);
    }
  };

  const handleMentionKeyDown = (e: React.KeyboardEvent) => {
    if (!mentionState.active || mentionState.filteredUsers.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionState((p) => ({
        ...p,
        index: (p.index + 1) % p.filteredUsers.length,
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionState((p) => ({
        ...p,
        index: (p.index - 1 + p.filteredUsers.length) % p.filteredUsers.length,
      }));
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      // We'll handle selection in the component that has the text state
    } else if (e.key === "Escape") {
      setMentionState((p) => ({ ...p, active: false }));
    }
  };

  return {
    mentionState,
    setMentionState,
    textareaRef,
    handleMentionTextChange,
    handleMentionSelect,
    handleMentionKeyDown,
  };
}