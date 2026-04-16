import { setToken } from '../utils/auth.js';
import { request, authRequest } from './client.js';

export async function signupApi(signupData) {
  const body = {
    username: signupData.username,
    password: signupData.password,
    name: signupData.name,
  };

  if (signupData.phone) {
    body.phone = signupData.phone.replace(/-/g, '');
  }

  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function loginApi(loginData) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  });
  setToken(res.data.accessToken);

  return res;
}

export async function checkWish(accommodationIds) {
  return authRequest('/me/wishlist/check', {
    method: 'POST',
    body: JSON.stringify({ accommodationIds }),
  });
}

export function checkAdmin() {
  const profilePromise = getProfile();

  profilePromise
    .then(({ data }) => {
      if (data.user.role !== 'ADMIN') {
        throw new Error();
      }
    })
    .catch(() => {
      location.replace('/admin/login/');
    });
}

export async function getProfile() {
  return authRequest('/me/profile', {
    method: 'GET',
  });
}

export async function updateProfile(data) {
  return authRequest('/me/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function toggleWishList(accommodationId, isWishlisted) {
  return authRequest('/me/wishlist', {
    method: 'PATCH',
    body: JSON.stringify({ accommodationId, isWishlisted }),
  });
}

export async function logout() {
  return authRequest('/auth/logout', {
    method: 'POST',
  });
}

export async function withdraw(password) {
  return authRequest('/me/withdraw', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
