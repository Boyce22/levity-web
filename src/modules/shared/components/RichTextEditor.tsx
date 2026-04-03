'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { uploadImageAction } from '@/modules/shared/actions/upload';
import { ListTodo, Paperclip, Loader2 } from 'lucide-react';
import { extractStorageUrls, isImageUrl } from '@/modules/shared/utils/attachments';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  workspaceId: string;
}

export default function RichTextEditor({ initialValue, onChange, onKeyDown, workspaceId }: RichTextEditorProps) {
  const isUpdatingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceIdRef = useRef(workspaceId);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = (view: any, event: any, slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files?.[0]) {
      const file = event.dataTransfer.files[0];
      event.preventDefault();

      const isImage = file.type.startsWith('image/');
      const maxSize = isImage ? 3 * 1024 * 1024 : 10 * 1024 * 1024;

      if (file.size > maxSize) {
        alert(`Arquivo muito grande. Limite: ${isImage ? "3MB" : "10MB"}.`);
        return true;
      }

      const { schema } = view.state;
      const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
      const pos = coordinates ? coordinates.pos : view.state.selection.from;

      const fd = new FormData();
      fd.append('file', file);

      setIsUploading(true);
      uploadImageAction(fd, workspaceIdRef.current).then(url => {
        let node;
        if (isImage) {
          node = schema.nodes.image.create({ src: url, alt: file.name });
        } else {
          // Insere como link markdown se não for imagem
          const linkText = `[Arquivo: ${file.name}](${url})`;
          const textNode = schema.text(linkText);
          const transaction = view.state.tr.insert(pos, textNode);
          view.dispatch(transaction);
          return;
        }
        const transaction = view.state.tr.insert(pos, node);
        view.dispatch(transaction);
      }).catch((e: any) => alert('Upload failed: ' + e.message))
        .finally(() => setIsUploading(false));

      return true;
    }
    return false;
  };

  const handlePaste = (view: any, event: ClipboardEvent, slice: any) => {
    const items = event.clipboardData?.items;
    if (!items) return false;
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile();
        if (file) {
          event.preventDefault();
          const isImage = file.type.startsWith('image/');
          const maxSize = isImage ? 3 * 1024 * 1024 : 10 * 1024 * 1024;

          if (file.size > maxSize) {
            alert(`Arquivo muito grande. Limite: ${isImage ? "3MB" : "10MB"}.`);
            return true;
          }

          const { schema } = view.state;
          const fd = new FormData();
          fd.append('file', file);

          setIsUploading(true);
          uploadImageAction(fd, workspaceIdRef.current).then(url => {
            let node;
            if (isImage) {
              node = schema.nodes.image.create({ src: url, alt: file.name });
            } else {
              const linkText = `[Arquivo: ${file.name}](${url})`;
              const textNode = schema.text(linkText);
              const transaction = view.state.tr.replaceSelectionWith(textNode);
              view.dispatch(transaction);
              return;
            }
            const transaction = view.state.tr.replaceSelectionWith(node);
            view.dispatch(transaction);
          }).catch((e: any) => alert('Paste failed: ' + e.message))
            .finally(() => setIsUploading(false));
          return true;
        }
      }
    }
    return false;
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Markdown,
      Placeholder.configure({
        placeholder: 'Descreva esta tarefa… Suporta **Markdown**. Use ☑ para criar checklists.',
      }),
      TaskList.configure({
        HTMLAttributes: { class: 'task-list' },
      }),
      TaskItem.configure({
        nested: false,
        HTMLAttributes: { class: 'task-item' },
      }),
    ],
    content: initialValue,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[160px] p-4 leading-relaxed',
      },
      handleDrop,
      handlePaste,
    },
    onUpdate: ({ editor }) => {
      isUpdatingRef.current = true;
      onChange((editor.storage as any).markdown.getMarkdown());
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    },
  });

  const handleFileClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 3 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      alert(`Arquivo muito grande. Limite: ${isImage ? "3MB" : "10MB"}.`);
      return;
    }

    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const url = await uploadImageAction(fd, workspaceId);

      if (isImage) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } else {
        editor.chain().focus().insertContent(`[Arquivo: ${file.name}](${url})`).run();
      }
    } catch (err: any) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div
      className="w-full rounded-xl transition-all relative group"
      style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center gap-1 px-3 pt-2 pb-1"
        style={{ borderBottom: '1px solid var(--app-border-faint)' }}
      >
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: editor?.isActive('taskList') ? 'var(--app-primary-muted)' : 'transparent',
            color: editor?.isActive('taskList') ? 'var(--app-primary)' : 'var(--app-text-muted)',
            border: editor?.isActive('taskList') ? '1px solid var(--app-primary)' : '1px solid transparent',
          }}
          title="Inserir checklist"
        >
          <ListTodo className="w-3.5 h-3.5" />
          Checklist
        </button>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={handleFileClick}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] font-medium transition-all hover:bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] disabled:opacity-40"
          title="Anexar arquivo"
        >
          {isUploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Paperclip className="w-3.5 h-3.5" />
          )}
          Anexo
        </button>

        <div
          style={{ width: '1px', height: '16px', background: 'var(--app-border-faint)', margin: '0 4px' }}
        />
        <span className="text-[11px]" style={{ color: 'var(--app-text-muted)', opacity: 0.5 }}>
          Markdown · drag&drop de imagens
        </span>
      </div>

      <div onClick={() => editor?.commands.focus()} onKeyDown={onKeyDown}>
        <EditorContent editor={editor} />
      </div>

      <style>{`
        /* TipTap TaskList / TaskItem DOM structure:
           <ul class="task-list">
             <li class="task-item" data-checked="true/false">
               <label contenteditable="false"><input type="checkbox" /></label>
               <div><p>Task text</p></div>
             </li>
           </ul>
        */
        .task-list {
          list-style: none;
          padding-left: 0.125rem;
          margin: 0.25rem 0;
        }
        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          margin: 0.15rem 0;
          padding: 0;
        }
        .task-item label {
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          margin-top: 3px;
          cursor: pointer;
          line-height: 1;
        }
        .task-item > div,
        .task-item > p {
          flex: 1;
          min-width: 0;
          margin: 0;
          line-height: 1.55;
        }
        .task-item > div > p {
          margin: 0;
        }
        .task-item[data-checked="true"] > div,
        .task-item[data-checked="true"] > p {
          text-decoration: line-through;
          opacity: 0.5;
        }
        /* Custom checkbox */
        .task-item input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid var(--app-border);
          background: transparent;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.15s;
          position: relative;
          display: block;
        }
        .task-item input[type="checkbox"]:hover {
          border-color: var(--app-primary);
        }
        .task-item input[type="checkbox"]:checked {
          background: var(--app-primary);
          border-color: var(--app-primary);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1.5 5l2.5 2.5 4.5-4.5' stroke='white' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-size: 10px 10px;
          background-repeat: no-repeat;
          background-position: center;
        }
      `}</style>
    </div>
  );
}

