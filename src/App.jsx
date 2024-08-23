import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Upload, Button, Table, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import ImageBrowser from './ImageBrowser';
import { AppstoreOutlined, MailOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import * as XLSX from 'xlsx';
import FileSaver from 'file-saver';

const items = [
  {
    label: 'Upload PDFs',
    key: 'batch',
    icon: <MailOutlined />,
    disabled: 'true'
  },
  {
    label: 'Process a file',
    key: 'process',
    icon: <AppstoreOutlined />,
  },
]

const BASE_URL = "https://cogins.azurewebsites.net"
// const BASE_URL = "http://localhost:8000"

const PdfUploader = () => {
  const [fileList, setFileList] = useState([]);
  const [extractedText, setExtractedText] = useState('');

  const handleUpload = async (options) => {
    const { file, onSuccess, onError } = options;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(BASE_URL+'/extract_text/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data)
      setExtractedText(response.data);
      onSuccess('OK');
      message.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error', error);
      onError({ error });
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
      <Upload
        fileList={fileList}
        customRequest={handleUpload}
        onChange={({ fileList }) => setFileList(fileList)}
        accept=".pdf,.txt"
      >
        <Button icon={<UploadOutlined />}>Upload File (PDF/TXT)</Button>
      </Upload>
      {
        extractedText && 
        <div>
                <Button
        onClick={exportToExcel}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Export
      </Button>
        <Table columns={extractedText.columns} dataSource={data} pagination={false} />
        </div>
      }
    </div>
  );
};

function App() {
  const [count, setCount] = useState(0)
  const [current, setCurrent] = useState('process');
  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  return (
    <>
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
        current === 'batch' ? <ImageBrowser /> : <PdfUploader />
      }
      
    </>
  )
}

export default App
