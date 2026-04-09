import { setToken } from '../utils/auth.js';
import { request, authRequest } from './client.js';

export async function signupApi(signupData) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      ...signupData,
      phone: signupData.phone.replace(/-/g, ''),
    }),
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

export async function getProfile() {
  return authRequest('/me/profile', {
    method: 'GET',
  });
}

export async function toggleWishList(accommodationId, isWishlisted) {
  return authRequest('/me/wishlist', {
    method: 'PATCH',
    body: JSON.stringify({ accommodationId, isWishlisted }),
  });
}
