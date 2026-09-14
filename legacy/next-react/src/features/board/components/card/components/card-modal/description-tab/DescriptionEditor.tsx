import { RichTextEditor } from "@/ui/components/RichTextEditor";

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
      <div className="mt-2 flex items-center justify-between">
        <span className="px-1 text-[11px] font-bold tracking-widest uppercase opacity-50">
          {savedStatus === "saving" ? (
            <span className="animate-pulse" style={{ color: "#fbbf24" }}>
              Saving
            </span>
          ) : savedStatus === "saved" ? (
            <span style={{ color: "#34d399" }}>✓ Saved</span>
          ) : (
            <span>Markdown · Auto-save</span>
          )}
        </span>
        <button
          onClick={onClose}
          className="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm px-3 py-1 text-[12px] font-bold tracking-wider uppercase transition-all focus:outline-none"
        >
          Close editor
        </button>
      </div>
    </>
  );
}
