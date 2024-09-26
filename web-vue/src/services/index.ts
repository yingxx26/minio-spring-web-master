import { Message } from '@arco-design/web-vue'
import axios from 'axios'
import type {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  RawAxiosRequestHeaders
} from 'axios'

type ConfigType = Omit<InternalAxiosRequestConfig, 'headers'> &
  Partial<{
    headers: RawAxiosRequestHeaders
  }>

const config: AxiosRequestConfig = {
  baseURL: import.meta.env.VITE_BASE_URL,
  // timeout: 20000,
  withCredentials: true
}

/** 单独针对文件上传的状态码 */
export enum HttpCodeUploadEnum {
  /** 上传成功 */
  SUCCESS = 2001,
  /** 上传中 */
  UPLOADING = 2002,
  /** 未上传 */
  NOT_UPLOAD = 2003,
  /** 上传失败 */
  FAIL = 5001
}

//  校验文件状态码
function validateFileCode(code: number) {
  switch (code) {
    case HttpCodeUploadEnum.SUCCESS:
    case HttpCodeUploadEnum.UPLOADING:
    case HttpCodeUploadEnum.NOT_UPLOAD:
      return true
    default:
      return false
  }
}

class RequestHttp {
  service: AxiosInstance
  public constructor(config: AxiosRequestConfig) {
    this.service = axios.create(config)

    this.service.interceptors.request.use(
      (config: InternalAxiosRequestConfig<AxiosHeaders>) => {
        return { ...config, ...config.headers }
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    /**
     * @description 响应拦截器
     */
    this.service.interceptors.response.use(
      (response) => {
        const { data } = response
        //  防止文件流的错误
        if (data.code && data.code !== 200 && !validateFileCode(data?.code)) {
          Message.error(data.msg)
          return Promise.reject(data)
        }
        // * 成功请求（在页面上除非特殊情况，否则不用处理失败逻辑）
        return data
      },
      (error: AxiosError) => {
        const { response } = error
        // 请求超时没有 response
        if (error.message.indexOf('timeout') !== -1) Message.error('请求超时，请稍后再试')
        if (response) Message.error(response.statusText)
        return Promise.reject(error)
      }
    )
  }

  // * 常用请求方法封装
  get<T>(url: string, params?: object, _object: ConfigType = {}): Promise<R<T>> {
    return this.service.get(url, { params, ..._object })
  }
  post<T>(url: string, params?: object, _object: ConfigType = {}): Promise<R<T>> {
    return this.service.post(url, params, _object)
  }
  put<T>(url: string, params?: object, _object: ConfigType = {}): Promise<R<T>> {
    return this.service.put(url, params, _object)
  }
  delete<T>(url: string, params?: any, _object: ConfigType = {}): Promise<R<T>> {
    return this.service.delete(url, { params, ..._object })
  }
}

const http = new RequestHttp(config)
export default http
