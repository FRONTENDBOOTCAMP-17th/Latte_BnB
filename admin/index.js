import constants from '../src/constants';

const content = document.getElementById('content');
content.classList.remove('grid');
content.classList.add('hidden');

if (localStorage.getItem('admin_token')) {
  const res = await fetch(`${constants.API_BASE_URL}/me/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
    },
  });

  if (!res.ok) {
    location.replace('/admin/login/');
  }

  const { success } = await res.json();
  if (success) {
    console.log('유효한 토큰입니다.');
    content.classList.add('grid');
    content.classList.remove('hidden');
  }
} else {
  location.replace('/admin/login/');
}
