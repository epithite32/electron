import { nativeImage } from 'electron'
import * as ipcRendererUtils from '@electron/internal/renderer/ipc-renderer-internal-utils'

// |options.types| can't be empty and must be an array
function isValid (options: Electron.SourcesOptions) {
  const types = options ? options.types : undefined
  return Array.isArray(types)
}

function mapSources (sources: ElectronInternal.SourcePayload[]) {
  return sources.map(source => ({
    id: source.id,
    name: source.name,
    thumbnail: nativeImage.createFromDataURL(source.thumbnail),
    display_id: source.display_id,
    appIcon: source.appIcon ? nativeImage.createFromDataURL(source.appIcon) : null
  }))
}

export function getSources (options: Electron.SourcesOptions) {
  return new Promise((resolve, reject) => {
    if (!isValid(options)) throw new Error('Invalid options')

    const captureWindow = options.types.includes('window')
    const captureScreen = options.types.includes('screen')

    if (options.thumbnailSize == null) {
      options.thumbnailSize = {
        width: 150,
        height: 150
      }
    }
    if (options.fetchWindowIcons == null) {
      options.fetchWindowIcons = false
    }

    ipcRendererUtils.invoke<ElectronInternal.SourcePayload[]>('ELECTRON_BROWSER_DESKTOP_CAPTURER_GET_SOURCES', captureWindow, captureScreen, options.thumbnailSize, options.fetchWindowIcons)
      .then(sources => resolve(mapSources(sources)), reject)
  })
}