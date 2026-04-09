import { loginApi } from '../src/api/auth.js';
import { isValidUsername, isValidPassword } from '../src/utils/validate.js';

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

const togglePass = document.getElementById('togglePass');

togglePass.addEventListener('mouseover', () => {
  formElements.pw.type = 'text';
});
togglePass.addEventListener('mouseout', () => {
  formElements.pw.type = 'password';
});

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

function validationData(loginData) {
  if (!isValidUsername(loginData.username)) {
    return {
      field: 'id',
      message: '아이디를 입력해주세요.',
    };
  }

  if (!isValidPassword(loginData.password)) {
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

  const loginData = getloginData();
  const validation = validationData(loginData);

  if (validation) {
    showError(validation.field, validation.message);
    return;
  }

  try {
    await loginApi(loginData);
    alert(`로그인되었습니다.`);

    location.href = `../`;
  } catch (e) {
    errorMessage.common.textContent =
      '아이디 또는 비밀번호를 다시 입력해주세요.';
  }
});

enterPress();
