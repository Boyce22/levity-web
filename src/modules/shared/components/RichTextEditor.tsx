'use client';

import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import { uploadImageAction } from '@/modules/shared/actions/upload'; // Make sure this is available

interface RichTextEditorProps {
  initialValue: string;
  onChange: (val: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export default function RichTextEditor({ initialValue, onChange, onKeyDown }: RichTextEditorProps) {
  const isUpdatingRef = useRef(false);

  const handleDrop = (view: any, event: any, slice: any, moved: boolean) => {
    if (!moved && event.dataTransfer?.files?.[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        event.preventDefault();
        const { schema } = view.state;
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
        
        const fd = new FormData();
        fd.append('file', file);
        uploadImageAction(fd).then(url => {
          const node = schema.nodes.image.create({ src: url, alt: file.name });
          const transaction = view.state.tr.insert(coordinates ? coordinates.pos : view.state.selection.from, node);
          view.dispatch(transaction);
        }).catch((e: any) => alert('Upload failed: ' + e.message));
        
        return true;
      }
    }
    return false;
  };

  const handlePaste = (view: any, event: ClipboardEvent, slice: any) => {
    const items = event.clipboardData?.items;
    if (!items) return false;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            const file = items[i].getAsFile();
            if (file) {
                event.preventDefault();
                const { schema } = view.state;
                const fd = new FormData();
                fd.append('file', file);
                uploadImageAction(fd).then(url => {
                   const node = schema.nodes.image.create({ src: url, alt: file.name });
                   const transaction = view.state.tr.replaceSelectionWith(node);
                   view.dispatch(transaction);
                }).catch((e: any) => alert('Paste image failed: ' + e.message));
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
        placeholder: 'Describe this task... Use Markdown, or drop images dynamically.',
      }),
    ],
    content: initialValue,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[180px] p-4 text-white/85 leading-relaxed',
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

  return (
    <div 
      className="w-full rounded-xl transition-all relative group"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
      onClick={() => editor?.commands.focus()}
      onKeyDown={onKeyDown}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
