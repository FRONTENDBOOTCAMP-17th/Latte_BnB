import constants from '../constants.js';
import { getToken } from '../utils/auth.js';

const BASE_URL = constants.API_BASE_URL;

export async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const { message } = await res.json();
    const error = new Error(`HTTP 에러: ${res.status}`);
    error.status = res.status;
    error.data = { message };
    throw error;
  }

  return res.json();
}

export async function authRequest(endpoint, options = {}) {
  const token = getToken();
  if (!token) return null;

  return request(endpoint, options);
}

export async function imageRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error('이미지 업로드 실패');
  }

  return res.json();
}
