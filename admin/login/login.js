import { getProfile } from '../../src/api/auth.js';
import { request } from '../../src/api/client.js';
import { removeToken, setToken } from '../../src/utils/auth.js';

export async function adminLogin(adminInfo) {
  const { data } = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(adminInfo),
  });

  setToken(data.accessToken);

  const {
    data: {
      user: { role },
    },
  } = await getProfile();

  if (role !== 'ADMIN') {
    removeToken();
    throw new Error('해당 페이지는 관리자만 로그인 할 수 있습니다.');
  }
}
