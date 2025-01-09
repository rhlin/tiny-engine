import { reactive, watch } from 'vue'
import { useBroadcastChannel } from '@vueuse/core'
import { constants } from '@opentiny/tiny-engine-utils'

const { BROADCAST_CHANNEL, CANVAS_ROUTER_VIEW_SETTING_VIEW_MODE_KEY } = constants

function getCacheValue() {
  const value = localStorage.getItem(CANVAS_ROUTER_VIEW_SETTING_VIEW_MODE_KEY)
  if (!['embedded', 'standalone'].includes(value)) {
    return 'embedded'
  }
  return value as 'embedded' | 'standalone'
}

export interface IRouterViewSetting {
  viewMode: 'embedded' | 'standalone'
}

export function useRouterViewSetting() {
  const routerViewSetting = reactive<IRouterViewSetting>({
    viewMode: getCacheValue()
  })

  const { data } = useBroadcastChannel<IRouterViewSetting, IRouterViewSetting>({
    name: BROADCAST_CHANNEL.CanvasRouterViewSetting
  })

  watch(data, () => {
    routerViewSetting.viewMode = data.value.viewMode
  })

  return {
    routerViewSetting
  }
}
