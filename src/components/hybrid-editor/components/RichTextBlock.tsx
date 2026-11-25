import React from 'react';
import type { JSONContent } from '@tiptap/core';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontSize, BackgroundColor } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { Image as ImageExtension } from '@tiptap/extension-image';

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

const extensions = [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: { openOnClick: false, autolink: true },
  }),
  TextStyle,
  Color,
  BackgroundColor,
  FontFamily,
  FontSize,
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  Table.configure({ resizable: true, lastColumnResizable: true, allowTableNodeSelection: true }),
  TableRow,
  TableHeader,
  TableCell,
  ImageExtension.configure({ allowBase64: true, inline: false }),
];

/**
 * A4 sayfasının akan (Word benzeri) zengin metin motoru.
 *
 * Tiptap tabanlıdır; başlık, paragraf, tablo, görsel, renk, hizalama ve listeler
 * desteklenir. Sayfa üzerine serbestçe taşınan metin kutuları vektör katmanında
 * (Fabric.js IText/Textbox) yaşar; bu bileşen belge akışını temsil eder.
 */
export const RichTextBlock = ({
  content,
  onChange,
  onReady,
  editable = true,
  className = '',
  ariaLabel = 'Belge metni',
}: {
  content: JSONContent | null;
  onChange: (doc: JSONContent) => void;
  onReady?: (editor: Editor | null) => void;
  editable?: boolean;
  className?: string;
  ariaLabel?: string;
}) => {
  const onChangeRef = React.useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor(
    {
      extensions,
      content: content ?? EMPTY_DOC,
      editable,
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: 'hybrid-prose focus:outline-none',
          role: 'textbox',
          'aria-label': ariaLabel,
          'aria-multiline': 'true',
          spellcheck: 'true',
        },
      },
      onUpdate: ({ editor: instance }) => {
        onChangeRef.current(instance.getJSON());
      },
    },
    []
  );

  React.useEffect(() => {
    onReady?.(editor ?? null);
    return () => onReady?.(null);
  }, [editor, onReady]);

  React.useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const current = JSON.stringify(editor.getJSON());
    const incoming = JSON.stringify(content ?? EMPTY_DOC);
    if (current !== incoming) {
      editor.commands.setContent(content ?? EMPTY_DOC, { emitUpdate: false });
    }
  }, [content, editor]);

  React.useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className={`hybrid-richtext relative ${className}`}>
      <style>{`
        .hybrid-prose { color: #0f172a; font-size: 16px; line-height: 1.7; font-family: Lexend, Inter, sans-serif; }
        .hybrid-prose p { margin: 0 0 0.7em; }
        .hybrid-prose h1 { font-size: 1.9em; font-weight: 800; margin: 0.4em 0 0.35em; line-height: 1.25; }
        .hybrid-prose h2 { font-size: 1.5em; font-weight: 800; margin: 0.4em 0 0.3em; line-height: 1.3; }
        .hybrid-prose h3 { font-size: 1.2em; font-weight: 700; margin: 0.4em 0 0.25em; }
        .hybrid-prose ul, .hybrid-prose ol { margin: 0 0 0.7em 1.4em; padding: 0; }
        .hybrid-prose ul { list-style: disc; }
        .hybrid-prose ol { list-style: decimal; }
        .hybrid-prose li { margin: 0.15em 0; }
        .hybrid-prose blockquote { border-left: 3px solid #6366f1; padding-left: 0.8em; color: #475569; font-style: italic; margin: 0 0 0.7em; }
        .hybrid-prose a { color: #4f46e5; text-decoration: underline; }
        .hybrid-prose img { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0.4em auto; }
        .hybrid-prose table { border-collapse: collapse; width: 100%; margin: 0 0 0.9em; table-layout: fixed; }
        .hybrid-prose th, .hybrid-prose td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; position: relative; }
        .hybrid-prose th { background: #eef2ff; font-weight: 800; text-align: left; }
        .hybrid-prose .selectedCell::after { content: ''; position: absolute; inset: 0; background: rgba(99,102,241,0.14); pointer-events: none; }
        .hybrid-prose .column-resize-handle { position: absolute; right: -2px; top: 0; bottom: 0; width: 4px; background: #6366f1; cursor: col-resize; }
        .hybrid-prose p.is-editor-empty:first-child::before { content: attr(data-placeholder); color: #94a3b8; float: left; height: 0; pointer-events: none; }
        .hybrid-richtext .resize-cursor { cursor: col-resize; }
      `}</style>
      <EditorContent editor={editor} />
      {editor?.isEmpty && editable && (
        <p className="pointer-events-none absolute left-0 top-0 text-[15px] text-slate-400">
          Yazmaya başlayın…
        </p>
      )}
    </div>
  );
};

export default RichTextBlock;
