import { defineComponent, h } from 'vue'
import { getController } from '../canvas-function'
import RenderMain from '../RenderMain'
import { handleScopedCss } from './handle-scoped-css'
import { currentPage } from '../canvas-function/page-switcher'

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
  const isCurrentPage = pageId === currentPage.pageId
  pageSchema[pageId] = defineComponent({
    name: 'page-${pageId}',
    setup() {
      return () =>
        asyncData.value
          ? h(RenderMain, {
              cssScopeId: key,
              renderSchema: isCurrentPage ? null : asyncData.value,
              active: isCurrentPage
            })
          : null
    }
  })
}
export const getPage = (pageId: string) => {
  return pageSchema[pageId] || wrapPageComponent(pageId)
}
