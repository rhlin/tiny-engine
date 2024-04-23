import { viteStaticCopy } from 'vite-plugin-static-copy'
import {
  analysisPackageNeedToInstallAndModifyFilesMergeToSameVersion,
  dedupeCopyFiles,
  getCdnPathNpmInfoForPackage,
  getCdnPathNpmInfoForSingleFile
} from './locateCdnNpmInfo'
import { importmapPlugin } from '../externalDeps'
import { installPackageTemporary } from '../vite-plugins/installPackageTemporary'

export const useLocalImportMap = (
  importMap,
  styles,
  originCdnPrefix,
  publicPath,
  dir,
  packageCopy,
  bundleTempDir = 'bundle-deps/design-core-import-map'
) => {
  const importMapFiles = Object.entries(importMap.imports)
    .filter(([_libKey, libPath]) => libPath.startsWith(originCdnPrefix))
    .map(([libKey, libPath]) => {
      if (packageCopy.includes(libKey)) {
        return getCdnPathNpmInfoForPackage(libPath, originCdnPrefix, publicPath, dir, true, bundleTempDir)
      }
      return getCdnPathNpmInfoForSingleFile(libPath, originCdnPrefix, publicPath, dir, false, bundleTempDir)
    })
  const styleFiles = styles
    .filter((styleUrl) => styleUrl.startsWith(originCdnPrefix))
    .map((url) => getCdnPathNpmInfoForSingleFile(url, originCdnPrefix, publicPath, dir, false), bundleTempDir)

  const { packages: packageNeedToInstall, files } = analysisPackageNeedToInstallAndModifyFilesMergeToSameVersion(
    importMapFiles.concat(styleFiles)
  )

  return [
    ...installPackageTemporary(packageNeedToInstall, bundleTempDir),
    ...viteStaticCopy({
      targets: dedupeCopyFiles(files)
    }),
    {
      config(config, { command }) {
        // 处理devAlias带CDN域名， 另外需要使得本地vue和importMap的vue是同一个实例
        if (command === 'serve') {
          config.resolve.alias = [
            ...config.resolve.alias,
            {
              find: /^vue$/,
              replacement: `http://localhost:8080/${
                files.find(({ originUrl }) => importMap.imports.vue === originUrl).newUrl
              }` // 实际端口号需要更具本地启动修改
            }
          ]
        }
      }
    },
    importmapPlugin(
      {
        imports: Object.fromEntries(
          Object.entries(importMap.imports).map(([k, v]) => [k, files.find((f) => f.originUrl === v)?.newUrl ?? v])
        )
      },
      styles.map((url) => styleFiles.find((f) => f.originUrl === url).newUrl ?? url)
    )
  ]
}
