import {
  registerSW,
} from 'virtual:pwa-register'

export function registerPWA() {
  const updateSW = registerSW({
    immediate: true,

    onOfflineReady() {
      console.log(
        'LTC Pioneer Portal is ready to work offline.'
      )
    },

    onNeedRefresh() {
      console.log(
        'A new version of the LTC Pioneer Portal is available.'
      )
    },

    onRegisteredSW(
      swScriptUrl,
      registration
    ) {
      console.log(
        'LTC Portal service worker registered.',
        {
          swScriptUrl,
          registration,
        }
      )
    },

    onRegisterError(error) {
      console.error(
        'LTC Portal service worker registration failed.',
        error
      )
    },
  })

  return updateSW
}