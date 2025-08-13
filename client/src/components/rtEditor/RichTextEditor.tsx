import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import FontSize from "@tiptap/extension-font-size";
import { useEffect } from "react";

interface RichTextEditorProps {
  value?: any;
  onChange?: (content: any) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [StarterKit, TextStyle, FontSize],
    content: value || "",
    onUpdate: ({ editor }) => {
      onChange && onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        placeholder: placeholder || "Digite aqui...",
      },
    },
  });

  const setFontSize = (size: string) => {
    editor?.chain().focus().setFontSize(size).run();
  };

  useEffect(() => { // Garante que o editor reaja a alterações externas de seu conteúdo
    if (editor && value) {
        // Só atualiza se o conteúdo for diferente
        if (JSON.stringify(editor.getJSON()) !== JSON.stringify(value)) {
            editor.commands.setContent(value);
        }
    }
  }, [value, editor]);

  return (
    <div className="rich-text-editor">
      <div className="toolbar">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={editor?.isActive("bold") ? "is-active" : ""}
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={editor?.isActive("italic") ? "is-active" : ""}
        >
          <i>I</i>
        </button>
        <select
          onChange={e => setFontSize(e.target.value)}
          value={editor?.getAttributes("textStyle").fontSize || "16px"}
        >
          <option value="12px">12</option>
          <option value="16px">16</option>
          <option value="20px">20</option>
          <option value="24px">24</option>
          <option value="32px">32</option>
        </select>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
