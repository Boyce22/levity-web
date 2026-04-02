import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Send, Paperclip, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMentions } from "@/modules/card/hooks/useMentions";

interface CommentInputProps {
  avatarUrl: string;
  onPost: (text: string, parentId?: string | null) => Promise<void> | void;
  replyingTo: any | null;
  onCancelReply: () => void;
  allUsers: any[];
}

// Serializa o conteúdo do contenteditable para texto plano,
// preservando quebras de linha e lendo o data-value dos spans de menção.
function serializeContent(el: HTMLElement): string {
  let result = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.tagName === "BR") {
        result += "\n";
      } else if (element.dataset.mention) {
        // Span de menção — usa o valor canônico salvo no data-value
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

// Renderiza texto plano de volta para nós do DOM dentro do contenteditable,
// transformando tokens @menção em spans estilizados.
function renderTokens(text: string, container: HTMLElement) {
  // Salva o caret antes de apagar o conteúdo
  const sel = window.getSelection();
  let caretOffset = 0;

  // Calcula o offset do caret no texto serializado atual
  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preRange.toString().length;
  }

  // Limpa e reconstrói o conteúdo
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
      span.style.cssText = `
        color: var(--app-primary);
        background: var(--app-primary-muted);
        border-radius: 3px;
        padding: 0 2px;
        font-weight: 500;
      `;
      span.contentEditable = "false"; // Torna o span atômico (não editável internamente)
      container.appendChild(span);

      // Após o span atômico, insere um espaço de texto para o caret poder "sair" do span
      const spacer = document.createTextNode("\u200B"); // zero-width space como ancora
      container.appendChild(spacer);

      charCount += part.length;
      if (caretOffset <= charCount && !caretNode) {
        caretNode = spacer;
        caretNodeOffset = 1;
      }
    } else {
      // Divide o texto por quebras de linha
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

  // Restaura o caret
  if (sel && caretNode) {
    try {
      const newRange = document.createRange();
      newRange.setStart(
        caretNode,
        Math.min(caretNodeOffset, (caretNode as Text).length ?? 0),
      );
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } catch {
      // Silencia erros de range inválido
    }
  }
}

export function CommentInput({
  avatarUrl,
  onPost,
  replyingTo,
  onCancelReply,
  allUsers,
}: CommentInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
  });

  // Ref para o div contenteditable (substitui o textarea)
  const editableRef = useRef<HTMLDivElement>(null);
  // Flag para evitar loop de renderização
  const isComposingRef = useRef(false);

  const {
    mentionState,
    setMentionState,
    handleMentionTextChange,
    handleMentionSelect: _handleMentionSelect,
    handleMentionKeyDown,
  } = useMentions(allUsers);

  // Adapta handleMentionSelect para trabalhar com texto plain e atualizar o contenteditable
  const handleMentionSelect = useCallback(
    (user: any) => {
      // Encontra a posição do @ no texto atual
      const atIndex = text.lastIndexOf("@", text.length);
      if (atIndex === -1) return;

      const before = text.slice(0, atIndex);
      const mention = `@${user.username}`;
      const newText = before + mention + " ";

      setText(newText);
      setMentionState({
        active: false,
        query: "",
        target: null,
        index: 0,
        filteredUsers: [],
      });

      // Atualiza o DOM e move o caret para o fim
      if (editableRef.current) {
        // Seta um caret offset para o fim
        renderTokens(newText, editableRef.current);
        // Move caret para o final
        const el = editableRef.current;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
        el.focus();
      }
    },
    [text, setMentionState],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincroniza posição do menu de menções
  useEffect(() => {
    const updatePos = () => {
      const el = editableRef.current;
      if (mentionState.active && el) {
        const rect = el.getBoundingClientRect();
        setMenuPos({
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    if (mentionState.active) {
      updatePos();
      window.addEventListener("resize", updatePos, { passive: true });
      window.addEventListener("scroll", updatePos, {
        capture: true,
        passive: true,
      });
    }

    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, { capture: true } as any);
    };
  }, [mentionState.active]);

  // Foca ao responder
  useEffect(() => {
    if (editableRef.current && replyingTo) {
      editableRef.current.focus();
    }
  }, [replyingTo]);

  const handleInput = useCallback(() => {
    if (!editableRef.current || isComposingRef.current) return;
    const raw = serializeContent(editableRef.current);
    setText(raw);

    // Obtém posição do cursor no texto plano
    const sel = window.getSelection();
    let cursorPos = raw.length;
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preRange = document.createRange();
      preRange.selectNodeContents(editableRef.current);
      preRange.setEnd(range.endContainer, range.endOffset);
      cursorPos = preRange.toString().length;
    }

    handleMentionTextChange(raw, "comment", cursorPos);
  }, [handleMentionTextChange]);

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

      // Envia com ⌘+Enter ou Ctrl+Enter
      if (
        !mentionState.active &&
        e.key === "Enter" &&
        (e.metaKey || e.ctrlKey)
      ) {
        e.preventDefault();
        handleSubmit();
        return;
      }

      // Enter normal: insere \n em vez de novo div/p
      if (
        e.key === "Enter" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !mentionState.active
      ) {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
    },
    [mentionState, handleMentionKeyDown, handleMentionSelect],
  );

  const handleSubmit = async () => {
    if (!text.trim() || isSubmitting) return;
    const draft = text;
    setText("");
    setSubmitError("");
    setMentionState({
      active: false,
      query: "",
      target: null,
      index: 0,
      filteredUsers: [],
    });
    if (editableRef.current) editableRef.current.innerHTML = "";
    setIsSubmitting(true);
    try {
      await onPost(draft, replyingTo?.id || null);
    } catch (err: any) {
      setText(draft);
      if (editableRef.current) renderTokens(draft, editableRef.current);
      setSubmitError("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEmpty = text.trim().length === 0;

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
        {/* Portal do menu de menções */}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {mentionState.active &&
                mentionState.filteredUsers.length > 0 &&
                menuPos.bottom > 0 && (
                  <motion.div
                    key="mention-list"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    className="fixed z-[99999] overflow-hidden py-1 mt-2"
                    style={{
                      top: menuPos.bottom + 8,
                      left: menuPos.left,
                      width: Math.max(menuPos.width, 220),
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
                        onMouseDown={(e) => {
                          // Usa mousedown para não perder o foco do contenteditable
                          e.preventDefault();
                          handleMentionSelect(u);
                        }}
                        onMouseEnter={() =>
                          setMentionState((p) => ({ ...p, index: i }))
                        }
                        className="px-3 py-2.5 flex items-center gap-2.5 cursor-pointer transition-colors"
                        style={{
                          background:
                            i === mentionState.index
                              ? "var(--app-primary-muted)"
                              : "transparent",
                        }}
                      >
                        <img
                          src={
                            u.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                          }
                          className="w-5 h-5 rounded-[4px] object-cover"
                        />
                        <span
                          className="text-xs font-medium"
                          style={{
                            color:
                              i === mentionState.index
                                ? "var(--app-primary)"
                                : "var(--app-text)",
                          }}
                        >
                          {u.display_name || u.username}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
            </AnimatePresence>,
            document.body,
          )}

        {/* Banner de resposta */}
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
              <span
                className="font-medium"
                style={{ color: "var(--app-text)" }}
              >
                @{replyingTo.users?.display_name || replyingTo.users?.username}
              </span>
            </span>
            <button onClick={onCancelReply}>✕</button>
          </div>
        )}

        {/* Área editável — substitui o textarea + highlight layer */}
        <div className="relative min-h-[100px]">
          {/* Placeholder customizado */}
          {isEmpty && (
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
            onCompositionStart={() => {
              isComposingRef.current = true;
            }}
            onCompositionEnd={() => {
              isComposingRef.current = false;
              handleInput();
            }}
            spellCheck={false}
            className="w-full focus:outline-none max-h-[120px] overflow-y-auto"
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

        {/* Rodapé com ações */}
        <div className="px-3 pb-3 flex justify-between items-center relative">
          <div className="flex gap-1">
            <button
              className="p-1.5 rounded-sm transition-colors"
              style={{ color: "var(--app-text-muted)" }}
              title="Sugerência: Use Win + . para emojis nativos"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isEmpty || isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2 shadow-sm shadow-indigo-950/20 focus:ring-4 focus:ring-indigo-500/20 hover:brightness-110 text-white text-[13px] font-bold rounded-sm transition-all focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            style={
              !isEmpty
                ? {
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #312e81 100%)",
                  }
                : {
                    background: "var(--app-hover)",
                    border: "1px solid var(--app-border)",
                    color: "var(--app-text-muted)",
                  }
            }
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Enviando…
              </>
            ) : (
              <>
                Enviar <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {submitError && (
          <p
            className="px-3 pb-2 text-[11px] font-medium"
            style={{ color: "#f87171" }}
          >
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}
