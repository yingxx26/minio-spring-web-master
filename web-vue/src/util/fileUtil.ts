/**
 * 转换文件的大小带单位
 * @param size 文件大小
 * @returns string
 */
export function convertFileSizeUnit(size = 0) {
  if (size == 0) return '0 B'

  if (size < 1024) {
    return `${size} B` // 小于1KB
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB` // 小于1MB
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB` // 小于1GB
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB` // 大于等于1GB
  }
}

/**
 * 根据文件流转成的 blob 下载文件
 * @param blob 文件 blob
 * @param filename 文件名
 */
export function downloadFileByBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = href
  a.download = filename
  a.rel = 'noopener noreferrer'
  document.body.append(a)
  a.click()
  URL.revokeObjectURL(href) //释放URL对象
  a.remove()
}
