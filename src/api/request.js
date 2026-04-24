import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3000', // 后端接口基础路径
  timeout: 5000
});

request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => Promise.reject(err)
);
export default request;