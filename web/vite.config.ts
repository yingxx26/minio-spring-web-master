import { type ConfigEnv, type UserConfig, defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

interface ViteEnv {
  VITE_API_URL: string
  VITE_BASE_URL: string
  VITE_PORT: number
}

/** 对获取的环境变量做类型转换 */
const wrapperEnv = (envConf: Record<string, any>): ViteEnv => {
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

// https://vitejs.dev/config/
export default defineConfig((mode: ConfigEnv): UserConfig => {
  const env = loadEnv(mode.mode, process.cwd())
  const viteEnv = wrapperEnv(env)

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: viteEnv.VITE_PORT,
      cors: true,
      proxy: {
        [viteEnv.VITE_BASE_URL]: {
          target: viteEnv.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ''),
        },
      },
    },
    plugins: [react()],
  }
})
