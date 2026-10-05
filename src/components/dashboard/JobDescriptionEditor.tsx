"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Bold, Italic, List, ListOrdered, Underline as UnderlineIcon } from "lucide-react";

interface JobDescriptionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function JobDescriptionEditor({ value, onChange }: JobDescriptionEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: updatedEditor }) => onChange(updatedEditor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-28 px-3 py-2 text-sm text-gray-700 focus:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1",
      },
    },
  });

  if (!editor) return <div className="min-h-36 rounded-md border border-gray-300 bg-gray-50" />;

  const toggle = (command: () => boolean) => {
    editor.chain().focus();
    command();
  };

  return (
    <div className="overflow-hidden rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 p-1">
        <button type="button" onClick={() => toggle(() => editor.chain().focus().toggleBold().run())} className={`rounded p-1.5 ${editor.isActive("bold") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`} title="Bold">
          <Bold size={15} />
        </button>
        <button type="button" onClick={() => toggle(() => editor.chain().focus().toggleItalic().run())} className={`rounded p-1.5 ${editor.isActive("italic") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`} title="Italic">
          <Italic size={15} />
        </button>
        <button type="button" onClick={() => toggle(() => editor.chain().focus().toggleUnderline().run())} className={`rounded p-1.5 ${editor.isActive("underline") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`} title="Underline">
          <UnderlineIcon size={15} />
        </button>
        <button type="button" onClick={() => toggle(() => editor.chain().focus().toggleBulletList().run())} className={`rounded p-1.5 ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`} title="Bulleted list">
          <List size={15} />
        </button>
        <button type="button" onClick={() => toggle(() => editor.chain().focus().toggleOrderedList().run())} className={`rounded p-1.5 ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`} title="Numbered list">
          <ListOrdered size={15} />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
