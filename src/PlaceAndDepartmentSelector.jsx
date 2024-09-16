import React, { useState, useEffect, useContext } from 'react';
import { Select, Spin, Segmented, Button, message } from 'antd';
import axios from 'axios';
import { DataContext } from './models/DataContext';

const formatCurrentDate = (format) => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const values = [year, month, day]
    const elements = format.split('-').length;
    return values.slice(0, elements).join('-');
} 

const PlaceAndDepartmentSelector = ({goChat}) => {
  const { wipjarData, setFetchRequested, 
        updateData, resetLocalCache, appendExtractedData,
        fetchOne } = useContext(DataContext);
  const [placesInfo, setPlacesInfo] = useState((wipjarData && wipjarData.exploreData && wipjarData.exploreData.placesInfo));
  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState((wipjarData && wipjarData.exploreData && wipjarData.exploreData.selectedPlaces) || []);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState((wipjarData && wipjarData.exploreData && wipjarData.exploreData.selectedDepartments) || []);
  const [selectedTime, setSelectedTime] = useState(formatCurrentDate('yyyy-mm'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true)
        try {
          const response = await axios.get(BASE_URL+'/wipplaces');
          setPlacesInfo(response.data);
          let exploreData = {}
          if(wipjarData && wipjarData.exploreData) {
            exploreData = {
                ...exploreData,
                ...wipjarData.exploreData,
            }
          }
          exploreData = {
            ...exploreData,
            placesInfo: response.data
          }  
          updateData('exploreData', exploreData)
          setLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };
    if(!placesInfo && !loading) {
        console.log('Fetching data...')
        fetchData();
    }
  }, []);

  useEffect(() => {
    if(placesInfo) {
        setPlaces(placesInfo.places)
    }
  }, [placesInfo])

  const BASE_URL = "https://cogins.azurewebsites.net"

//   const BASE_URL = "http://localhost:8000"


  const handlePlaceChange = (values) => {
    if (values.includes('all')) {
      setSelectedPlaces(places.map(place => place.info.name));
    } else {    
      setSelectedPlaces(values);
    }
  };

  useEffect(() => {
    updateDepartments(selectedPlaces);
  }, [selectedPlaces])

  const updateDepartments = (selectedPlaceNames) => {
    const allDepartments = places
      .filter(place => selectedPlaceNames.includes(place.name) || selectedPlaceNames.includes('all'))
      .flatMap(place => place.info.departments.map(dept => dept.name));
    console.log(allDepartments)
    setDepartments([...new Set(allDepartments)]);
  };

  const handleDepartmentChange = (values) => {
    if (values.includes('all')) {
      setSelectedDepartments(departments);
    } else {
      setSelectedDepartments(values);
    }
  };

  useEffect(() => {
    updateData('exploreData', {
        placesInfo, selectedPlaces, selectedDepartments, selectedTime
    })
  }, [placesInfo, selectedPlaces, selectedDepartments, selectedTime])

  const filterOption = (input, option) => {
    console.log(input, option)
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  }

  const onExplore = async () => {
    setLoading(true)
    const formData = new FormData();
    const options = {
        places: selectedPlaces,
        departments: selectedDepartments,
        time: selectedTime
    }
    formData.append('options', JSON.stringify(options));
    try {
        const response = await axios.post(BASE_URL+'/chat_explore', formData);
        // const responseData = JSON.parse(response.data)
        const exploreResponse = response.data
        if(exploreResponse.success) {
            const batch_ids = exploreResponse.data
            updateData('batch_ids', batch_ids)
        } else {
            message.error('Failed to fetch data. Please try again later!')
        }
        console.log('----->', response.data)
    } catch (error) {
        console.error('Upload error', error);
        throw Error("Explore failed")
    }
    setLoading(false)
    goChat();
  }
  
  return (
    loading ? <Spin />: <div style={{
        display: 'flex', 
        flexDirection: 'column',
        alignItems : 'flex-start',
        justifyContent: 'center',
        justifyItems: 'center',
        alignContent: 'center'
        }}>
      <Select
        options={places.map(({name, info}) => ({value: name, label: info.place}))}
        mode="multiple"
        style={{ width: '100%' }}
        placeholder="Select places"
        onChange={handlePlaceChange}
        value={selectedPlaces}
        filterOption={filterOption}
        optionFilterProp="label"
      >
      </Select>

      <Select
        mode="multiple"
        options={departments.map((dept) => ({value: dept, label: dept}))}
        style={{ width: '100%', marginTop: 10 }}
        placeholder="Select departments"
        onChange={handleDepartmentChange}
        value={selectedDepartments}
        filterOption={filterOption}
        optionFilterProp="children"
        disabled={selectedPlaces.length === 0}
      >
      </Select>
      {
        selectedPlaces?.length && selectedDepartments?.length ? 
        <Segmented
        style={{ marginTop: 10 }}
        value={selectedTime}
        options={[{value: 'all', label: 'All Time'}, {value: formatCurrentDate('yyyy'), label: 'This Year'}, {value: formatCurrentDate('yyyy-mm'), label: 'This Month'}]}
        onChange={(value) => {
            setSelectedTime(value)
        }}
      /> : <></>
      }
    {
    selectedTime && <Button 
    style={{ marginTop: 10 }}
    type="primary" 
    onClick={onExplore}>Start exploring</Button>
    }
    </div>
  );
};

export default PlaceAndDepartmentSelector;