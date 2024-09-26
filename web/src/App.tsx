import { useState } from 'react'
import { Button, Flex } from 'antd'
import FileTable from './components/FileTable'
import UploadModal from './components/UploadModal'
import './App.css'

function App() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Flex style={{ marginBottom: 20 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          上传文件
        </Button>
      </Flex>

      <FileTable />

      <UploadModal open={open} onCancel={() => setOpen(false)} />
    </>
  )
}

export default App
