/** 查询该文件是否上传，已上传，返回上传信息 / 初始化分片入参 */
export type UploadFileInfoType = {
  /** 参考类型 UploadUrls */
  uploadId?: string
  originFileName: string
  size: number
  chunkCount: number // 分片数量
  chunkSize: number
  md5: string
  contentType?: string
  /** 该字段只会在秒传时返回文件地址 */
  readonly url?: string
  /** 已上传的分片索引，没有返回 null */
  readonly listParts?: number[]
}

/** 分片成功返回的分片地址，前端直接调用进行上传 */
export type UploadUrls = {
  uploadId: string
  urls: string[]
}

/** 数据库文件列表 */
export type FilesType = {
  id: number
  uploadId: string
  md5: string
  url: string
  bucket: string
  object: string
  originFileName: string
  size: number
  type: string
  CHUNK_SIZE: number
  chunkCount: number
  isDelete: string
  createTime: string
}
