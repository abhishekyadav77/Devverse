import { useRef } from 'react';

import {
  Bold, Code, Heading2, Heading3, Image as ImageIcon, ImagePlus, Italic, Link2, List, ListOrdered,
  Minus, Quote, Redo2, SquareCode, Strikethrough, Table as TableIcon, Undo2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';

function Btn({ label, onClick, active, disabled, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40 dark:text-ink-300 dark:hover:bg-ink-800 ${
        active ? 'bg-brand-50 !text-brand-700 dark:bg-brand-900/30 dark:!text-brand-300' : ''
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-ink-200 dark:bg-ink-700" aria-hidden="true" />;

export default function EditorToolbar({ editor, onUploadImage, uploading = false }) {
  const toast = useToast();
    const fileRef = useRef(null);
  if (!editor) return null;
  const run = () => editor.chain().focus();

  const setLink = () => {
    const url = window.prompt('Link URL (https://...)', editor.getAttributes('link').href || '');
    if (url === null) return;
    const value = url.trim();
    if (!value) return run().extendMarkRange('link').unsetLink().run();
    if (!/^(https?:\/\/|mailto:)/i.test(value)) return toast.error('Links must start with https://, http:// or mailto:');
    return run().extendMarkRange('link').setLink({ href: value }).run();
  };

  const addImage = () => {
    const url = window.prompt('Image URL (https://...)');
    if (!url) return;
    if (!/^https?:\/\/\S+$/i.test(url.trim())) return toast.error('Image links must start with http:// or https://');
    return run().setImage({ src: url.trim() }).run();
  };

  const inTable = editor.isActive('table');
  const tableBtn = 'rounded-lg px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800';

  return (
    <div className="sticky top-0 z-10 rounded-t-2xl border-b border-ink-200 bg-white/95 px-2 py-2 backdrop-blur dark:border-ink-800 dark:bg-ink-900/95">
      <div className="flex flex-wrap items-center gap-0.5">
        <Btn label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => run().toggleHeading({ level: 2 }).run()}><Heading2 size={17} /></Btn>
        <Btn label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => run().toggleHeading({ level: 3 }).run()}><Heading3 size={17} /></Btn>
        <Divider />
        <Btn label="Bold" active={editor.isActive('bold')} onClick={() => run().toggleBold().run()}><Bold size={16} /></Btn>
        <Btn label="Italic" active={editor.isActive('italic')} onClick={() => run().toggleItalic().run()}><Italic size={16} /></Btn>
        <Btn label="Strikethrough" active={editor.isActive('strike')} onClick={() => run().toggleStrike().run()}><Strikethrough size={16} /></Btn>
        <Btn label="Inline code" active={editor.isActive('code')} onClick={() => run().toggleCode().run()}><Code size={16} /></Btn>
        <Divider />
        <Btn label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => run().toggleBulletList().run()}><List size={17} /></Btn>
        <Btn label="Numbered list" active={editor.isActive('orderedList')} onClick={() => run().toggleOrderedList().run()}><ListOrdered size={17} /></Btn>
        <Btn label="Blockquote" active={editor.isActive('blockquote')} onClick={() => run().toggleBlockquote().run()}><Quote size={16} /></Btn>
        <Btn label="Code block" active={editor.isActive('codeBlock')} onClick={() => run().toggleCodeBlock().run()}><SquareCode size={17} /></Btn>
        <Btn label="Horizontal rule" onClick={() => run().setHorizontalRule().run()}><Minus size={17} /></Btn>
        <Divider />
        <Btn label="Link" active={editor.isActive('link')} onClick={setLink}><Link2 size={16} /></Btn>
                <Btn label="Upload image" disabled={uploading} onClick={() => fileRef.current?.click()}><ImagePlus size={16} /></Btn>
        <Btn label="Image from link" onClick={addImage}><ImageIcon size={16} /></Btn>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) onUploadImage?.(file);
          }}
        />
        <Btn label="Insert table" onClick={() => run().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon size={16} /></Btn>
        <Divider />
        <Btn label="Undo" disabled={!editor.can().undo()} onClick={() => run().undo().run()}><Undo2 size={16} /></Btn>
        <Btn label="Redo" disabled={!editor.can().redo()} onClick={() => run().redo().run()}><Redo2 size={16} /></Btn>
      </div>

      {inTable && (
        <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-ink-100 pt-2 dark:border-ink-800">
          <span className="px-1 text-xs text-ink-400">Table</span>
          <button type="button" className={tableBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => run().addRowAfter().run()}>Add row</button>
          <button type="button" className={tableBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => run().addColumnAfter().run()}>Add column</button>
          <button type="button" className={tableBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => run().deleteRow().run()}>Delete row</button>
          <button type="button" className={tableBtn} onMouseDown={(e) => e.preventDefault()} onClick={() => run().deleteColumn().run()}>Delete column</button>
          <button type="button" className={`${tableBtn} !text-red-600`} onMouseDown={(e) => e.preventDefault()} onClick={() => run().deleteTable().run()}>Delete table</button>
        </div>
      )}
    </div>
  );
}