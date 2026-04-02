import constants from '../src/constants.js';
import { buildHeader } from '../src/components/header.js';
import avatar1 from '../src/assets/avatar1.jpg';
import avatar2 from '../src/assets/avatar2.jpg';

document.body.prepend(buildHeader());

const API_BASE = constants.API_BASE_URL;
const token = localStorage.getItem('accessToken');

if (!token) {
  alert('로그인을 먼저 해주세요');
  location.href = '/login/';
}

async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/me/profile`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert('프로필 조회 실패');
      return;
    }

    const json = await res.json();
    const user = json.data;

    const avatarElement = document.getElementById('avatar');
    if (user.avatarUrl) {
      avatarElement.src = user.avatarUrl;
      avatarElement.onerror = () => {
        avatarElement.src = user.id % 2 === 1 ? avatar1 : avatar2;
      };
    } else {
      avatarElement.src = user.id % 2 === 1 ? avatar1 : avatar2;
    }

    document.getElementById('name').textContent = user.name;
    document.getElementById('role').textContent =
      user.role === 'ADMIN' ? '관리자' : '게스트';
  } catch (error) {
    console.error(`프로필 조회 실패: ${error}`);
    alert('프로필 정보를 불러오는 중 오류가 발생했습니다.');
  }
}

fetchProfile();

const accordionHeaders = document.querySelectorAll('.profile-accordion-header');
accordionHeaders.forEach((header) => {
  header.addEventListener('click', () => {
    const item = header.closest('.profile-accordion-item');
    const isActive = item.classList.contains('active');

    accordionHeaders.forEach((h) => {
      h.closest('.profile-accordion-item').classList.remove('active');
    });

    if (!isActive) {
      item.classList.add('active');
    }
  });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem('accessToken');
    location.href = '/';
  } catch (error) {
    console.error('로그아웃 실패:', error);
    alert('로그아웃 중 오류가 발생했습니다.');
  }
});

const withdrawModal = document.getElementById('withdrawModal');
const withdrawPassword = document.getElementById('withdrawPassword');

document.getElementById('withdrawBtn').addEventListener('click', () => {
  withdrawPassword.value = '';
  withdrawModal.hidden = false;
});

document.getElementById('withdrawCancel').addEventListener('click', () => {
  withdrawModal.hidden = true;
});

document.getElementById('withdrawOk').addEventListener('click', async () => {
  const password = withdrawPassword.value;
  if (!password) {
    alert('비밀번호를 입력해주세요.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/me/withdraw`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      const json = await res.json();
      alert(json.message || '회원 탈퇴에 실패했습니다.');
      return;
    }
    alert('회원 탈퇴가 완료되었습니다.');

    localStorage.removeItem('accessToken');
    location.href = '/';
  } catch (error) {
    console.error(`회원 탈퇴 실패: ${error}`);
    alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
  }
});
