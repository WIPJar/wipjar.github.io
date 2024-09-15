// APIHelper.ts

import axios from 'axios';

const BASE_URL = 'https://cogins.azurewebsites.net';
// const BASE_URL = 'http://localhost:8000';

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor (optional)
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add authorization headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional)
axiosInstance.interceptors.response.use(
  (response) => {
    // You can handle successful responses here
    return response;
  },
  (error) => {
    // You can handle errors here
    // For example, redirect to login if unauthorized
    if (error.response && error.response.status === 401) {
      // Redirect to login page or refresh token
    }
    return Promise.reject(error);
  }
);

// Generic GET request
const get = async (url, config) => {
  const response = await axiosInstance.get(url, config);
  return response.data;
};

// Generic POST request
const post = async (url, data, config) => {
  const response = await axiosInstance.post(url, data, config);
  return response.data;
};

// Generic PUT request
const put = async (url, data, config) => {
  const response = await axiosInstance.put(url, data, config);
  return response.data;
};

// Generic DELETE request
const del = async (url, config) => {
  const response = await axiosInstance.delete(url, config);
  return response.data;
};

const getPlacesData = () => {
  return get(`/wipplaces`)
}
// Example of a specific API call
const getUserData = (userId) => {
  return get(`/users/${userId}`);
};

const getBackendIndex = () => {
    return get(`/np/index`)
}
// Example of another specific API call
const searchTestName = (postData) => {
  return post('/np/desc', postData);
};

const submitForReview = (postData) => {
    return post('/np/submit', postData);
};


// Export the methods
export const APIHelper = {
  get,
  post,
  put,
  delete: del,
  getUserData,
  getPlacesData,
  getBackendIndex,
  searchTestName,
  submitForReview
  // Add more specific API calls as needed
};
