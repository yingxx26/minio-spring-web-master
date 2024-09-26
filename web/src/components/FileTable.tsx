import { memo, useEffect, useRef } from 'react'
import { Button, Progress, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DownloadOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useReactive } from 'ahooks'
import { CHUNK_SIZE } from '../constants'
import { convertFileSizeUnit, downloadFileByBlob } from '../util/fileUtil'
import { chunkDownloadFile, fetchFileList } from '../services/apis'
import type { FilesType } from '../services/apis/typing'

type DownloadStatus = {
  progress?: number
  status?: 'downloading' | 'pause' | 'error'
}

type FileDataType = FilesType & DownloadStatus

const FileTable: React.FC = memo(() => {
  const blobRef = useRef(new Map<number, BlobPart[]>()) // 必须要 ref 缓存，否则 react 的重渲染机制会导致数据重置
  const state = useReactive<{ dataSource: FileDataType[] }>({
    dataSource: [],
  })

  const columns: ColumnsType<FileDataType> = [
    {
      title: '主键id',
      dataIndex: 'id',
      rowScope: 'row',
      width: 80,
    },
    {
      title: '原文件名',
      dataIndex: 'originFileName',
      ellipsis: true,
    },
    {
      title: 'object',
      dataIndex: 'object',
      ellipsis: true,
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      width: 100,
      render: (val) => convertFileSizeUnit(val),
    },
    {
      title: '下载进度',
      dataIndex: 'progress',
      render: (val) => <>{!!val && <Progress percent={val} size="small" />}</>,
    },
    {
      title: '操作',
      dataIndex: 'status',
      width: 120,
      render: (val, record, index) => {
        if (val === undefined || val === 'error') {
          return (
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(record, index)}
            />
          )
        } else {
          return (
            <>
              {val == 'downloading' ? (
                // 暂停
                <Button
                  type="primary"
                  icon={<PauseCircleOutlined />}
                  onClick={() => puaseDownload(index)}
                />
              ) : (
                // 继续下载
                <Button
                  type="primary"
                  ghost
                  icon={<PlayCircleOutlined />}
                  onClick={() => downloadFile(record, index)}
                />
              )}
            </>
          )
        }
      },
    },
  ]

  useEffect(() => {
    getFileTableList()
  }, [])

  const getFileTableList = async () => {
    const { code, data } = await fetchFileList()
    if (code === 200) state.dataSource = data
  }

  // 分片下载文件
  const downloadFile = async (record: FileDataType, index: number) => {
    state.dataSource[index].status = 'downloading'
    const totalChunks = Math.ceil(record.size / CHUNK_SIZE) // 请求次数，可自定义调整分片大小，这里默认了上传分片大小
    // 如果是暂停，根据已下载的，找到断点，偏移长度进行下载
    const offset = blobRef.current.get(record.id)?.length || 0

    for (let i = offset + 1; i <= totalChunks; i++) {
      // 暂停/错误 终止后续请求
      if (state.dataSource[index].status !== 'downloading') return

      const start = CHUNK_SIZE * (i - 1)
      let end = CHUNK_SIZE * i - 1
      if (end > record.size) end = record.size // 虽然超出不会影响内容读取，但是会影响进度条的展示

      try {
        const res = await chunkDownloadFile(record.id, `bytes=${start}-${end}`)
        const currentDataBlob = blobRef.current.get(record.id) || []
        // 记录当前数据的分片 blob
        blobRef.current.set(record.id, [...currentDataBlob, res as unknown as BlobPart])
        state.dataSource[index].progress = Math.floor((end / record.size) * 100)
      } catch (error) {
        state.dataSource[index].status = 'error'
        return
      }
    }

    state.dataSource[index].status = undefined // 重置状态
    state.dataSource[index].progress = undefined // 重置进度条
    const blob = new Blob(blobRef.current.get(record.id))
    downloadFileByBlob(blob, record.originFileName)
  }

  // 暂停下载
  const puaseDownload = (index: number) => {
    state.dataSource[index].status = 'pause'
  }

  return <Table rowKey="id" columns={columns} dataSource={state.dataSource} />
})

export default FileTable
