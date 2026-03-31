import '../../src/style.css';
import toast from '../../src/components/toast.js';
import { adminLogin } from './login.js';

const adminLoginForm = document.getElementById('adminLoginForm');

adminLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let message = [];
  let showMessage = false;

  if (!e.target.adminId.value.trim()) {
    message.push('아이디');
    showMessage = true;
  }

  if (!e.target.adminPassword.value.trim()) {
    message.push('비밀번호');
    showMessage = true;
  }

  if (showMessage) {
    toast.warn(
      '⚠ 빈 칸을 채워주세요.',
      `${message.join(', ')}가 비어있습니다.`,
      2,
    );
    return;
  }

  const adminInfo = {
    username: e.target.adminId.value.trim(),
    password: e.target.adminPassword.value.trim(),
  };

  const loginPromise = adminLogin(adminInfo);
  toast.message('관리자 로그인 중입니다...', '', 999);
  loginPromise
    .then((result) => {
      localStorage.setItem('admin_token', result.accessToken);
      localStorage.setItem('admin_info', JSON.stringify(result.user));
      toast.success('로그인', '관리자 로그인에 성공했습니다.', 2);
    })
    .catch((error) => {
      toast.warn('로그인', error.message, 2);
    });
});
