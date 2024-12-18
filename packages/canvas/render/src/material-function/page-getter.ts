import { defineComponent, h, ref } from 'vue'
import { getController } from '../canvas-function'
import RenderMain from '../RenderMain'
import { handleScopedCss } from './handle-scoped-css'

const pageSchema: Record<string, any> = {}

async function fetchPageSchema(pageId: string) {
  return getController()
    .getPageById(pageId)
    .then((res) => {
      return res.page_content
    })
}
const styleSheetMap = new Map()
export function initStyle(key: string, content: string) {
  if (styleSheetMap.get(key) || !content) {
    return
  }
  const styleSheet = new CSSStyleSheet()
  styleSheetMap.set(key, styleSheet)
  document.adoptedStyleSheets.push(styleSheet)
  handleScopedCss(key, content).then((scopedCss) => {
    styleSheet.replaceSync(scopedCss)
  })
}
export const wrapPageComponent = (pageId: string) => {
  const key = `data-te-page-${pageId}`
  const asyncData = ref(null)
  fetchPageSchema(pageId).then((data) => {
    asyncData.value = data
    initStyle(key, data.css)
  })
  pageSchema[pageId] = defineComponent({
    name: `page-${pageId}`,
    setup() {
      return () =>
        asyncData.value
          ? h(RenderMain, {
              cssScopeId: key,
              renderSchema: asyncData.value,
              active: pageId === getController().getBaseInfo().pageId,
              pageId: pageId,
              entry: false
            })
          : null
    }
  })
  return pageSchema[pageId]
}
export const getPage = (pageId: string) => {
  return pageSchema[pageId] || wrapPageComponent(pageId)
}

export async function getPageAncestors(pageId?: string) {
  if (!pageId) {
    return []
  }
  if (!getController().getPageAncestors) {
    // 如果不支持查询祖先 则返回自己
    return [pageId]
  }
  const pageChain = await getController().getPageAncestors(pageId)
  return [...pageChain, pageId]
}
