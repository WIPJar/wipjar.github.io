import { useState, useEffect, useContext } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Upload, Button, Table, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ImageBrowser from './ImageBrowser';
import Uploader from './Uploader';
import { AppstoreOutlined, MailOutlined, SettingOutlined, WechatWorkOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';
import { DataProvider, DataContext } from './models/DataContext';
import ChatPage from './ChatPage';

const items = [
  {
    label: 'Upload PDFs',
    key: 'batch',
    icon: <MailOutlined />,
    // disabled: 'true'
  },
  {
    label: 'Extracted Data',
    key: 'process',
    icon: <AppstoreOutlined />,
  },
  {
    label: 'Chat with data',
    key: 'chat',
    icon: <WechatWorkOutlined />,
  },]

const BASE_URL = "https://cogins.azurewebsites.net"
// const BASE_URL = "http://localhost:8000"

const PdfUploader = () => {
  const { wipjarData, 
    updateData, resetLocalCache, fetchRequested, setFetchRequested,
    fetchOne, appendExtractedData,  } = useContext(DataContext);
  // const [fileList, setFileList] = useState([]);
  const [extractedText, setExtractedText] = useState();



  useEffect(() => {
    // console.log(wipjarData)
    if(wipjarData && wipjarData.extractedData) {
      setExtractedText(wipjarData.extractedData)
    } 
  }, [wipjarData])

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(BASE_URL+'/extract_text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const responseData = JSON.parse(response.data.response)
      console.log('---->', responseData)
      setExtractedText(responseData);
      message.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error', error);
      message.error('File upload failed');
    }
  };

  const columns = [
    {
      title: 'Extracted Text',
      dataIndex: 'text',
      key: 'text',
    },
  ];

  const data = extractedText ? extractedText.response : [];

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(extractedText.response);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, 'table_data.xlsx');
  };

  return (
    <div>
      {/* <Button onClick={() => {handleManualUpload(fileList[0])}} icon={<UploadOutlined />}>Manual Upload </Button> */}
      {/* <Upload
        fileList={fileList}
        customRequest={handleUpload}
        onChange={({ fileList }) => setFileList(fileList)}
        accept=".pdf,.txt"
      >
        <Button icon={<UploadOutlined />}>Upload File (PDF/TXT)</Button>
      </Upload> */}
      {
        extractedText && 
        <div         style={{
          maginTop: '10px',
          marginBottom: '15px',
        }}>
                <Button
        onClick={exportToExcel}
        type="primary"
        style={{
          marginRight: '10px',
        }}
        disabled={!data}
      >
        Export
      </Button>
      <Button onClick={() => {
        resetLocalCache()
    }}>Clear </Button>
        <Table columns={extractedText.columns} dataSource={data} pagination={false} />
        </div>
      }
    </div>
  );
};

function App() {
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState('batch');
  const [payload, setPayload] = useState();

  const onClick = (e) => {
    setCurrent(e.key);
  };

  const handOver = (payload) => {
    setPayload(payload)
    setCurrent('process');
  }

  return (
    <DataProvider>
      {/* <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div> */}
      <h1>WIPJar</h1>
      <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
      {
        current === 'batch' ?  <Uploader /> : (current === 'chat' ? <ChatPage onSwitch={() => {setCurrent('batch')}}/>: <PdfUploader />)
      }
      
    </DataProvider>
  )
}

export default App
