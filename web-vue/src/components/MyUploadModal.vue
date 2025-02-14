<template>
  <a-modal title="上传" :width="800" v-model:visible="visible" @cancel="visible = false">
    <a-card title="Arco Card" size="small">
      <template #title>
        <a-space>
          <a-upload :show-file-list="false" :auto-upload="false" @change="selectFile"></a-upload>
          <a-button type="primary" @click="onUpload">
            <template #icon>
              <icon-cloud/>
            </template>
            <template #default>上传文件</template>
          </a-button>
        </a-space>
      </template>

      <a-list size="small">
        <a-list-item v-for="item in state.dataSource" :key="item.uid">
          <a-list-item-meta :title="item.name">
            <template #description>
              <a-space size="medium">
                <div>
                  大小1：<span style="color: blue">{{ item.unitSize }}</span>
                </div>
                <div>
                  md5:
                  <span style="color: red">
                   <template v-if="item.md5Progress">
                       {{ `${item.md5Progress}%` }}
                     <!--                      {{  item.md5Progress }}-->
                   </template>
                   <template v-else>{{ item.md5 }}</template>
                </span>
                </div>
              </a-space>
              <a-progress v-if="item.progress" :percent="item.progress / 100"/>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a-tag :color="tagMap[item.status].color">{{ tagMap[item.status].text }}</a-tag>
          </template>
        </a-list-item>
      </a-list>
    </a-card>
  </a-modal>
</template>


<script setup lang="ts">
import type {FileItem} from '@arco-design/web-vue'
import axios from 'axios'
import pLimit from 'p-limit'
import {CHUNK_SIZE} from '../constants'
// import createChunkFileAndMd5 from '../util/createChunkFileAndMd5'
import {convertFileSizeUnit} from '../util/fileUtil'
import {checkFileByMd5, initMultPartFile, mergeFileByMd5} from '../services/apis'
import {HttpCodeUploadEnum} from '../services'
import type {UploadFileInfoType} from '../services/apis/typing'
import cutFile from '../core/cutFile'
import {MerkleTree} from '../core/MerkleTree'
import {reactive} from 'vue'

const limit = pLimit(3)

/** 分片上传时的 file 和上传地址 url */
type ChunkFileUrlType = {
  url: string
  file: Blob
}
/** 表格数据类型 */
type FileTableDataType = {
  uid: string
  name: string
  size: number
  unitSize: string
  md5: string
  md5Progress: number
  progress: number
  file: File
  chunkCount: number
  chunkFileList: Blob[]
  uploadedSize: number
  status: 'preparation' | 'preupload' | 'uploading' | 'success' | 'error'
}

//  文件上传过程中的多种状态
const tagMap = {
  preparation: {color: 'gold', text: 'MD5计算中'},
  preupload: {color: 'purple', text: '等待上传'},
  uploading: {color: 'blue', text: '上传中'},
  success: {color: 'green', text: '上传成功'},
  error: {color: 'error', text: '上传失败'}
}

const visible = defineModel<boolean>('visible')
const state = reactive<{ dataSource: FileTableDataType[] }>({
  dataSource: []
})

// 选择文件并计算 md5
const selectFile = async (_: FileItem[], fileItem: FileItem) => {
  const file = fileItem.file
  if (!file) return
  const chunkCount = Math.ceil((file.size ?? 0) / CHUNK_SIZE)
  const dataItem: FileTableDataType = {
    uid: fileItem.uid,
    name: file.name,
    size: file.size ?? 0,
    unitSize: convertFileSizeUnit(file.size),
    md5: '',
    md5Progress: 0,
    progress: 0,
    chunkCount,
    file: file,
    status: 'preparation',
    chunkFileList: [],
    uploadedSize: 0
  }
  state.dataSource.push(dataItem)
  const i = state.dataSource.findIndex((item) => item.uid == dataItem.uid)
  const chunks = await cutFile(file)
  const merkleTree = new MerkleTree(chunks.map((chunk) => chunk.hash))
  const md5 = merkleTree.getRootHash()
  const chunkFileList = chunks.map((chunk) => chunk.blob)
  state.dataSource[i] = {
    ...state.dataSource[i],
    md5,
    chunkFileList,
    status: 'preupload'
  }
}

// 查询文件状态并上传
const onUpload = async () => {
  for (let i = 0; i < state.dataSource.length; i++) {
    if (!state.dataSource[i].md5 || state.dataSource[i].status == 'uploading') continue;
    await uploadFile(i, state.dataSource[i])
  }
}

/**
 * 上传处理方法
 * @param index 如果直接修改 item，在上传过程中，item一直在被更改，而循环传入的 item 却一直是初始值，因此需要 index 确定当前 item 的最新值
 * @param item
 */
const uploadFile = async (index: number, item: FileTableDataType) => {

  const {code, data} = await checkFileByMd5(item.md5);
  state.dataSource[index].status = 'uploading';
  if (code === HttpCodeUploadEnum.SUCCESS) {
    state.dataSource[index].progress = 100;
    state.dataSource[index].status = 'success'
    return
  } else if (code === HttpCodeUploadEnum.FAIL) {
    state.dataSource[index].status = 'error'
    return
  }
  //说明是部分上傳
  const needUploadFile = await initSliceFile(item, data)
  const totalSize = needUploadFile.reduce((pre, cur) => pre + cur.file.size, 0)
  const uploadLimit = needUploadFile.map((n) => limit(() => uploadChunkUrl(n, index, totalSize, item.file.type)))
  const results = await Promise.allSettled(uploadLimit)
  const errResults = results.filter((r) => r.status === 'rejected')
  if (errResults.length > 0) {
    console.warn(item.name + ' 上传失败的分片-----', errResults)
    state.dataSource[index].status = 'error'
    return
  }
  //没有失败的分片，就合并
  try {
    const {code, data} = await mergeFileByMd5(item.md5)
    if (code === 200) {
      console.log(data)
      state.dataSource[index].status = 'success'
      state.dataSource[index].progress = 100
    }
  } catch (error) {
    state.dataSource[index].status = 'error'
  }
}


// 初始化分片操作并将分片文件和其上传地址一一对应
const initSliceFile = async (webdata: FileTableDataType, dbData: UploadFileInfoType) => {

  const {uploadId, listParts} = dbData || {}
  const param: UploadFileInfoType = {
    uploadId,
    originFileName: webdata.name,
    size: webdata.size,
    chunkSize: CHUNK_SIZE,
    chunkCount: webdata.chunkCount,
    md5: webdata.md5,
    contentType: webdata.file.type
  }
  const needUploadFile: ChunkFileUrlType[] = []
  //初始化文件分片地址及相关数据
  const {code, data} = await initMultPartFile(param)
  if (code !== 200) return []
  if ((listParts || []).length == 0) {
    webdata.chunkFileList.forEach((file, index) => {
      needUploadFile.push({url: data.urls[index], file: file})
    })
    return needUploadFile
  }
  webdata.chunkFileList.forEach((item, index) => {
    const i = (listParts || []).findIndex((v) => index + 1 == v)
    if (i === -1) {
      needUploadFile.push({url: data.urls[index], file: item})
    }
  })
  return needUploadFile
}

// 根据分片上传地址将分片直传至 minio   函数名uploadChunkUrl，参数（），返回类型: Promise<void>
const uploadChunkUrl = (
    chunkItem: ChunkFileUrlType,
    i: number,
    totalSize: number,
    type: string
): Promise<void> => {
  return new Promise((resolve, reject) => {

    axios.put(chunkItem.url, chunkItem.file,
        {headers: {'Content-Type': type || 'application/octet-stream'}})
        .then((res) => {
          if (res.status !== 200) {
            reject(chunkItem)
          } else {
            // 已上传的文件大小更新，上传进度更新
            const newUploaedSize = state.dataSource[i].uploadedSize + chunkItem.file.size;
            state.dataSource[i] = {
              ...state.dataSource[i],
              uploadedSize: newUploaedSize,
              progress: Math.floor((newUploaedSize / totalSize) * 100)
            }
            resolve()
          }
        }).catch((err) => {
      console.error(err)
      reject(chunkItem)
    })
  })
}
</script>

