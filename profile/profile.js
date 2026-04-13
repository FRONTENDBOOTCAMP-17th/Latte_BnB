import avatar1 from '../src/assets/avatar1.jpg';
import avatar2 from '../src/assets/avatar2.jpg';
import { removeToken } from '../src/utils/auth.js';
import { getProfile, logout, withdraw } from '../src/api/auth.js';

async function fetchProfile() {
  try {
    const res = await getProfile();

    if (!res) {
      alert('로그인을 먼저 해주세요');
      location.href = '/login/';
      return;
    }

    const user = res.data;

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
    if (error.message === 'HTTP 에러: 401') {
      alert('로그인을 먼저 해주세요');

      location.href = '/login/';
      return;
    }

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
    await logout();

    removeToken();
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
  withdrawModal.classList.add('active');
});

document.getElementById('withdrawCancel').addEventListener('click', () => {
  withdrawModal.classList.remove('active');
});

document.getElementById('withdrawOk').addEventListener('click', async () => {
  const password = withdrawPassword.value;

  if (!password) {
    alert('비밀번호를 입력해주세요.');
    return;
  }

  try {
    await withdraw(password);
    alert('회원 탈퇴가 완료되었습니다.');

    removeToken();
    location.href = '/';
  } catch (error) {
    console.error(`회원 탈퇴 실패: ${error}`);
    alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
  }
});
