import React, { useState, useEffect, useContext } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, Button } from 'antd';
import { DataContext } from './models/DataContext';
const { Dragger } = Upload;
import axios from 'axios';

const BASE_URL = "https://cogins.azurewebsites.net"
// const BASE_URL = "http://localhost:8000"

const Uploader = ( ) => {
    const { wipjarData, setFetchRequested, 
        updateData, resetLocalCache, appendExtractedData,
        fetchOne } = useContext(DataContext);

    const [fileList, setFileList] = useState((wipjarData && wipjarData.uploadedFiles) || []);
    const [uploading, setUploading] = useState(false);


    const handleManualUpload = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post(BASE_URL+'/extract_text', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            });
            appendExtractedData(response.data);
            message.success('File uploaded successfully');
        } catch (error) {
            console.error('Upload error', error);
            message.error('File upload failed');
            throw Error("Upload failed")
        }
        };

        const runAllFiles = async (fileList) => {
              for (const file of fileList) {
              const index = fileList.indexOf(file);
              try {
                await handleManualUpload(file)
                const newFileList = fileList.slice();
                file.status = 'done';
                newFileList[index] = file
                setFileList(newFileList);
              } catch(err) {
                const newFileList = fileList.slice();
                file.status = 'error';
                newFileList[index] = file
                setFileList(newFileList);
              }
              }
          }
          
    useEffect(() => {
        if(fileList) {
            updateData('uploadedFiles', fileList)
        }
    }, [fileList])

    // useEffect(() => {
    //     if(fileList && fileList.length > 0) {
    //         updateData('uploadedFiles', fileList)
    //     }
    // }, [fileList])

    const props = {
        name: 'file',
        multiple: true,
        onChange(info) {
          const { status } = info.file;
          if (status !== 'uploading') {
            // console.log(info.file, info.fileList);
          }
          if (status === 'done') {
            message.success(`${info.file.name} file uploaded successfully.`);
          } else if (status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
          }
        },
        onDrop(e) {
          console.log('Dropped files', e.dataTransfer.files);
        },
        onRemove: (file) => {
          const index = fileList.indexOf(file);
          const newFileList = fileList.slice();
          newFileList.splice(index, 1);
          setFileList(newFileList);
        },
        beforeUpload: (file) => {
          setFileList((prevList) => ([...prevList, file]));
          return false;
        },
        fileList,
      }



  return  <>
  {fileList.length ? <div style={{marginBottom: '15px', marginTop: '10px'}}>
  <Button 
  type="primary"
  style={{marginRight: '15px'}}
  disabled={fileList.find((file) => file.status === 'uploading')}
  onClick={() => {
        const files = fileList.map((file) => {
            file.status = 'uploading'
            return file
        })
        setFileList(files)
        runAllFiles(files) 
        // setFetchRequested(true);
    }}> Upload </Button>
    <Button onClick={() => {
        setFileList([])
    }}>Clear </Button></div> : <></> }
    <Dragger {...props}>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload</p>
    <p className="ant-upload-hint">
      Support for a single or bulk upload. Strictly prohibited from uploading company data or other
      banned files.
    </p>
  </Dragger>
  </>
};
export default Uploader;