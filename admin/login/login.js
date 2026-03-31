import constants from '../../src/constants';

export async function adminLogin(adminInfo) {
  const res = await fetch(`${constants.API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(adminInfo),
  });

  const { message, data } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return { accessToken: data.accessToken, user: data.user };
}
