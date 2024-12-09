/**
 * Copyright (c) 2023 - present TinyEngine Authors.
 * Copyright (c) 2023 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */

import { defineComponent, h, provide } from 'vue'

import { NODE_UID as DESIGN_UIDKEY, NODE_TAG as DESIGN_TAGKEY, NODE_LOOP as DESIGN_LOOPID } from '../../common'
import { conditions, setNode } from './context'
import { getDesignMode, DESIGN_MODE } from './canvas-function'
import { parseCondition, parseData, parseLoopArgs } from './data-function'
import { blockSlotDataMap, getComponent, generateCollection, Mapper, configure } from './material-function'

export const renderDefault = (children, scope, parent) =>
  children.map?.((child) =>
    // eslint-disable-next-line no-use-before-define
    h(renderer, {
      schema: child,
      scope,
      parent
    })
  )

const stopEvent = (event) => {
  event.preventDefault?.()
  event.stopPropagation?.()
  return false
}

const generateSlotGroup = (children, isCustomElm, schema) => {
  const slotGroup = {}

  children.forEach((child) => {
    const { componentName, children, params = [], props } = child
    const slot = child.slot || props?.slot?.name || props?.slot || 'default'
    const isNotEmptyTemplate = componentName === 'Template' && children.length

    isCustomElm && (child.props.slot = 'slot') // CE下需要给子节点加上slot标识
    slotGroup[slot] = slotGroup[slot] || {
      value: [],
      params,
      parent: isNotEmptyTemplate ? child : schema
    }

    slotGroup[slot].value.push(...(isNotEmptyTemplate ? children : [child])) // template 标签直接过滤掉
  })

  return slotGroup
}

const renderSlot = (children, scope, schema, isCustomElm?) => {
  if (children.some((a) => a.componentName === 'Template')) {
    const slotGroup = generateSlotGroup(children, isCustomElm, schema)
    const slots = {}

    Object.keys(slotGroup).forEach((slotName) => {
      const currentSlot = slotGroup[slotName]

      slots[slotName] = ($scope) => renderDefault(currentSlot.value, { ...scope, ...$scope }, currentSlot.parent)
    })

    return slots
  }

  return { default: () => renderDefault(children, scope, schema) }
}

const checkGroup = (componentName) => configure[componentName]?.nestingRule?.childWhitelist?.length

const clickCapture = (componentName) => configure[componentName]?.clickCapture !== false

const getBindProps = (schema, scope) => {
  const { id, componentName } = schema
  const invalidity = configure[componentName]?.invalidity || []

  if (componentName === 'CanvasPlaceholder') {
    return {}
  }

  const bindProps = {
    ...parseData(schema.props, scope),
    [DESIGN_UIDKEY]: id,
    [DESIGN_TAGKEY]: componentName
  }

  if (getDesignMode() === DESIGN_MODE.DESIGN) {
    bindProps.onMouseover = stopEvent
    bindProps.onFocus = stopEvent
  }

  if (scope) {
    bindProps[DESIGN_LOOPID] = scope.index === undefined ? scope.idx : scope.index
  }

  // 在捕获阶段阻止事件的传播
  if (clickCapture(componentName) && getDesignMode() === DESIGN_MODE.DESIGN) {
    bindProps.onClickCapture = stopEvent
  }

  if (Mapper[componentName]) {
    bindProps.schema = schema
  }

  // 绑定组件属性时需要将 className 重命名为 class，防止覆盖组件内置 class
  bindProps.class = bindProps.className
  delete bindProps.className

  // 使画布中元素可拖拽
  bindProps.draggable = true

  // 过滤在门户网站上配置的画布丢弃的属性
  invalidity.forEach((prop) => delete bindProps[prop])

  return bindProps
}

const getLoopScope = ({ scope, index, item, loopArgs }) => {
  return {
    ...scope,
    ...(parseLoopArgs({
      item,
      index,
      loopArgs
    }) || {})
  }
}

const injectPlaceHolder = (componentName, children) => {
  const isEmptyArr = Array.isArray(children) && !children.length

  if (configure[componentName]?.isContainer && (!children || isEmptyArr)) {
    return [
      {
        componentName: 'CanvasPlaceholder'
      }
    ]
  }

  return children
}

const renderGroup = (children, scope, parent) => {
  return children.map?.((schema) => {
    const { componentName, children, loop, loopArgs, condition, id } = schema
    const loopList = parseData(loop, scope)

    const renderElement = (item?, index?) => {
      const mergeScope = getLoopScope({
        scope,
        index,
        item,
        loopArgs
      })

      setNode(schema, parent)

      if (conditions[id] === false || !parseCondition(condition, mergeScope)) {
        return null
      }

      const renderChildren = injectPlaceHolder(componentName, children)

      return h(
        getComponent(componentName),
        getBindProps(schema, mergeScope),
        Array.isArray(renderChildren)
          ? renderSlot(renderChildren, mergeScope, schema)
          : parseData(renderChildren, mergeScope)
      )
    }

    return loopList?.length ? loopList.map(renderElement) : renderElement()
  })
}

const getChildren = (schema, mergeScope) => {
  const { componentName, children } = schema
  const renderChildren = injectPlaceHolder(componentName, children)

  const component = getComponent(componentName)
  const isNative = typeof component === 'string'
  const isCustomElm = customElements[componentName]
  const isGroup = checkGroup(componentName)

  if (Array.isArray(renderChildren)) {
    if (isNative || isCustomElm) {
      return renderDefault(renderChildren, mergeScope, schema)
    } else {
      return isGroup
        ? renderGroup(renderChildren, mergeScope, schema)
        : renderSlot(renderChildren, mergeScope, schema, isCustomElm)
    }
  } else {
    return parseData(renderChildren, mergeScope)
  }
}

export const renderer = defineComponent({
  name: 'renderer',
  props: {
    schema: Object,
    scope: Object,
    parent: Object
  },
  setup(props) {
    provide('schema', props.schema)
  },
  render() {
    const { scope, schema, parent } = this
    const { componentName, loop, loopArgs, condition } = schema

    // 处理数据源和表格fetchData的映射关系
    generateCollection(schema)

    if (!componentName) {
      return parseData(schema, scope)
    }

    const component = getComponent(componentName)

    const loopList = parseData(loop, scope)

    const renderElement = (item?, index?) => {
      let mergeScope = item
        ? getLoopScope({
            item,
            index,
            loopArgs,
            scope
          })
        : scope

      // 如果是区块，并且使用了区块的作用域插槽，则需要将作用域插槽的数据传递下去
      if (parent?.componentType === 'Block' && componentName === 'Template' && schema.props?.slot?.params?.length) {
        const slotName = schema.props.slot?.name || schema.props.slot
        const blockName = parent.componentName
        const slotData = blockSlotDataMap[blockName]?.[slotName] || {}
        mergeScope = mergeScope ? { ...mergeScope, ...slotData } : slotData
      }

      // 给每个节点设置schema.id，并缓存起来
      setNode(schema, parent)

      if (conditions[schema.id] === false || !parseCondition(condition, mergeScope)) {
        return null
      }

      return h(component, getBindProps(schema, mergeScope), getChildren(schema, mergeScope))
    }

    return loopList?.length ? loopList.map(renderElement) : renderElement()
  }
})
export { getController } from './canvas-function'
export default renderer
