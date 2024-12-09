import { h } from 'vue'
import CanvasEmpty from './CanvasEmpty.vue'
import renderer from '../render'

const getDefaultRenderer = (schema, refreshKey) =>
  function () {
    // 渲染画布增加根节点，与出码和预览保持一致
    const rootChildrenSchema = {
      componentName: 'div',
      // 手动添加一个唯一的属性，后续在画布选中此节点时方便处理额外的逻辑。由于没有修改schema，不会影响出码
      props: { ...schema.props, 'data-id': 'root-container' },
      children: schema.children
    }

    return h(
      'tiny-i18n-host',
      {
        locale: 'zh_CN',
        key: refreshKey.value,
        ref: 'page',
        className: 'design-page'
      },
      schema.children?.length ? h(renderer, { schema: rootChildrenSchema, parent: schema }) : [h(CanvasEmpty)]
    )
  }

export function useCustomRenderer(schema, refreshKey) {
  let canvasRenderer = null

  const getRenderer = () => canvasRenderer || getDefaultRenderer(schema, refreshKey)
  const setRenderer = (fn) => {
    canvasRenderer = fn
  }

  return {
    getRenderer,
    setRenderer
  }
}
