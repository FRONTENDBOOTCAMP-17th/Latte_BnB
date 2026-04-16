import { loginApi } from '../src/api/auth.js';
import { passwordToggle } from '../src/components/togglePassword.js';

const formElements = {
  id: document.getElementById('loginId'),
  pw: document.getElementById('loginPw'),
  loginbtn: document.getElementById('loginbtn'),
};

const errorMessage = {
  id: document.getElementById('errorUsername'),
  pw: document.getElementById('errorPassword'),
  common: document.getElementById('errorCommon'),
};

function clearMessages() {
  errorMessage.id.textContent = '';
  errorMessage.pw.textContent = '';
  errorMessage.common.textContent = '';
}

passwordToggle('togglePass', formElements.pw);

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

function getLoginData() {
  return {
    username: formElements.id.value.trim(),
    password: formElements.pw.value.trim(),
  };
}

function validationData(loginData) {
  if (!loginData.username) {
    return {
      field: 'id',
      message: '아이디를 입력해주세요.',
    };
  }

  if (!loginData.password) {
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

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const loginData = getLoginData();
  const validation = validationData(loginData);

  if (validation) {
    showError(validation.field, validation.message);
    return;
  }

  try {
    await loginApi(loginData);

    location.href = `../`;
  } catch (e) {
    errorMessage.common.textContent =
      '아이디 또는 비밀번호를 다시 입력해주세요.';
  }
});

enterPress();
