"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Icon } from "@iconify/react"
import type { Editor } from '@tiptap/react'
import { useColorPicker } from "@/components/color-picker-manager"

// Supported fonts
const FONT_FAMILIES = [
  { value: 'Microsoft YaHei', label: '微软雅黑' },
  { value: 'SimSun', label: '宋体' },
  { value: 'SimHei', label: '黑体' },
  { value: 'KaiTi', label: '楷体' },
  { value: 'FangSong', label: '仿宋' },
  { value: 'PingFang SC', label: '苹方' },
  { value: 'Heiti SC', label: '黑体-简' },
  { value: 'STSong', label: '华文宋体' },
  { value: 'STKaiti', label: '华文楷体' },
  { value: 'STFangsong', label: '华文仿宋' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Calibri', label: 'Calibri' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Consolas', label: 'Consolas' },
  { value: 'Monaco', label: 'Monaco' },
]

// Supported font sizes
const FONT_SIZES = [9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36]

// Preset colors
const PRESET_COLORS = [
  '#000000', '#666666', '#999999',
  '#d73a49', '#e36209', '#f9c513', '#28a745',
  '#0366d6', '#6f42c1', '#ea4aaa', '#ffffff',
]

interface RichTextToolbarProps {
  editor: Editor
}

export default function RichTextToolbar({ editor }: RichTextToolbarProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
  const { openColorPicker } = useColorPicker()
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null)

  // Save selection when toolbar is shown
  useEffect(() => {
    const { from, to } = editor.state.selection
    savedSelectionRef.current = { from, to }
  }, [editor])

  // Toggle list
  const toggleList = (type: 'bulletList' | 'orderedList') => {
    const wasActive = editor.isActive(type)

    if (type === 'bulletList') {
      editor.chain().focus().toggleBulletList().run()
    } else {
      editor.chain().focus().toggleOrderedList().run()
    }

    // 如果刚激活列表（之前不是列表），将光标移到最后一个列表项的末尾
    if (!wasActive) {
      setTimeout(() => {
        const { state } = editor
        const { doc } = state

        // 找到文档中最后一个列表项
        let lastListItemPos = -1
        doc.descendants((node, pos) => {
          if (node.type.name === 'listItem') {
            lastListItemPos = pos
          }
        })

        if (lastListItemPos !== -1) {
          // 找到该列表项的末尾位置
          const $pos = doc.resolve(lastListItemPos)
          const listItemNode = $pos.nodeAfter
          if (listItemNode) {
            const endPos = lastListItemPos + listItemNode.nodeSize - 1
            editor.commands.setTextSelection(endPos)
          }
        }
      }, 0)
    }
  }

  // Helper function to restore selection and apply color
  const applyColorWithSelection = (color: string) => {
    if (savedSelectionRef.current) {
      const { from, to } = savedSelectionRef.current
      editor.chain()
        .focus()
        .setTextSelection({ from, to })
        .setColor(color)
        .run()
    } else {
      editor.chain().focus().setColor(color).run()
    }
  }

  // Get current font family
  const getCurrentFontFamily = () => {
    const fontFamily = editor.getAttributes('textStyle').fontFamily
    return fontFamily || 'Microsoft YaHei'
  }

  // Get current font size
  const getCurrentFontSize = () => {
    const fontSize = editor.getAttributes('textStyle').fontSize
    if (fontSize) {
      return fontSize.replace('pt', '')
    }
    return '12'
  }

  // Get current color
  const getCurrentColor = () => {
    return editor.getAttributes('textStyle').color || '#000000'
  }

  return (
    <div className="bg-white text-slate-800 rounded shadow-lg p-1.5 space-y-1 min-w-[300px] text-xs border border-slate-200">
      {/* Row 1: Font and Size */}
      <div className="flex items-center gap-1">
        <Select
          value={getCurrentFontFamily()}
          onValueChange={(value) => editor.chain().focus().setFontFamily(value).run()}
        >
          <SelectTrigger className="flex-1 h-6 text-xs bg-slate-100 border-slate-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={getCurrentFontSize()}
          onValueChange={(value) => editor.chain().focus().setMark('textStyle', { fontSize: `${value}pt` }).run()}
        >
          <SelectTrigger className="flex-1 h-6 text-xs bg-blue-100 border-blue-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size < 10 ? `0${size}` : size}pt
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: Format buttons */}
      <div className="flex items-center gap-0.5">
        {/* Bold */}
        <Button
          size="sm"
          variant={editor.isActive('bold') ? "default" : "ghost"}
          className={`h-6 w-6 p-0 text-xs ${editor.isActive('bold') ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="加粗 (Ctrl+B)"
        >
          <span className="font-bold">B</span>
        </Button>

        {/* Italic */}
        <Button
          size="sm"
          variant={editor.isActive('italic') ? "default" : "ghost"}
          className={`h-6 w-6 p-0 text-xs ${editor.isActive('italic') ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜体 (Ctrl+I)"
        >
          <span className="italic">I</span>
        </Button>

        {/* Underline */}
        <Button
          size="sm"
          variant={editor.isActive('underline') ? "default" : "ghost"}
          className={`h-6 w-6 p-0 text-xs ${editor.isActive('underline') ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="下划线 (Ctrl+U)"
        >
          <span className="underline">U</span>
        </Button>

        {/* Inline code */}
        <Button
          size="sm"
          variant={editor.isActive('code') ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive('code') ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          title="行内代码 (Ctrl+`)"
        >
          <Icon icon="mdi:code-tags" className="w-3 h-3" />
        </Button>

        <div className="w-px h-4 bg-slate-300 mx-0.5" />

        {/* Alignment */}
        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'left' }) ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive({ textAlign: 'left' }) ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="左对齐"
        >
          <Icon icon="mdi:format-align-left" className="w-3 h-3" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'center' }) ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive({ textAlign: 'center' }) ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="居中对齐"
        >
          <Icon icon="mdi:format-align-center" className="w-3 h-3" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'right' }) ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive({ textAlign: 'right' }) ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="右对齐"
        >
          <Icon icon="mdi:format-align-right" className="w-3 h-3" />
        </Button>

        <Button
          size="sm"
          variant={editor.isActive({ textAlign: 'justify' }) ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive({ textAlign: 'justify' }) ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="两端对齐"
        >
          <Icon icon="mdi:format-align-justify" className="w-3 h-3" />
        </Button>

        <div className="w-px h-4 bg-slate-300 mx-0.5" />

        {/* Bullet list */}
        <Button
          size="sm"
          variant={editor.isActive('bulletList') ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive('bulletList') ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleList('bulletList')}
          title="无序列表"
        >
          <Icon icon="mdi:format-list-bulleted" className="w-3 h-3" />
        </Button>

        {/* Numbered list */}
        <Button
          size="sm"
          variant={editor.isActive('orderedList') ? "default" : "ghost"}
          className={`h-6 w-6 p-0 ${editor.isActive('orderedList') ? "bg-slate-300" : "hover:bg-slate-100"}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => toggleList('orderedList')}
          title="有序列表"
        >
          <Icon icon="mdi:format-list-numbered" className="w-3 h-3" />
        </Button>

        <div className="w-px h-4 bg-slate-300 mx-0.5" />

        {/* Text color */}
        <Popover open={colorPickerOpen} onOpenChange={setColorPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-slate-100 relative"
              title="文字颜色"
              onMouseDown={(e) => {
                e.preventDefault()
              }}
              onClick={() => {
                const { from, to } = editor.state.selection
                savedSelectionRef.current = { from, to }
                setColorPickerOpen(true)
              }}
            >
              <Icon icon="mdi:format-color-text" className="w-3 h-3" />
              <div
                className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-3 h-0.5"
                style={{ backgroundColor: getCurrentColor() }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-2 bg-white"
            align="end"
            side="bottom"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
            }}
          >
            <div className="grid grid-cols-4 gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:border-blue-500 transition-colors"
                  style={{ backgroundColor: color }}
                  onMouseDown={(e) => {
                    e.preventDefault()
                  }}
                  onClick={() => {
                    applyColorWithSelection(color)
                    setColorPickerOpen(false)
                  }}
                  title={color}
                />
              ))}
              {/* Custom color button */}
              <button
                className="w-6 h-6 rounded border border-gray-300 hover:border-blue-500 transition-colors cursor-pointer flex items-center justify-center bg-white"
                title="自定义颜色"
                onMouseDown={(e) => {
                  e.preventDefault()
                }}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setColorPickerOpen(false)
                  setTimeout(() => {
                    openColorPicker(getCurrentColor(), (color) => {
                      applyColorWithSelection(color)
                    })
                  }, 100)
                }}
              >
                <Icon icon="mdi:palette" className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
