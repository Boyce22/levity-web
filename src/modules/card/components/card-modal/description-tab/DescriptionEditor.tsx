import RichTextEditor from "@/modules/shared/components/RichTextEditor";

interface DescriptionEditorProps {
  value: string;
  onChange: (val: string) => void;
  savedStatus: "idle" | "saving" | "saved";
  onClose: () => void;
}

export function DescriptionEditor({ value, onChange, savedStatus, onClose }: DescriptionEditorProps) {
  return (
    <>
      <RichTextEditor initialValue={value} onChange={onChange} />
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-mono">
          {savedStatus === "saving" ? (
            <span className="animate-pulse" style={{ color: "#fbbf24" }}>
              Salvando…
            </span>
          ) : savedStatus === "saved" ? (
            <span style={{ color: "#34d399" }}>✓ Salvo</span>
          ) : (
            <span style={{ color: "var(--app-text-muted)" }}>
              Markdown · auto-salva
            </span>
          )}
        </span>
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-sm font-medium transition-colors"
          style={{ color: "var(--app-text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--app-text)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--app-text-muted)")}
        >
          Fechar editor
        </button>
      </div>
    </>
  );
}