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

import { BASE_URL } from './environments'
import { addContextMenu } from './monacoContextMenu'
import { useEslintCustomModal, getEslintCustomRules } from '../index'

export const initLinter = (editor, monacoInstance, state) => {
  const workerUrl = `${BASE_URL}monaco-linter/eslint.worker.js`

  const worker = new Worker(workerUrl)

  // 监听 ESLint web worker 的返回
  worker.onmessage = function (event) {
    const { markers, version } = event.data
    const model = editor.getModel()

    state.hasError = markers.filter(({ severity }) => severity === 'Error').length > 0

    // 判断当前 model 的 versionId 与请求时是否一致
    if (model && model.getVersionId() === version) {
      monacoInstance.editor.setModelMarkers(model, 'ESLint', markers)
    }
  }

  return worker
}

function getEslintStyle() {
  return localStorage.getItem('monaco-eslint-style')
}
function setEsLintStyle(style) {
  localStorage.setItem('monaco-eslint-style', style)
}

export function initEslintMenu(editor, refresh) {
  const { edit: customRulesEdit } = useEslintCustomModal()
  return addContextMenu(editor, {
    menuContext: 'SwitchESlintRulesContext',
    title: 'Switch ESlint Rules',
    group: 'navigation',
    order: 201,
    menuItems: [
      { name: 'eslint:recommended', style: 'recommended' },
      { name: 'eslint:all', style: 'all' }
    ]
      .map((ruleSet) => ({
        id: ruleSet.name,
        label: ruleSet.name,
        run() {
          setEsLintStyle(ruleSet.style)
          refresh()
        }
      }))
      .concat({
        id: 'eslint-custom-rules',
        label: 'Customize',
        run() {
          const save = () => {
            setEsLintStyle('custom')
            refresh()
          }
          customRulesEdit(save)
        }
      })
  })
}

let timer = null

export const lint = (model, worker) => {
  if (timer) {
    clearTimeout(timer)
  }

  // 防抖处理
  timer = setTimeout(() => {
    timer = null
    const eslintStyle = getEslintStyle()
    worker.postMessage({
      code: model.getValue(),
      // 发起 ESLint 静态检查时，携带 versionId
      version: model.getVersionId(),
      style: eslintStyle,
      customRules: eslintStyle === 'custom' ? getEslintCustomRules() : '{}'
    })
  }, 500)
}
