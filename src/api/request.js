import axios from 'axios';

const request = axios.create({
  baseURL: 'http://localhost:3300/api', // 后端接口基础路径
  timeout: 10000
});

// 请求拦截器
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

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    // 如果返回的 code 不是 200/201，视为错误
    if (res.code && res.code !== 200 && res.code !== 201) {
      console.error('API 错误:', res.message);
      return Promise.reject(new Error(res.message || '请求失败'));
    }
    return res;
  },
  err => {
    console.error('网络错误:', err.message);
    return Promise.reject(err);
  }
);

export default request;
