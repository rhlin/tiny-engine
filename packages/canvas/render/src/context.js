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

import { shallowReactive } from 'vue'
import { utils } from '@opentiny/tiny-engine-utils'

function useContext() {
  const context = shallowReactive({})
  const setContext = (ctx, clear) => {
    clear && Object.keys(context).forEach((key) => delete context[key])
    Object.assign(context, ctx)
  }

  const getContext = () => context
  return {
    context,
    setContext,
    getContext
  }
}
export const { context, setContext, getContext } = useContext()

function useCondition() {
  // 从大纲树控制隐藏
  const conditions = shallowReactive({})
  const setCondition = (id, visible = false) => {
    conditions[id] = visible
  }
  return {
    conditions,
    setCondition
  }
}
export const { conditions, setCondition } = useCondition()

function useNodes() {
  const nodes = {}

  const setNode = (schema, parent) => {
    schema.id = schema.id || utils.guid()
    nodes[schema.id] = { node: schema, parent }
  }

  const getNode = (id, parent) => {
    return parent ? nodes[id] : nodes[id].node
  }

  const delNode = (id) => delete nodes[id]

  const clearNodes = () => {
    Object.keys(nodes).forEach(delNode)
  }

  const getRoot = (id) => {
    const { parent } = getNode(id, true)

    return parent?.id ? getRoot(parent.id) : parent
  }

  return {
    setNode,
    getNode,
    delNode,
    clearNodes,
    getRoot
  }
}
export const { nodes, setNode, getNode, delNode, clearNodes, getRoot } = useNodes()

export function useWithContext() {
  const contextExpose = useContext()
  const nodeExpose = useNodes()
  const conditionExpose = useCondition()
  return {
    ...contextExpose,
    ...nodeExpose,
    ...conditionExpose
  }
}
