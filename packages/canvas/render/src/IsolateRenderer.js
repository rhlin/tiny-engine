import { defineComponent, provide, h, watch } from 'vue'
import TinyI18nHost, { I18nInjectionKey } from '@opentiny/tiny-engine-common/js/i18n'
import { CANVAS_API, sharedApi, useSchema, WITH_CONTEXT } from './RenderMain'
import lowcode from './lowcode'
import renderer from './render'

export default defineComponent({
  name: 'isolate-renderer',
  props: {
    schema: Object,
    props: Object
  },
  setup(props, { expose }) {
    const { schema, api: schemaApi, setMethods, setSchema, withContext } = useSchema(true)
    const api = { ...schemaApi, ...sharedApi }
    provide(CANVAS_API, api)
    provide(WITH_CONTEXT, withContext)
    expose({
      api
    })
    provide('rootSchema', schema)
    provide(I18nInjectionKey, {
      ...TinyI18nHost,
      lowcode: lowcode
    })

    // 这里监听schema.methods，为了保证methods上下文环境始终为最新
    watch(
      () => schema.methods,
      (value) => {
        setMethods(value, true)
      },
      {
        deep: true
      }
    )
    setSchema(props.schema, true)

    return () => {
      // 渲染画布增加根节点，与出码和预览保持一致
      const rootChildrenSchema = {
        componentName: 'div',
        props: schema.props,
        children: schema.children
      }
      return h('div', [
        h(
          schema.children?.length
            ? h(renderer, { schema: rootChildrenSchema, parent: schema, style: 'pointer-events:none' })
            : [null]
        )
      ])
    }
  }
})
