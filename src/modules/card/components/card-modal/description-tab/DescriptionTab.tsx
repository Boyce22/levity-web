import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DescriptionEditor } from "./DescriptionEditor";
import { HistorySection } from "./HistorySection";
import { AttachmentCard } from "../AttachmentCard";
import { extractStorageUrls, isImageUrl } from "@/modules/shared/utils/attachments";
import { deleteFileAction } from "@/modules/shared/actions/upload";

interface DescriptionTabProps {
  description: string;
  setDescription: (val: string) => void;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  savedStatus: "idle" | "saving" | "saved";
  history: any[];
  allUsers: any[];
  workspaceId: string;
}

export function DescriptionTab({
  description,
  setDescription,
  isEditing,
  setIsEditing,
  savedStatus,
  history,
  allUsers,
  workspaceId,
}: DescriptionTabProps) {
  const urls = extractStorageUrls(description);
  const attachments = urls.filter(url => !isImageUrl(url));

  const handleDeleteAttachment = async (url: string) => {
    // 1. Remover do texto (Markdown)
    const newDescription = description.replace(new RegExp(`\\[.*?\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), '');
    const finalDescription = newDescription.replace(new RegExp(`!?\\[.*?\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'g'), '').trim();
    setDescription(finalDescription);

    // 2. Apagar do bucket (Async)
    deleteFileAction(url);
  };
  return (
    <div className="space-y-4">
      {isEditing ? (
        <div className="space-y-3 relative z-20">
          <DescriptionEditor
            value={description}
            onChange={setDescription}
            savedStatus={savedStatus}
            onClose={() => setIsEditing(false)}
            workspaceId={workspaceId}
          />
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="group cursor-text rounded-sm p-4 transition-all"
          style={{ border: "1px dashed var(--app-border)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--app-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--app-border)")}
        >
          {description ? (
            <div
              className="prose prose-invert prose-sm max-w-none"
              style={{ color: "var(--app-text-muted)" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="rounded-sm max-w-full h-auto my-2"
                      style={{ border: "1px solid var(--app-border-faint)" }}
                    />
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "var(--app-primary)" }}
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {description}
              </ReactMarkdown>
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

      {/* Seção de Anexos da Descrição */}
      {!isEditing && attachments.length > 0 && (
        <div className="space-y-2 pt-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">Anexos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map((url, i) => (
              <AttachmentCard 
                key={i} 
                url={url} 
                onDelete={() => handleDeleteAttachment(url)} 
              />
            ))}
          </div>
        </div>
      )}

      <HistorySection history={history} allUsers={allUsers} />
    </div>
  );
}