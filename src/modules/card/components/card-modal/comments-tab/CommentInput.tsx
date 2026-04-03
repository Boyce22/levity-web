import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMentions } from "@/modules/card/hooks/useMentions";
import { uploadImageAction } from "@/modules/shared/actions/upload";
import { AttachmentCard } from "../AttachmentCard";

interface CommentInputProps {
  avatarUrl: string;
  onPost: (text: string, parentId?: string | null) => Promise<void> | void;
  replyingTo: any | null;
  onCancelReply: () => void;
  allUsers: any[];
  workspaceId: string;
}

interface StagedFile {
  name: string;
  url: string;
}

function serializeContent(el: HTMLElement): string {
  let result = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const txt = node.textContent ?? "";
      result += txt === "\u200B" ? "" : txt;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.tagName === "BR") {
        result += "\n";
      } else if (element.dataset.mention) {
        result += element.dataset.value ?? element.textContent ?? "";
      } else if (element.tagName === "DIV" || element.tagName === "P") {
        result += "\n" + serializeContent(element);
      } else {
        result += serializeContent(element);
      }
    }
  }
  return result;
}

function renderTokens(text: string, container: HTMLElement) {
  const sel = window.getSelection();
  let caretOffset = 0;

  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preRange.toString().replace(/\u200B/g, "").length;
  }

  container.innerHTML = "";

  const parts = text.split(/(@\w+)/g);
  let charCount = 0;
  let caretNode: Node | null = null;
  let caretNodeOffset = 0;

  for (const part of parts) {
    if (!part) continue;

    if (/^@\w+$/.test(part)) {
      const span = document.createElement("span");
      span.dataset.mention = "true";
      span.dataset.value = part;
      span.textContent = part;
      span.style.cssText = [
        "color: var(--app-primary)",
        "background: var(--app-primary-muted)",
        "border-radius: 3px",
        "padding: 0 2px",
        "font-weight: 500",
      ].join(";");
      span.contentEditable = "false";
      container.appendChild(span);

      const spacer = document.createTextNode("\u200B");
      container.appendChild(spacer);
      charCount += part.length;
      if (caretOffset <= charCount && !caretNode) {
        caretNode = spacer;
        caretNodeOffset = 1;
      }
    } else {
      const lines = part.split("\n");
      lines.forEach((line, li) => {
        if (li > 0) {
          container.appendChild(document.createElement("br"));
          charCount += 1;
        }
        if (line.length > 0) {
          const textNode = document.createTextNode(line);
          container.appendChild(textNode);
          if (caretOffset <= charCount + line.length && !caretNode) {
            caretNode = textNode;
            caretNodeOffset = caretOffset - charCount;
          }
          charCount += line.length;
        }
      });
    }
  }

  if (sel && caretNode) {
    try {
      const newRange = document.createRange();
      newRange.setStart(caretNode, Math.min(caretNodeOffset, (caretNode as Text).length ?? 0));
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // range inválido, ignora
    }
  }
}

function focusAtEnd(el: HTMLElement) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
  el.focus();
}

export function CommentInput({
  avatarUrl,
  onPost,
  replyingTo,
  onCancelReply,
  allUsers,
  workspaceId,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const editableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isComposingRef = useRef(false);

  const {
    mentionState,
    setMentionState,
    handleMentionTextChange,
    handleMentionKeyDown,
  } = useMentions(allUsers);

  const handleMentionSelect = useCallback(
    (user: any) => {
      const atIndex = text.lastIndexOf("@");
      if (atIndex === -1) return;

      const newText = text.slice(0, atIndex) + `@${user.username} `;
      setText(newText);
      setMentionState({ active: false, query: "", target: null, index: 0, filteredUsers: [] });

      if (editableRef.current) {
        renderTokens(newText, editableRef.current);
        focusAtEnd(editableRef.current);
      }
    },
    [text, setMentionState]
  );

  useEffect(() => {
    if (editableRef.current && replyingTo) {
      editableRef.current.focus();
    }
  }, [replyingTo]);

  const handleInput = useCallback(() => {
    if (!editableRef.current || isComposingRef.current) return;
    const raw = serializeContent(editableRef.current);
    setText(raw);

    const sel = window.getSelection();
    let cursorPos = raw.length;
    if (sel && sel.rangeCount > 0 && editableRef.current) {
      const range = sel.getRangeAt(0);
      const preRange = document.createRange();
      preRange.selectNodeContents(editableRef.current);
      preRange.setEnd(range.endContainer, range.endOffset);
      cursorPos = preRange.toString().replace(/\u200B/g, "").length;
    }

    handleMentionTextChange(raw, "comment", cursorPos);
  }, [handleMentionTextChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setSubmitError("");

    if (file.size > 10 * 1024 * 1024) {
      setSubmitError("O arquivo é muito grande. Limite: 10MB.");
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      const url = await uploadImageAction(fd, workspaceId);

      setStagedFiles(prev => [...prev, { name: file.name, url }]);
    } catch (err) {
      console.error("Upload failed", err);
      setSubmitError("Erro ao carregar arquivo. Tente novamente.");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (mentionState.active && mentionState.filteredUsers.length > 0) {
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault();
          handleMentionSelect(mentionState.filteredUsers[mentionState.index]);
          return;
        }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          handleMentionKeyDown(e);
          return;
        }
      }

      if (e.key === "Backspace" && !mentionState.active) {
        const sel = window.getSelection();
        if (sel?.isCollapsed && sel.anchorNode) {
          const { anchorNode: anchor, anchorOffset: offset } = sel;
          const isSpacerOnly =
            anchor.nodeType === Node.TEXT_NODE &&
            offset <= 1 &&
            (anchor.textContent === "\u200B" || anchor.textContent === "");
          const prev = anchor.previousSibling;

          if (isSpacerOnly && prev instanceof HTMLElement && (prev.dataset.mention)) {
            e.preventDefault();
            (anchor as ChildNode).remove();
            prev.remove();
            handleInput();
            return;
          }
        }
      }

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && !mentionState.active) {
        e.preventDefault();
        handleSubmit();
        return;
      }

      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && !mentionState.active) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
    },
    [mentionState, handleMentionKeyDown, handleMentionSelect]
  );

  const handleSubmit = async () => {
    if ((!text.trim() && stagedFiles.length === 0) || isSubmitting) return;

    const filesMarkdown = stagedFiles
      .map(f => ` [Arquivo: ${f.name}](${f.url}?name=${encodeURIComponent(f.name)}) `)
      .join("");

    const finalDraft = (text + filesMarkdown).trim();

    setText("");
    setStagedFiles([]);
    setSubmitError("");
    setMentionState({ active: false, query: "", target: null, index: 0, filteredUsers: [] });
    if (editableRef.current) editableRef.current.innerHTML = "";

    setIsSubmitting(true);
    try {
      await onPost(finalDraft, replyingTo?.id ?? null);
    } catch {
      setText(text);
      setStagedFiles(stagedFiles);
      if (editableRef.current) renderTokens(text, editableRef.current);
      setSubmitError("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmpty = text.trim().length === 0 && stagedFiles.length === 0;

  return (
    <div className="flex gap-3 items-start">
      <img
        src={avatarUrl}
        className="w-8 h-8 rounded-sm object-cover shrink-0 mt-1 bg-[var(--app-panel)]"
        style={{ border: "1.5px solid var(--app-border-faint)" }}
      />
      <div
        className="flex-1 rounded-sm overflow-visible relative transition-all duration-300 focus-within:ring-2 z-20"
        style={{
          background: "var(--app-panel)",
          border: "1px solid var(--app-border)",
          ["--tw-ring-color" as string]: "var(--app-primary)",
        }}
      >
        {createPortal(
          <AnimatePresence>
            {mentionState.active && mentionState.filteredUsers.length > 0 && editableRef.current && (() => {
              const rect = editableRef.current.getBoundingClientRect();
              return (
                <motion.div
                  key="mention-list"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  className="fixed z-[99999] py-1"
                  style={{
                    top: rect.bottom + 8,
                    left: rect.left,
                    width: Math.max(rect.width, 220),
                    maxHeight: "30vh",
                    overflowY: "auto",
                    borderRadius: "6px",
                    background: "var(--app-panel)",
                    border: "1px solid var(--app-border)",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
                  }}
                >
                  {mentionState.filteredUsers.map((u, i) => (
                    <div
                      key={u.id}
                      onMouseDown={(e) => { e.preventDefault(); handleMentionSelect(u); }}
                      onMouseEnter={() => setMentionState((p) => ({ ...p, index: i }))}
                      className="px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors"
                      style={{
                        background: i === mentionState.index ? "var(--app-primary-muted)" : "transparent",
                      }}
                    >
                      <img
                        src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`}
                        className="w-5 h-5 rounded-[4px] object-cover"
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: i === mentionState.index ? "var(--app-primary)" : "var(--app-text)" }}
                      >
                        {u.display_name || u.username}
                      </span>
                    </div>
                  ))}
                </motion.div>
              );
            })()}
          </AnimatePresence>,
          document.body
        )}

        {replyingTo && (
          <div
            className="px-4 py-2 flex justify-between items-center text-[11px] rounded-t-xl"
            style={{
              background: "var(--app-border-faint)",
              borderBottom: "1px solid var(--app-border)",
              color: "var(--app-text-muted)",
            }}
          >
            <span>
              Respondendo para{" "}
              <span className="font-medium" style={{ color: "var(--app-text)" }}>
                @{replyingTo.users?.display_name || replyingTo.users?.username}
              </span>
            </span>
            <button onClick={onCancelReply}>✕</button>
          </div>
        )}

        <div className="relative min-h-[100px]">
          {(text.trim().length === 0) && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none select-none"
              style={{
                font: "13px/20px var(--font-sans), system-ui, sans-serif",
                padding: "12px 16px 8px 16px",
                color: "var(--app-text-muted)",
                opacity: 0.6,
              }}
            >
              {replyingTo
                ? "Escreva sua resposta… @ para mencionar (⌘↵ para enviar)"
                : "Adicione um comentário… @ para mencionar (⌘↵ para enviar)"}
            </div>
          )}

          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => { isComposingRef.current = true; }}
            onCompositionEnd={() => { isComposingRef.current = false; handleInput(); }}
            spellCheck={false}
            className="w-full focus:outline-none max-h-[180px] overflow-y-auto"
            style={{
              font: "13px/20px var(--font-sans), system-ui, sans-serif",
              padding: "12px 16px 8px 16px",
              color: "var(--app-text)",
              caretColor: "var(--app-text)",
              boxSizing: "border-box",
              wordBreak: "break-word",
              overflowWrap: "break-word",
              minHeight: "100px",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>

        {/* Rodapé */}
        <div
          className="px-3 pb-3 flex flex-col gap-2"
          style={{ borderTop: stagedFiles.length > 0 ? "1px solid var(--app-border-faint)" : undefined }}
        >
          {/* Arquivos anexados — inline no rodapé */}
          {stagedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {stagedFiles.map((file, i) => (
                <div key={i} className="w-full sm:w-[calc(50%-4px)] max-w-[240px]">
                  <AttachmentCard
                    url={file.url}
                    name={file.name}
                    onDelete={() => removeStagedFile(i)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="flex gap-1 items-center">
              <input
                ref={fileInputRef}
                id="comment-file-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploadingFile}
              />
              <label
                htmlFor="comment-file-input"
                aria-disabled={isUploadingFile}
                className="p-1.5 rounded-sm transition-colors hover:bg-[var(--app-hover)] aria-disabled:opacity-40 cursor-pointer"
                style={{ color: "var(--app-text-muted)" }}
                title="Anexar arquivo"
              >
                {isUploadingFile
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Paperclip className="w-4 h-4" />}
              </label>
              {stagedFiles.length > 0 && (
                <span className="text-[10px] text-[var(--app-text-muted)] opacity-50">
                  {stagedFiles.length} arquivo{stagedFiles.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isEmpty || isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-2 shadow-sm shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 text-white text-[13px] font-bold rounded-sm transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                !isEmpty
                  ? { background: "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)" }
                  : {
                    background: "var(--app-hover)",
                    border: "1px solid var(--app-border)",
                    color: "var(--app-text-muted)",
                  }
              }
            >
              {isSubmitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
                : <>Enviar <Send className="w-4 h-4" /></>}
            </button>
          </div>
        </div>

        {submitError && (
          <p className="px-3 pb-2 text-[11px] font-medium" style={{ color: "#f87171" }}>
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}