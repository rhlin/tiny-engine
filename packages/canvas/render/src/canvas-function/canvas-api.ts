import type { useDataSourceMap, useUtils } from '../application-function'
import type { IPageContext, useSchema } from '../page-block-function'
import type { useCustomRenderer } from './custom-renderer'
import type { setConfigure } from '../material-function'
import type { getDesignMode, setDesignMode } from './design-mode'
import type { setController } from './controller'

export interface IApplicationFunctionAPI
  extends Pick<ReturnType<typeof useUtils>, 'getUtils' | 'setUtils'>,
    Pick<ReturnType<typeof useDataSourceMap>, 'getDataSourceMap' | 'setDataSourceMap'> {}
export interface IPageFunctionAPI
  extends Pick<
    ReturnType<typeof useSchema>,
    'setSchema' | 'setState' | 'setProps' | 'getMethods' | 'setMethods' | 'setPageCss'
  > {}
export interface IPageContextAPI
  extends Pick<IPageContext, 'getContext' | 'setCondition' | 'getCondition' | 'getConditions'> {}
export interface ICanvasFunctionAPI extends Pick<ReturnType<typeof useCustomRenderer>, 'getRenderer' | 'setRenderer'> {
  getDesignMode: typeof getDesignMode
  setDesignMode: typeof setDesignMode
  setController: typeof setController
  setConfigure: typeof setConfigure
}
export type IInnerCanvasAPI = IApplicationFunctionAPI & IPageFunctionAPI & ICanvasFunctionAPI & IPageContextAPI

let currentApi: IInnerCanvasAPI

export function setCurrentApi(activeApi) {
  currentApi = activeApi
}

export const api: IInnerCanvasAPI = {
  getUtils: (...args) => currentApi?.getUtils(...args),
  setUtils: (...args) => currentApi?.setUtils(...args),
  getMethods: (...args) => currentApi?.getMethods(...args),
  setMethods: (...args) => currentApi?.setMethods(...args),
  setController: (...args) => currentApi?.setController(...args),
  setConfigure: (...args) => currentApi?.setConfigure(...args),
  setSchema: (...args) => currentApi?.setSchema(...args),
  setState: (...args) => currentApi?.setState(...args),
  setProps: (...args) => currentApi?.setProps(...args),
  getContext: (...args) => currentApi?.getContext(...args),
  setPageCss: (...args) => currentApi?.setPageCss(...args),
  setCondition: (...args) => currentApi?.setCondition(...args),
  getCondition: (...args) => currentApi?.getCondition(...args),
  getConditions: (...args) => currentApi?.getConditions(...args),
  getDataSourceMap: (...args) => currentApi?.getDataSourceMap(...args),
  setDataSourceMap: (...args) => currentApi?.setDataSourceMap(...args),
  getRenderer: (...args) => currentApi?.getRenderer(...args),
  setRenderer: (...args) => currentApi?.setRenderer(...args),
  getDesignMode: (...args) => currentApi?.getDesignMode(...args),
  setDesignMode: (...args) => currentApi?.setDesignMode(...args)
}
