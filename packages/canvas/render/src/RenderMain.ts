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

import { provide, inject, watch, defineComponent, WritableComputedRef } from 'vue'
import { I18nInjectionKey } from 'vue-i18n'

import { useBroadcastChannel } from '@vueuse/core'
import { constants } from '@opentiny/tiny-engine-utils'
import {
  getNode as getNodeById,
  clearNodes,
  getRoot,
  setContext,
  getContext,
  setCondition,
  getCondition,
  getConditions,
  context,
  setNode
} from './page-block-function/context'
import { getDesignMode, setDesignMode, setController, useCustomRenderer } from './canvas-function'
import { setConfigure } from './material-function'
import { useUtils, useBridge, useDataSourceMap, useGlobalState } from './application-function'
import { useSchema } from './page-block-function'

const { BROADCAST_CHANNEL } = constants
const { refreshKey, utils, getUtils, setUtils, updateUtils, deleteUtils } = useUtils(context)
const { bridge, setBridge, getBridge } = useBridge()
const { getDataSourceMap, setDataSourceMap } = useDataSourceMap()
const { getGlobalState, setGlobalState, stores } = useGlobalState()

const {
  schema,
  getSchema,
  setSchema,
  getState,
  setState,
  deleteState,
  getProps,
  setProps,
  getMethods,
  setMethods,
  setPagecss
} = useSchema(
  {
    context,
    getContext,
    setContext,
    clearNodes
  },
  {
    utils,
    bridge,
    stores,
    getDataSourceMap
  }
)

const { getRenderer, setRenderer } = useCustomRenderer(schema, refreshKey)

const getNode = (id, parent) => (id ? getNodeById(id, parent) : schema)

export default defineComponent({
  setup() {
    provide('rootSchema', schema)

    const { locale } = inject(I18nInjectionKey).global
    const { data } = useBroadcastChannel({ name: BROADCAST_CHANNEL.CanvasLang })
    const { post } = useBroadcastChannel({ name: BROADCAST_CHANNEL.SchemaLength })

    watch(data, () => {
      ;(locale as WritableComputedRef<unknown>).value = data.value
    })

    watch(
      () => schema?.children?.length,
      (length) => {
        post(length)
      }
    )

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
  },
  render() {
    return getRenderer().call(this)
  }
})

export const api = {
  getUtils,
  setUtils,
  updateUtils,
  deleteUtils,
  getBridge,
  setBridge,
  getMethods,
  setMethods,
  setController,
  setConfigure,
  getSchema,
  setSchema,
  getState,
  deleteState,
  setState,
  getProps,
  setProps,
  getContext,
  getNode,
  getRoot,
  setPagecss,
  setCondition,
  getCondition,
  getConditions,
  getGlobalState,
  getDataSourceMap,
  setDataSourceMap,
  setGlobalState,
  setNode,
  getRenderer,
  setRenderer,
  getDesignMode,
  setDesignMode
}
