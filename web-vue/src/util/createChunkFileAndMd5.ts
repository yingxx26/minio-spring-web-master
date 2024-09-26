import SparkMD5 from 'spark-md5'
import { CHUNK_SIZE } from '@/constants'

type ChunkData = {
  md5: string
  chunkFileList: Blob[]
}

/**
 * @deprecated 此方式计算速度慢，非必要请使用 cutFile 进行平替
 * @description  将文件分片拆分，并计算文件的 md5
 * @param file 整个文件 File
 * @param chunkCount 分片数量
 * @param onProgress progress 函数，回传计算的当前进度
 * @returns
 */
const createChunkFileAndMd5 = (
  file: File,
  chunkCount: number,
  onProgress?: (progress: number) => void
): Promise<ChunkData> => {
  const spark = new SparkMD5.ArrayBuffer()
  let currentChunk = 0
  const chunkFileList: Blob[] = []

  const fileReader = new FileReader()
  return new Promise((resolve) => {
    fileReader.onload = function (e) {
      if (!e.target?.result) return
      spark.append(e.target.result as ArrayBuffer)
      currentChunk++
      // 将当前文件的md5进度计算回传
      onProgress?.(Math.floor((currentChunk / chunkCount) * 100))
      if (currentChunk < chunkCount) {
        loadNext()
      } else {
        const md5 = spark.end()
        resolve({ md5, chunkFileList })
      }
    }

    function loadNext() {
      const start = currentChunk * CHUNK_SIZE
      const end = start + CHUNK_SIZE >= file.size ? file.size : start + CHUNK_SIZE
      const chunkFile = file.slice(start, end)
      chunkFileList.push(chunkFile)
      fileReader.readAsArrayBuffer(chunkFile)
    }

    loadNext()
  })
}

export default createChunkFileAndMd5
