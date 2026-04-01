import { DescriptionEditor } from "./DescriptionEditor";
import { HistorySection } from "./HistorySection";

interface DescriptionTabProps {
  description: string;
  setDescription: (val: string) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  savedStatus: "idle" | "saving" | "saved";
  history: any[];
  allUsers: any[];
}

export function DescriptionTab({
  description,
  setDescription,
  isEditing,
  setIsEditing,
  savedStatus,
  history,
  allUsers,
}: DescriptionTabProps) {
  return (
    <div className="space-y-4">
      {isEditing ? (
        <div className="space-y-3 relative z-20">
          <DescriptionEditor
            value={description}
            onChange={setDescription}
            savedStatus={savedStatus}
            onClose={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="group cursor-text rounded-xl p-4 transition-all"
          style={{ border: "1px dashed var(--app-border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--app-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--app-border)")}
        >
          {description ? (
            <div
              className="prose prose-invert prose-sm max-w-none"
              style={{ color: "var(--app-text-muted)" }}
            >
              {/* Markdown rendering would go here */}
              <div dangerouslySetInnerHTML={{ __html: description }} />
            </div>
          ) : (
            <p
              className="text-sm italic opacity-40"
              style={{ color: "var(--app-text)" }}
            >
              Adicione uma descrição… Suporta **Markdown**.
            </p>
          )}
          <p
            className="mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--app-primary)" }}
          >
            Clique para editar
          </p>
        </div>
      )}

      <HistorySection history={history} allUsers={allUsers} />
    </div>
  );
}