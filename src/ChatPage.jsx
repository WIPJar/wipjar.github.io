import React, { useState, useContext, useEffect } from 'react';
import { Input, Button, Checkbox, Spin, Table, Segmented, Empty, Typography, message } from 'antd';
import { Select, Space, Card, Badge, Popover } from 'antd';
import { DataContext } from './models/DataContext';
import axios from 'axios';
import Markdown from 'react-markdown'

const handleFileChange = (value) => {
    console.log(value)
    setFilename('--->', value);
};

const BASE_URL = "https://cogins.azurewebsites.net"
// const BASE_URL = "http://localhost:8000"

const ChatPage = ( {onSwitch} ) => {
    const { wipjarData, setFetchRequested, askQuestion,
        updateData, resetLocalCache, resetChatHistory, appendExtractedData,
        fetchOne } = useContext(DataContext);
  const [messages, setMessages] = useState((wipjarData && wipjarData.messages) || []);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState((wipjarData && wipjarData.requestInProgress) || false);
  const [isTable, setIsTable] = useState(false);
  const [filenameOptions, setFilenameOptions] = useState([]);
  const [filename, setFilename] = useState();




  useEffect(() => {
    if(wipjarData && wipjarData.uploadedFiles.length) {
        const successFiles = wipjarData.uploadedFiles.filter((file) => file.name && file.status === 'done') 
        const filenameOptions = successFiles.map((file) => {
            return {
                value: file.name,
                label: file.name
            }
        })
        setFilenameOptions(filenameOptions)
        if(successFiles.length && successFiles[0].name) {
            setFilename(successFiles[0].name)
        }
    }
  }, [wipjarData])

  useEffect(() => {
    console.log(filename)
  }, [filename])

  useEffect(() => {
    updateData('requestInProgress', loading)
    console.log('loading: ', loading)
    if(loading) {
        updateData('requestFinished', false)
    }
  }, [loading])

  useEffect(() => {
    console.log(messages)
    if(messages.length) {
        updateData('messages', messages)
    }
  }, [messages])

  useEffect(() => {
    console.log(wipjarData)
    if(wipjarData && wipjarData.requestFinished) {
        setMessages(wipjarData.messages);
        setLoading(wipjarData.requestInProgress);
        if(wipjarData.requestFailed) {
            message.error('Chat failed');
            updateData('requestFinished', false)
            updateData('requestFailed', false)
        }
    }
  }, [wipjarData])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setLoading(true);
    const updatedMessages = [...messages, { text: inputMessage, isUser: true }]
    setMessages(updatedMessages);
    setInputMessage('');
    askQuestion(updatedMessages, filename, isTable)

    // let response;
    // try {
    //     response = await askQuestion(updatedMessages)
    //     const lastMessage = updatedMessages[updatedMessages.length - 1]
    //     lastMessage.answered = true
    //     console.log(response.table)
    //     setMessages([...updatedMessages, { text: response.text.response || '', table: response.response || null, isUser: false }]);
    // } catch(err) {
    //     console.log(err)
    //     response = {response: "Error"}
    //     setMessages((prevState) => {
    //         const lastMessage = prevState[prevState.length - 1]
    //         lastMessage.failed = true
    //         return [...prevState, { text: response.response || '', table: response.table || null, isUser: false }]
    //     });
    // }
    // setLoading(false);
  };

  return filenameOptions.length ? (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 10 }}>
      </div>
      <div style={{ height: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            textAlign: msg.isUser ? 'right' : 'left' 
            }}>
            <Badge.Ribbon placement={msg.isUser ? 'end' : 'start'} text={!msg.isUser ? 'Response' : msg.failed ? 'Failed' : msg.answered ? 'Answered': ''} color={!msg.isUser ? 'blue' : msg.failed ? 'red' : 'green'}>
            <Card size="small" style={{
                backgroundColor: msg.isUser ? 'grey' : 'lightgrey' ,
            }}>
            {msg.table ? (
              <Table dataSource={msg.table} 
            //   columns={[{ title: 'Name', dataIndex: 'name', key: 'name' }]} 
              pagination={{ pageSize: 5 }} />
            ) : (
                <Markdown>{msg.text}</Markdown>
            )}
            </Card>
            </Badge.Ribbon>
          </div>
        ))}
        {loading && <Spin tip="Typing..." />}
      </div>
      <Popover content="Hint: Try something like 'Can you list out all the people that spoke and if they were annoyed or happy with anything?'" open={messages.length === 0 && !inputMessage}>
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onPressEnter={handleSendMessage}
        placeholder="Type your message..."
        style={{ marginBottom: 10 }}
        disabled={loading}
      />
      </Popover>
      <div style={{ padding: 20, 
        display: 'flex',
        // flexDirection: 'row-reverse', 
        justifyContent: 'space-around' ,
        border: '2px dashed grey'
        }}>
      <Select
      defaultValue={wipjarData.uploadedFiles[0].name}
      style={{ width: 400 }}
      onChange={handleFileChange}
      options={filenameOptions}
    />  
    <Segmented
    options={['Text', {label: 'Table', disabled: true}]}
    onChange={(value) => {
        setIsTable(value === 'Table'); // string
    }}
    />
          <Button onClick={() => {
            setMessages([]);
            setLoading(false);
        resetChatHistory()
    }}>Clear Chat</Button>
    <Button type="primary" onClick={handleSendMessage}>Send</Button>
    </div>
    </div>
  ): (<Empty
    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
    imageStyle={{
      height: 60,
    }}
    description={
      <Typography.Text>
        Please upload files to start conversation
      </Typography.Text>
    }
  >
    <Button type="primary" onClick={onSwitch}>Upload Files</Button>
  </Empty>)
};

export default ChatPage;