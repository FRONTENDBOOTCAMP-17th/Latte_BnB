export function getToken() {
  return localStorage.getItem('accessToken');
}

export function setToken(token) {
  localStorage.setItem('accessToken', token);
}

export function removeToken() {
  localStorage.removeItem('accessToken');
}
