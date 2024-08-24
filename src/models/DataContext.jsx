import React, { createContext, useState, useEffect } from 'react';

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

  const appendExtractedData = (extractedText) => {
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
      fetchOne,
      updateData, resetLocalCache, appendExtractedData
      }}>
      {children}
    </DataContext.Provider>
  );
};
