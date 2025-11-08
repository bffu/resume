"use client"
import { useEffect } from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Extension } from '@tiptap/core'
import type { ModuleContentElement, JSONContent } from "@/types/resume"
import { useToolbarManager } from "./rich-text-toolbar-manager"

interface RichTextInputProps {
  element: ModuleContentElement
  onChange: (updates: Partial<ModuleContentElement>) => void
  placeholder?: string
  showBorder?: boolean
}

// Custom extension for font size
const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement) => element.style.fontSize || null,
            renderHTML: (attributes: any) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
})

// Default empty content
const getDefaultContent = (): JSONContent => ({
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
})

export default function RichTextInput({
  element,
  onChange,
  placeholder = "输入内容...",
  showBorder = true
}: RichTextInputProps) {
  const { registerEditor, unregisterEditor } = useToolbarManager()

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        // 禁用 TrailingNode 以防止列表后自动添加空段落
        dropcursor: false,
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Underline,
      TextAlign.configure({
        types: ['paragraph'],
      }),
    ],
    content: element.content || getDefaultContent(),
    editorProps: {
      attributes: {
        class: `min-h-[40px] px-3 py-2 focus:outline-none ${showBorder ? 'border border-dashed border-teal-200 focus-within:border-teal-300' : ''
          }`,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange({ content: json })
    },
  })

  // Register editor with toolbar manager
  useEffect(() => {
    if (!editor) return

    const cleanup = registerEditor(editor)
    return () => {
      if (cleanup) cleanup()
      unregisterEditor(editor)
    }
  }, [editor, registerEditor, unregisterEditor])

  // Update editor content when element changes externally
  useEffect(() => {
    if (!editor) return

    const currentJson = editor.getJSON()
    const newJson = element.content || getDefaultContent()

    // Only update if content actually changed to avoid cursor jumping
    if (JSON.stringify(currentJson) !== JSON.stringify(newJson)) {
      editor.commands.setContent(newJson)
    }
  }, [element.id]) // Only update when element ID changes

  if (!editor) {
    return null
  }

  return (
    <div className="relative">
      <EditorContent
        editor={editor}
        placeholder={placeholder}
      />
    </div>
  )
}
