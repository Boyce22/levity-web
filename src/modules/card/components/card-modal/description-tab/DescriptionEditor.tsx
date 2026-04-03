import RichTextEditor from "@/modules/shared/components/RichTextEditor";

interface DescriptionEditorProps {
  value: string;
  onChange: (val: string) => void;
  savedStatus: "idle" | "saving" | "saved";
  onClose: () => void;
  workspaceId: string;
}

export function DescriptionEditor({ value, onChange, savedStatus, onClose, workspaceId }: DescriptionEditorProps) {
  return (
    <>
      <RichTextEditor initialValue={value} onChange={onChange} workspaceId={workspaceId} />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-bold uppercase tracking-widest opacity-50 px-1">
          {savedStatus === "saving" ? (
            <span className="animate-pulse" style={{ color: "#fbbf24" }}>
              Salvando…
            </span>
          ) : savedStatus === "saved" ? (
            <span style={{ color: "#34d399" }}>✓ Salvo</span>
          ) : (
            <span>Markdown · Auto-save</span>
          )}
        </span>
        <button
          onClick={onClose}
          className="px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:bg-[var(--app-panel)] rounded-sm transition-all focus:outline-none"
        >
          Fechar editor
        </button>
      </div>
    </>
  );
}