import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { App as AntdApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import dayjs from 'dayjs'
import App from './App.tsx'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider locale={zhCN}>
    <AntdApp>
      <App />
    </AntdApp>
  </ConfigProvider>,
)
