<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import type { TableColumnData } from '@arco-design/web-vue'
import { CHUNK_SIZE } from '../constants'
import { convertFileSizeUnit, downloadFileByBlob } from '../util/fileUtil'
import { chunkDownloadFile, fetchFileList } from '../services/apis'
import type { FilesType } from '../services/apis/typing'

type DownloadStatus = {
  progress?: number
  status?: 'downloading' | 'pause' | 'error'
}
type FileDataType = FilesType & DownloadStatus

const state = reactive<{ dataSource: FileDataType[]; blobRef: Map<number, BlobPart[]> }>({
  dataSource: [],
  blobRef: new Map<number, BlobPart[]>()
})

onMounted(async () => {
  const { code, data } = await fetchFileList()
  if (code === 200) state.dataSource = data
})

const columns: TableColumnData[] = [
  { title: '主键id', dataIndex: 'id', width: 80 },
  { title: '原文件名', dataIndex: 'originFileName', ellipsis: true, tooltip: true },
  { title: 'object', dataIndex: 'object', ellipsis: true, tooltip: true },
  { title: '文件大小', dataIndex: 'size', slotName: 'size', width: 120 },
  { title: '下载进度', dataIndex: 'progress', slotName: 'progress' },
  { title: '操作', dataIndex: 'status', slotName: 'status', width: 120 }
]

// 分片下载文件
const downloadFile = async (record: FileDataType) => {
  const index = state.dataSource.findIndex((item) => item.id === record.id)
  state.dataSource[index].status = 'downloading'

  const totalChunks = Math.ceil(record.size / CHUNK_SIZE) // 请求次数，可自定义调整分片大小，这里默认了上传分片大小
  // 如果是暂停，根据已下载的，找到断点，偏移长度进行下载
  const offset = state.blobRef.get(record.id)?.length || 0

  for (let i = offset + 1; i <= totalChunks; i++) {
    // 暂停/错误 终止后续请求
    if (state.dataSource[index].status !== 'downloading') return

    const start = CHUNK_SIZE * (i - 1)
    let end = CHUNK_SIZE * i - 1
    if (end > record.size) end = record.size // 虽然超出不会影响内容读取，但是会影响进度条的展示

    try {
      const res = await chunkDownloadFile(record.id, `bytes=${start}-${end}`)
      const currentDataBlob = state.blobRef.get(record.id) || []
      // 记录当前数据的分片 blob
      state.blobRef.set(record.id, [...currentDataBlob, res as unknown as BlobPart])
      state.dataSource[index].progress = Math.floor((end / record.size) * 100)
    } catch (error) {
      state.dataSource[index].status = 'error'
      return
    }
  }

  state.dataSource[index].status = undefined // 重置状态
  state.dataSource[index].progress = undefined // 重置进度条
  const blob = new Blob(state.blobRef.get(record.id))
  downloadFileByBlob(blob, record.originFileName)
}

// 暂停下载
const puaseDownload = (record: FileDataType) => {
  record.status = 'pause'
}
</script>

<template>
  <a-table :columns="columns" :data="state.dataSource">
    <!-- 文件大小 -->
    <template #size="{ record }">{{ convertFileSizeUnit(record.size) }}</template>
    <!-- 下载进度 -->
    <template #progress="{ record }">
      <a-progress v-if="record.progress" :percent="record.progress / 100" />
    </template>
    <!-- 操作 -->
    <template #status="{ record }">
      <template v-if="record.status === undefined || record.status === 'error'">
        <a-button type="primary" @click="downloadFile(record)">
          <template #icon><icon-download /></template>
        </a-button>
      </template>
      <template v-else>
        <!-- 暂停 -->
        <a-button
          v-if="record.status === 'downloading'"
          type="primary"
          @click="puaseDownload(record)"
        >
          <template #icon><icon-pause-circle /></template>
        </a-button>
        <!-- 继续下载 -->
        <a-button v-else type="primary" @click="downloadFile(record)">
          <template #icon><icon-play-circle /></template>
        </a-button>
      </template>
    </template>
  </a-table>
</template>

<style scoped></style>
