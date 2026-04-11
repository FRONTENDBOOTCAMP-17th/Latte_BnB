import { signupApi, loginApi } from '../src/api/auth.js';
import { passwordToggle } from '../src/components/togglePassword.js';
import {
  isValidUsername,
  isValidPassword,
  isValidName,
  isValidPhone,
} from '../src/utils/validate.js';

const formElements = {
  id: document.getElementById('latteId'),
  pw: document.getElementById('lattePw'),
  nm: document.getElementById('latteNm'),
  pn: document.getElementById('lattePn'),
  signupbtn: document.getElementById('signupbtn'),
};

const errorMessage = {
  id: document.getElementById('errorUsername'),
  pw: document.getElementById('errorPassword'),
  nm: document.getElementById('errorName'),
  pn: document.getElementById('errorPhone'),
  common: document.getElementById('errorCommon'),
};

function clearMessages() {
  errorMessage.id.textContent = '';
  errorMessage.pw.textContent = '';
  errorMessage.nm.textContent = '';
  errorMessage.pn.textContent = '';
  errorMessage.common.textContent = '';
}

passwordToggle('togglePass', formElements.pw);

window.addEventListener('load', () => {
  formElements.id.focus();
});

function enterPress() {
  const forms = [
    formElements.id,
    formElements.pw,
    formElements.nm,
    formElements.pn,
  ];

  forms.forEach((form, idx) => {
    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;

      e.preventDefault();
      const nextForm = forms[idx + 1];

      if (nextForm) {
        nextForm.focus();
      } else {
        formElements.signupbtn.click();
      }
    });
  });
}

function getSignupData() {
  return {
    username: formElements.id.value.trim(),
    password: formElements.pw.value.trim(),
    name: formElements.nm.value.trim(),
    phone: formElements.pn.value.trim(),
  };
}

function validationData(signupData) {
  if (!signupData.username) {
    return {
      field: 'id',
      message: `아이디를 입력하세요.`,
    };
  }

  if (!isValidUsername(signupData.username)) {
    return {
      field: 'id',
      message: `4~20자, 영소문자/숫자/_ 만 가능합니다.`,
    };
  }

  if (!signupData.password) {
    return {
      field: 'pw',
      message: `비밀번호를 입력하세요.`,
    };
  }

  if (!isValidPassword(signupData.password)) {
    return {
      field: 'pw',
      message: `8자 이상, 영문/숫자를 한 개 이상 포함해야 합니다.`,
    };
  }

  if (!signupData.name) {
    return {
      field: 'nm',
      message: `이름을 입력하세요.`,
    };
  }

  if (!isValidName(signupData.name)) {
    return {
      field: 'nm',
      message: `1~50자를 입력해주세요.`,
    };
  }

  if (!signupData.phone) {
    return {
      field: 'pn',
      message: `전화번호를 입력하세요.`,
    };
  }

  if (!isValidPhone(signupData.phone)) {
    return {
      field: 'pn',
      message: `전화번호는 숫자만 10~11자리여야 합니다.`,
    };
  }

  return null;
}

function showError(field, message) {
  errorMessage[field].textContent = message;
}

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  clearMessages();

  const signupData = getSignupData();
  const validation = validationData(signupData);

  if (validation) {
    showError(validation.field, validation.message);
    return;
  }

  try {
    await signupApi(signupData);
    await loginApi({
      username: signupData.username,
      password: signupData.password,
    });
    alert(`회원가입이 완료되었습니다!`);

    location.href = `../`;
  } catch (e) {
    errorMessage.common.textContent = `형식에 맞지 않습니다. 회원 정보를 다시 입력해주세요.`;
  }
});

enterPress();
