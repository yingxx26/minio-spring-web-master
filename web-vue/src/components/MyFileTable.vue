<template>
  <a-table :columns="columns" :data="state.dataSource">
    <template #size="{record}">{{ convertFileSizeUnit(record.size) }}</template>
    <template #progress="{record}">
      <a-progress v-if="record.progress" :percent="record.progress/100"></a-progress>
    </template>
    <template #status="{ record }">
      <template v-if="record.status===undefined || record.s==='error'">
        <a-button type="primary" @click="downloadFile(record)">
          <template #icon>
            <icon-download></icon-download>
          </template>
        </a-button>
      </template>
      <template v-else>
        <a-button v-if="record.status==='downloading'"
                  type="primary" @click="puaseDownload(record)">
          <template #icon>
            <icon-pause-circle></icon-pause-circle>
          </template>
        </a-button>
        <a-button v-else type="primary" @click="downloadFile(record)">
          <template #icon>
            <icon-play-circle/>
          </template>
        </a-button>
      </template>
    </template>
  </a-table>
</template>


<script setup lang="ts">
import {reactive, onMounted} from 'vue'
import type {TableColumnData} from '@arco-design/web-vue'
import {CHUNK_SIZE} from '../constants'
import {convertFileSizeUnit, downloadFileByBlob} from '../util/fileUtil'
import {chunkDownloadFile, fetchFileList} from '../services/apis'
import type {FilesType} from '../services/apis/typing'

type DownloadStatus = {
  progress?: number
  status?: 'downloading' | 'pause' | 'error'
}
type FileDataType = FilesType & DownloadStatus;

type MyState = {
  dataSource: FileDataType[],
  blobRef: Map<number, BlobPart[]>
};

const state = reactive<MyState>({
  dataSource: [],
  blobRef: new Map<number, BlobPart[]>()
})

onMounted(async () => {
  const {code, data} = await fetchFileList();
  if (code === 200) {
    state.dataSource = data;
  }
})

const columns: TableColumnData[] = [
  {title: '主键id', dataIndex: 'id', width: 80},
  {title: '原文件名', dataIndex: 'originFileName', ellipsis: true, width: 200, tooltip: true},
  {title: 'object', dataIndex: 'object', ellipsis: true, tooltip: true},
  {title: '文件大小', dataIndex: 'size', slotName: 'size', width: 120},
  {title: '下载进度', dataIndex: 'progress', slotName: 'progress'},
  {title: '操作', dataIndex: 'status', slotName: 'status', width: 120}
]

// 分片下载文件   reactive数组
const downloadFile = async (record: FileDataType) => {
  const index = state.dataSource.findIndex((item) => {
    item.id === record.id
  })
  state.dataSource[index].status = 'downloading';
  const totalChunks = Math.ceil(record.size / CHUNK_SIZE);
  const offset = state.blobRef.get(record.id)?.length || 0;
  for (let i = offset + 1; i <= totalChunks; i++) {
    if (state.dataSource[index].status !== 'downloading') return;
    const start = CHUNK_SIZE * (i - 1);
    let end = CHUNK_SIZE * i - 1;
    if (end > record.size) end = record.size;

  }
}

// 暂停下载
const puaseDownload = (record: FileDataType) => {
  record.status = 'pause'
}
</script>


<style scoped></style>
