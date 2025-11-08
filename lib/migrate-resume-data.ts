import type { ResumeData, ModuleContentElement, JSONContent } from "@/types/resume"

/**
 * 旧的 TextSegment 类型（用于迁移）
 */
interface LegacyTextSegment {
  id: string
  text: string
  style: {
    fontFamily?: string
    fontSize?: number
    color?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    code?: boolean
  }
}

/**
 * 旧的 ModuleContentElement 类型（用于迁移）
 */
interface LegacyModuleContentElement {
  id: string
  type: 'text' | 'bullet-list' | 'numbered-list'
  segments: LegacyTextSegment[]
  columnIndex: number
  align?: 'left' | 'center' | 'right' | 'justify'
  indent?: number
}

/**
 * 将旧的 TextSegment[] 转换为 Tiptap JSON
 */
function segmentsToTiptapJSON(segments: LegacyTextSegment[]): JSONContent {
  if (!segments || segments.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    }
  }

  const textNodes: any[] = []

  for (const segment of segments) {
    if (!segment.text) continue

    const marks: any[] = []

    // Convert style to marks
    if (segment.style.bold) marks.push({ type: 'bold' })
    if (segment.style.italic) marks.push({ type: 'italic' })
    if (segment.style.underline) marks.push({ type: 'underline' })
    if (segment.style.code) marks.push({ type: 'code' })

    // TextStyle mark for color, font family, font size
    const textStyleAttrs: any = {}
    if (segment.style.color) textStyleAttrs.color = segment.style.color
    if (segment.style.fontFamily) textStyleAttrs.fontFamily = segment.style.fontFamily
    if (segment.style.fontSize) textStyleAttrs.fontSize = `${segment.style.fontSize}pt`

    if (Object.keys(textStyleAttrs).length > 0) {
      marks.push({
        type: 'textStyle',
        attrs: textStyleAttrs,
      })
    }

    textNodes.push({
      type: 'text',
      text: segment.text,
      marks: marks.length > 0 ? marks : undefined,
    })
  }

  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: textNodes,
      },
    ],
  }
}

/**
 * 检查元素是否使用旧格式
 */
function isLegacyElement(element: any): element is LegacyModuleContentElement {
  return 'segments' in element && Array.isArray(element.segments)
}

/**
 * 迁移单个元素
 */
function migrateElement(element: any): ModuleContentElement {
  if (isLegacyElement(element)) {
    // 旧格式，需要转换
    const content = segmentsToTiptapJSON(element.segments)
    
    // 如果有对齐方式，应用到段落
    if (element.align && content.content && content.content[0]) {
      content.content[0].attrs = {
        ...content.content[0].attrs,
        textAlign: element.align,
      }
    }

    return {
      id: element.id,
      content,
      columnIndex: element.columnIndex,
    }
  }

  // 已经是新格式
  return element as ModuleContentElement
}

/**
 * 迁移整个简历数据
 */
export function migrateResumeData(data: ResumeData): ResumeData {
  const migratedModules = data.modules.map(module => ({
    ...module,
    rows: module.rows.map(row => ({
      ...row,
      elements: row.elements.map(migrateElement),
    })),
  }))

  return {
    ...data,
    modules: migratedModules,
  }
}

/**
 * 检查数据是否需要迁移
 */
export function needsMigration(data: ResumeData): boolean {
  for (const module of data.modules) {
    for (const row of module.rows) {
      for (const element of row.elements) {
        if (isLegacyElement(element)) {
          return true
        }
      }
    }
  }
  return false
}
