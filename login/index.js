import constants from '../src/constants.js';

const API_BASE = constants.API_BASE_URL;

const loginbtn = document.getElementById('loginbtn');
const id = document.getElementById('loginId');
const pw = document.getElementById('loginPw');

window.addEventListener('load', () => {
  document.getElementById('loginId').focus();
});

id.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    pw.focus();
  }
});

pw.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    loginbtn.click();
  }
});

loginbtn.addEventListener('click', async () => {
  const result1 = document.getElementById('result1');
  const result2 = document.getElementById('result2');
  const result3 = document.getElementById('result3');

  result1.textContent = '';
  result2.textContent = '';
  result3.textContent = '';

  const loginData = {
    username: id.value.trim(),
    password: pw.value.trim(),
  };

  const regId = /^[a-z0-9_]{4,20}$/;
  const regPw = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!regId.test(loginData.username)) {
    result1.textContent = '아이디를 입력해주세요.';
    result1.style.color = 'red';
    return;
  }

  if (!regPw.test(loginData.password)) {
    result2.textContent = '비밀번호를 입력해주세요.';
    result2.style.color = 'red';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    if (!res.ok) {
      throw new Error('HTTP 오류: ' + res.status);
    } else {
      alert(`로그인되었습니다.`);
    }

    const data = await res.json();
    const token = data.data.accessToken;
    localStorage.setItem('accessToken', token);

    location.href = `../`;
  } catch (e) {
    result3.textContent = '아이디 또는 비밀번호를 다시 입력해주세요.';
    result3.style.color = 'red';
  }
});
