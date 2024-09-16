import React, { useState, useContext, useEffect } from 'react';
import { Input, Button, Checkbox, Spin, Table, Segmented, Empty, Typography, message, Tag } from 'antd';
import { Select, Space, Card, Badge, Popover } from 'antd';
import { DataContext } from './models/DataContext';
import axios from 'axios';
import Markdown from 'react-markdown'


const BASE_URL = "https://cogins.azurewebsites.net"
// const BASE_URL = "http://localhost:8000"
const { Title, Paragraph, Text, Link } = Typography;

const EllipsisMiddle = ({
  suffixCount,
  children,
}) => {
  const start = children.slice(0, children.length - suffixCount);
  const suffix = children.slice(-suffixCount).trim();
  return (
    <Text ellipsis={{ suffix }}>
      {start}
    </Text>
  );
};

const ChatPage = ( {onSwitch, onExplore} ) => {
    const { wipjarData, setFetchRequested, askQuestion,
        updateData, resetLocalCache, resetChatHistory, appendExtractedData,
        fetchOne } = useContext(DataContext);
  const [messages, setMessages] = useState((wipjarData && wipjarData.messages) || []);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState((wipjarData && wipjarData.requestInProgress) || false);
  const [isTable, setIsTable] = useState(false);
  const [filenameOptions, setFilenameOptions] = useState([]);
  const [exploreData, setExploreData] = useState();
  const [filename, setFilename] = useState();


  const handleFileChange = (value) => {
    console.log(value)
    setFilename('--->', value);
  };

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
    if(wipjarData && wipjarData.exploreData) {
      setExploreData(wipjarData.exploreData)
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
    if(wipjarData && (wipjarData.requestFinished || wipjarData.keepAlive)) {
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
    if(wipjarData.batch_ids) {
      wipjarData.batch_ids.forEach((batch_id, idx) => {
        askQuestion(updatedMessages, batch_id, isTable, idx+1 < wipjarData.batch_ids.length)
      })
    } else {
      askQuestion(updatedMessages, filename, isTable)
    }
  };

  return (filenameOptions.length || exploreData?.selectedDepartments) ? (
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
      <div style={{ 
        display: 'flex',
        flexDirection: 'column', 
        // justifyContent: 'space-around' ,
        border: '2px dashed grey'
        }}>
<div style={{ padding: 20, 
        display: 'flex',
        // flexDirection: 'row-reverse', 
        justifyContent: 'space-around',
        alignItems: 'center'
        }}>
          <div style={{ 
        display: 'flex',
        flexDirection: 'row', 
        }}>
          <Text style={{ marginRight: 10 }}>Exploring {exploreData?.selectedTime}</Text>
          <Tag color="#87d068" style={{ width: 'fit-content' }}>{exploreData.selectedPlaces}</Tag>
          {exploreData.selectedDepartments && <EllipsisMiddle suffixCount={12}>
    {exploreData.selectedDepartments.toString()}
  </EllipsisMiddle>
}
    </div>
    </div>
<div style={{ padding: 10, 
        display: 'flex',
        // flexDirection: 'row-reverse', 
        justifyContent: 'space-around',
        alignItems: 'center'
        }}>
          <div style={{ 
        display: 'flex',
        flexDirection: 'column', 
        }}>
          <Text>Uploaded Files</Text>
      <Select
      defaultValue={wipjarData.uploadedFiles[0]?.name}
      style={{ width: 400 }}
      onChange={handleFileChange}
      options={filenameOptions}
    />  
    </div>
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
    }}>
      Clear Chat
    </Button>
    <Button type="primary" onClick={handleSendMessage}>Send</Button>
    </div>
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
    <p> OR </p>
    <Button type="primary" onClick={onExplore}>Explore</Button>
  </Empty>)
};

export default ChatPage;