import constants from '../src/constants.js';

const API_BASE = constants.API_BASE_URL;

const formElements = {
  id: document.getElementById('loginId'),
  pw: document.getElementById('loginPw'),
  loginbtn: document.getElementById('loginbtn'),
};

const errorMessage = {
  id: document.getElementById('result1'),
  pw: document.getElementById('result2'),
  common: document.getElementById('result3'),
};

function clearMessages() {
  errorMessage.id.textContent = '';
  errorMessage.pw.textContent = '';
  errorMessage.common.textContent = '';
}

window.addEventListener('load', () => {
  formElements.id.focus();
});

function enterPress() {
  const forms = [formElements.id, formElements.pw];

  forms.forEach((form, idx) => {
    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;

      e.preventDefault();

      const nextForm = forms[idx + 1];

      if (nextForm) {
        nextForm.focus();
      } else {
        formElements.loginbtn.click();
      }
    });
  });
}

function getloginData() {
  return {
    username: formElements.id.value.trim(),
    password: formElements.pw.value.trim(),
  };
}

const reg = {
  id: /^[a-z0-9_]{4,20}$/,
  pw: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
};

function validationData(loginData) {
  if (!reg.id.test(loginData.username)) {
    return {
      field: 'id',
      message: '아이디를 입력해주세요.',
    };
  }

  if (!reg.pw.test(loginData.password)) {
    return {
      field: 'pw',
      message: '비밀번호를 입력해주세요.',
    };
  }

  return null;
}

function showError(field, message) {
  errorMessage[field].textContent = message;
}

async function loginApi(loginData) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(loginData),
  });

  if (!res.ok) {
    throw new Error(`HTTP 오류: ${res.status}`);
  }

  return res.json();
}

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  clearMessages();

  const loginData = getloginData();
  const validation = validationData(loginData);

  if (validation) {
    showError(validation.field, validation.message);
    return;
  }

  try {
    const data = await loginApi(loginData);
    const token = data.data.accessToken;

    localStorage.setItem('accessToken', token);
    alert(`로그인되었습니다.`);

    location.href = `../`;
  } catch (e) {
    errorMessage.common.textContent =
      '아이디 또는 비밀번호를 다시 입력해주세요.';
  }
});

enterPress();
