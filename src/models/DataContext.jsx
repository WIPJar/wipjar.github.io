import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "https://cogins.azurewebsites.net"
// const BASE_URL = "http://localhost:8000"

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [fetchRequested, setFetchRequested] = useState(false);

  const [wipjarData, setWipjarData] = useState(() => {
    const savedData = localStorage.getItem('wipjarData');
    return savedData ? JSON.parse(savedData) : {};
  });

  useEffect(() => {
    localStorage.setItem('wipjarData', JSON.stringify(wipjarData));
  }, [wipjarData]);

  const updateData = (key, newData) => {
    setWipjarData(prevData => ({
      ...prevData,
      [key]: newData,
    }));
  };

  const askQuestion = async (messages, filename, isTable) => {
    const question = messages[messages.length - 1].text
    const formData = new FormData();
    formData.append('key', filename);
    formData.append('question', question)
    formData.append('is_table', isTable);
    console.log(filename,question, isTable)
    try {
        const response = await axios.post(BASE_URL+'/chat', formData, {
        // headers: {
        //     'Content-Type': 'multipart/form-data',
        // },
        });
        console.log(response.data)
        const res = {
            text: response.data,
            table: response.data 
        }
        const lastMessage = messages[messages.length - 1]
        lastMessage.answered = true
        console.log(response.table)
        updateData('messages', [...messages, { text: res.text.response || '', table: res.response || null, isUser: false }]);
        // return res
    } catch (error) {
        console.error('Upload error', error);
        // message.error('Chat failed');
        const response = {response: "Error"}
        updateData('messages', (prevState) => {
            const lastMessage = prevState[prevState.length - 1]
            lastMessage.failed = true
            return [...prevState, { text: response.response || '', table: response.table || null, isUser: false }]
        });
        updateData('requestFailed', true)
        throw Error("Upload failed")
    } finally {
      updateData('requestFinished', true)
      updateData('requestInProgress', false)
    }
  }

  const appendExtractedData = (extractedText) => {
    console.log(extractedText)
    const extractedData = wipjarData.extractedData || {};
    if(! extractedData.columns) {
      extractedData.columns = [...extractedText.columns] 
    }
    extractedData.response = [...(extractedData.response || []), ...extractedText.response]
    setWipjarData(prevData => ({
      ...prevData,
      extractedData
    }));
  };

  const resetLocalCache = () => {
    setWipjarData((prevData) => ({
      ...prevData,
      extractedData: []
    }))
  }

  const resetChatHistory = () => {
    setWipjarData((prevData) => ({
      ...prevData,
      messages: [],
      requestInProgress: false,
      requestFinished: false
    }))
  }

  const fetchOne = async (testName) => {
    if(wipjarData[testName]) {
      const {test_name, test_alias, status } = wipjarData[testName]
      setLocalHistory(prevData => [...prevData, {test_name, test_alias, status}])
      return wipjarData[testName]
    }
  }

  return (
    <DataContext.Provider value={{ 
      wipjarData, fetchRequested, setFetchRequested,
      fetchOne, askQuestion, resetChatHistory,
      updateData, resetLocalCache, appendExtractedData
      }}>
      {children}
    </DataContext.Provider>
  );
};
