import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, Heading3, List, ListOrdered, Undo2, Redo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

/**
 * Editor rico limitado (Sprint 13.x): negrita, cursiva, H3, viñetas,
 * numerada, deshacer/rehacer. Sin links, imágenes ni tablas.
 * El HTML se sanitiza al mostrar (DOMPurify, ver AvisoDetailModal).
 */
export default function EditorRico({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[140px] max-h-[320px] overflow-y-auto p-3 text-sm focus:outline-none [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:font-bold [&_h3]:text-base [&_h4]:font-bold [&_h4]:text-sm',
      },
    },
  });

  if (!editor) return null;

  const boton = (titulo: string, activo: boolean, onClick: () => void, Icon: typeof Bold) => (
    <button
      key={titulo}
      type="button"
      title={titulo}
      onClick={onClick}
      className={cn(
        'p-1.5 rounded-md transition-colors cursor-pointer',
        activo ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring overflow-hidden">
      <div className="flex items-center gap-0.5 p-1.5 border-b border-border bg-muted/30 flex-wrap">
        {boton('Negrita', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), Bold)}
        {boton('Cursiva', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), Italic)}
        {boton('Subtítulo', editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), Heading3)}
        {boton('Viñetas', editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), List)}
        {boton('Numerada', editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), ListOrdered)}
        <span className="w-px h-5 bg-border mx-1" />
        {boton('Deshacer', false, () => editor.chain().focus().undo().run(), Undo2)}
        {boton('Rehacer', false, () => editor.chain().focus().redo().run(), Redo2)}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
