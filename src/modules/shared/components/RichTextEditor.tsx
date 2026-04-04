'use client';

import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { DOMParser } from '@tiptap/pm/model';
import { marked } from 'marked';
import { uploadImageAction } from '@/modules/shared/actions/upload';
import { ListTodo, Paperclip, Loader2 } from 'lucide-react';

// 
const MAX_IMAGE_SIZE = 3 * 1024 * 1024;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

marked.setOptions({ gfm: true });


/** Remove backslash-escapes that chat apps add when copying Markdown. */
function unescapeMarkdown(text: string): string {
  return text.replace(/\\([#*_`~[\]>|!\\-])/g, '$1');
}

/** Converts a Markdown string to a ProseMirror Slice via marked + DOMParser. */
function markdownToSlice(text: string, schema: any) {
  const html = marked.parse(unescapeMarkdown(text), { async: false }) as string;
  const dom = document.createElement('div');
  dom.innerHTML = html;
  return DOMParser.fromSchema(schema).parseSlice(dom, { preserveWhitespace: false });
}

/** Uploads a file and returns the URL. */
async function uploadFile(file: File, workspaceId: string): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  return uploadImageAction(fd, workspaceId);
}


interface RichTextEditorProps {
  initialValue: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  workspaceId: string;
}


export default function RichTextEditor({
  initialValue,
  onChange,
  onKeyDown,
  workspaceId,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workspaceIdRef = useRef(workspaceId);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { workspaceIdRef.current = workspaceId; }, [workspaceId]);

  // ── Drop handler ────────────────────────────────────────────────────────────

  const handleDrop = (view: any, event: DragEvent, _slice: any, moved: boolean) => {
    const file = event.dataTransfer?.files?.[0];
    if (moved || !file) return false;

    event.preventDefault();
    const isImage = file.type.startsWith('image/');
    const limit = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

    if (file.size > limit) {
      alert(`Arquivo muito grande. Limite: ${isImage ? '3MB' : '10MB'}.`);
      return true;
    }

    const { schema } = view.state;
    const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
    const pos = coords?.pos ?? view.state.selection.from;

    setIsUploading(true);
    uploadFile(file, workspaceIdRef.current)
      .then(url => {
        const node = isImage
          ? schema.nodes.image.create({ src: url, alt: file.name })
          : schema.text(`[Arquivo: ${file.name}](${url})`);
        view.dispatch(view.state.tr.insert(pos, node));
      })
      .catch((e: any) => alert('Upload failed: ' + e.message))
      .finally(() => setIsUploading(false));

    return true;
  };

  // ── Paste handler ───────────────────────────────────────────────────────────

  const handlePaste = (view: any, event: ClipboardEvent) => {
    const items = Array.from(event.clipboardData?.items ?? []);

    // 1. File paste (image or attachment)
    const fileItem = items.find(i => i.kind === 'file');
    if (fileItem) {
      const file = fileItem.getAsFile();
      if (!file) return false;

      event.preventDefault();
      const isImage = file.type.startsWith('image/');
      const limit = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

      if (file.size > limit) {
        alert(`Arquivo muito grande. Limite: ${isImage ? '3MB' : '10MB'}.`);
        return true;
      }

      const { schema } = view.state;
      setIsUploading(true);
      uploadFile(file, workspaceIdRef.current)
        .then(url => {
          const node = isImage
            ? schema.nodes.image.create({ src: url, alt: file.name })
            : schema.text(`[Arquivo: ${file.name}](${url})`);
          view.dispatch(view.state.tr.replaceSelectionWith(node));
        })
        .catch((e: any) => alert('Paste failed: ' + e.message))
        .finally(() => setIsUploading(false));

      return true;
    }

    // 2. Text paste — force plain text so Markdown (incl. tables) is parsed
    //    correctly, bypassing the HTML that chat apps put in the clipboard.
    const text = event.clipboardData?.getData('text/plain');
    if (text) {
      event.preventDefault();
      const { state, dispatch } = view;
      dispatch(state.tr.replaceSelection(markdownToSlice(text, state.schema)));
      return true;
    }

    return false;
  };

  // ── Editor ──────────────────────────────────────────────────────────────────

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      Markdown.configure({ markedOptions: { gfm: true } }),
      Placeholder.configure({
        placeholder: 'Descreva esta tarefa… Suporta **Markdown**. Use ☑ para criar checklists.',
      }),
      TaskList.configure({ HTMLAttributes: { class: 'task-list' } }),
      TaskItem.configure({ nested: false, HTMLAttributes: { class: 'task-item' } }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialValue,
    contentType: 'markdown',
    editorProps: {
      attributes: { class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[160px] p-4 leading-relaxed' },
      handleDrop,
      handlePaste,
    },
    onUpdate: ({ editor }) => onChange(editor.getMarkdown()),
  });

  // ── File picker ─────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    const isImage = file.type.startsWith('image/');
    const limit = isImage ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;

    if (file.size > limit) {
      alert(`Arquivo muito grande. Limite: ${isImage ? '3MB' : '10MB'}.`);
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file, workspaceId);
      if (isImage) {
        editor.chain().focus().setImage({ src: url, alt: file.name }).run();
      } else {
        editor.chain().focus().insertContent(`[Arquivo: ${file.name}](${url})`).run();
      }
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className="w-full rounded-xl transition-all"
      style={{ background: 'var(--app-panel)', border: '1px solid var(--app-border)' }}
    >
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

        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[12px] font-medium transition-all hover:bg-[var(--app-hover)] text-[var(--app-text-muted)] hover:text-[var(--app-text)] disabled:opacity-40"
          title="Anexar arquivo"
        >
          {isUploading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Paperclip className="w-3.5 h-3.5" />}
          Anexo
        </button>

        <div style={{ width: 1, height: 16, background: 'var(--app-border-faint)', margin: '0 4px' }} />

        <span className="text-[11px]" style={{ color: 'var(--app-text-muted)', opacity: 0.5 }}>
          Markdown · drag&drop de imagens
        </span>
      </div>

      <div onClick={() => editor?.commands.focus()} onKeyDown={onKeyDown}>
        <EditorContent editor={editor} />
      </div>

      <style>{`
        /* Task list */
        .task-list { list-style: none; padding-left: 0.125rem; margin: 0.25rem 0; }
        .task-item { display: flex; align-items: flex-start; gap: 0.5rem; margin: 0.15rem 0; }
        .task-item label { display: inline-flex; align-items: center; flex-shrink: 0; margin-top: 3px; cursor: pointer; }
        .task-item > div, .task-item > p { flex: 1; min-width: 0; margin: 0; line-height: 1.55; }
        .task-item > div > p { margin: 0; }
        .task-item[data-checked="true"] > div,
        .task-item[data-checked="true"] > p { text-decoration: line-through; opacity: 0.5; }
        .task-item input[type="checkbox"] {
          appearance: none; -webkit-appearance: none;
          width: 15px; height: 15px; border-radius: 4px;
          border: 1.5px solid var(--app-border);
          background: transparent; cursor: pointer;
          flex-shrink: 0; transition: all 0.15s; display: block;
        }
        .task-item input[type="checkbox"]:hover { border-color: var(--app-primary); }
        .task-item input[type="checkbox"]:checked {
          background: var(--app-primary); border-color: var(--app-primary);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'%3E%3Cpath d='M1.5 5l2.5 2.5 4.5-4.5' stroke='white' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-size: 10px; background-repeat: no-repeat; background-position: center;
        }

        /* Table */
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; font-size: 0.8125rem; }
        .ProseMirror th, .ProseMirror td { border: 1px solid var(--app-border); padding: 6px 12px; text-align: left; vertical-align: top; }
        .ProseMirror th { background: var(--app-hover); font-weight: 600; color: var(--app-text); }
        .ProseMirror td { color: var(--app-text-muted); }
        .ProseMirror tr:nth-child(even) td { background: color-mix(in srgb, var(--app-hover) 40%, transparent); }
      `}</style>
    </div>
  );
}