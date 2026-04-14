import avatar1 from '../src/assets/avatar1.jpg';
import avatar2 from '../src/assets/avatar2.jpg';
import { removeToken } from '../src/utils/auth.js';
import {
  getProfile,
  updateProfile,
  logout,
  withdraw,
} from '../src/api/auth.js';
import toast from '../src/components/toast.js';
import { openModal, closeModal } from '../src/components/modal.js';

async function fetchProfile() {
  try {
    const res = await getProfile();

    if (!res) {
      location.href = '/login/';
      return;
    }

    const user = res.data.user;
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

    document.getElementById('bio').textContent =
      user.bio || '본인을 표현하는 글을 작성해보세요.';

    if (user.region) {
      document.getElementById('region').textContent = user.region;
      document.getElementById('regionDot').classList.remove('hidden');
    }

    if (user.phone) {
      const badge = document.getElementById('phoneCheck');
      badge.classList.remove('hidden');
      badge.classList.add('flex');
    }

    const date = new Date(user.createdAt);
    document.getElementById('createdAt').textContent =
      `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 가입`;
  } catch (error) {
    if (error.status === 401) {
      location.href = '/login/';
      return;
    }
    console.error('프로필 조회 실패:', error);
  }
}

fetchProfile();

document.querySelectorAll('.profile-accordion-header').forEach((header) => {
  header.addEventListener('click', () => {
    const item = header.closest('.profile-accordion-item');
    const isActive = item.classList.contains('active');

    document
      .querySelectorAll('.profile-accordion-item')
      .forEach((accordionItem) => {
        accordionItem.classList.remove('active');
      });

    if (!isActive) item.classList.add('active');
  });
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    await logout();
    removeToken();
    location.href = '/';
  } catch (error) {
    console.error('로그아웃에 실패했습니다:', error);
  }
});

const editProfileModal = document.getElementById('editProfileModal');
const editBio = document.getElementById('editBio');
const editRegion = document.getElementById('editRegion');

document.getElementById('editProfileBtn').addEventListener('click', () => {
  const bio = document.getElementById('bio').textContent;
  editBio.value = bio === '본인을 표현하는 글을 작성해보세요.' ? '' : bio;

  editRegion.value = document.getElementById('region').textContent || '';

  openModal(editProfileModal);
});

document.getElementById('editProfileCancel').addEventListener('click', () => {
  closeModal(editProfileModal);
});

document.getElementById('editProfileOk').addEventListener('click', async () => {
  const data = { bio: editBio.value };
  if (editRegion.value) data.region = editRegion.value;

  try {
    const res = await updateProfile(data);
    const user = res.data.user;

    document.getElementById('bio').textContent =
      user.bio || '자기소개를 입력해주세요.';

    if (user.region) {
      document.getElementById('region').textContent = user.region;
      document.getElementById('regionDot').classList.remove('hidden');
    } else {
      document.getElementById('regionDot').classList.add('hidden');
    }

    closeModal(editProfileModal);
    toast.success('프로필이 저장되었습니다.');
  } catch (error) {
    console.error('프로필 수정 에러:', error);
    toast.error('프로필 수정에 실패했습니다.');
  }
});

const withdrawModal = document.getElementById('withdrawModal');
const withdrawPassword = document.getElementById('withdrawPassword');

document.getElementById('withdrawBtn').addEventListener('click', () => {
  withdrawPassword.value = '';
  openModal(withdrawModal);
});

document.getElementById('withdrawCancel').addEventListener('click', () => {
  closeModal(withdrawModal);
});

document.getElementById('withdrawOk').addEventListener('click', async () => {
  if (!withdrawPassword.value) {
    toast.warn('비밀번호를 입력해주세요.');
    return;
  }

  try {
    await withdraw(withdrawPassword.value);
    toast.success('회원 탈퇴가 성공적으로 완료되었습니다.');
    removeToken();
    location.href = '/';
  } catch (error) {
    console.error('회원 탈퇴 에러:', error);
    toast.error('회원 탈퇴에 실패하였습니다.');
  }
});
