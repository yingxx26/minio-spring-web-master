import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ArcoResolver } from 'unplugin-vue-components/resolvers'

interface ViteEnv {
  VITE_API_URL: string
  VITE_BASE_URL: string
  VITE_PORT: number
}

// https://vitejs.dev/config/
export default defineConfig((mode) => {
  const env = loadEnv(mode.mode, process.cwd())
  const viteEnv = wrapperEnv(env)

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ArcoResolver()]
      }),
      Components({
        resolvers: [ArcoResolver({ sideEffect: true })]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: viteEnv.VITE_PORT,
      cors: true,
      proxy: {
        [viteEnv.VITE_BASE_URL]: {
          target: viteEnv.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})

/** 对获取的环境变量做类型转换 */
function wrapperEnv(envConf: Record<string, any>): ViteEnv {
  const ret: any = {}
  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, '\n')
    realName = realName === 'true' ? true : realName === 'false' ? false : realName

    if (envName === 'VITE_PORT') realName = Number(realName)

    ret[envName] = realName
    process.env[envName] = realName
  }
  return ret
}
