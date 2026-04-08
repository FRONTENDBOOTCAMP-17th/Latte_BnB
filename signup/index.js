import constants from '../src/constants.js';

const API_BASE = constants.API_BASE_URL;

const formElements = {
  id: document.getElementById('latteId'),
  pw: document.getElementById('lattePw'),
  nm: document.getElementById('latteNm'),
  pn: document.getElementById('lattePn'),
  signupbtn: document.getElementById('signupbtn'),
};

const errorMessage = {
  id: document.getElementById('result1'),
  pw: document.getElementById('result2'),
  nm: document.getElementById('result3'),
  pn: document.getElementById('result4'),
  common: document.getElementById('result5'),
};

function clearMessages() {
  errorMessage.id.textContent = '';
  errorMessage.pw.textContent = '';
  errorMessage.nm.textContent = '';
  errorMessage.pn.textContent = '';
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

function getsignupData() {
  return {
    username: formElements.id.value.trim(),
    password: formElements.pw.value.trim(),
    name: formElements.nm.value.trim(),
    phone: formElements.pn.value.trim(),
  };
}

const reg = {
  id: /^[a-z0-9_]{4,20}$/,
  pw: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  nm: /^(?=.*\S).{1,50}$/,
  pn: /^010-\d{4}-\d{4}$/,
};

function validationData(signupData) {
  if (!reg.id.test(signupData.username)) {
    return {
      field: 'id',
      message: `4~20자, 영소문자/숫자/_ 만 가능합니다.`,
    };
  }

  if (!reg.pw.test(signupData.password)) {
    return {
      field: 'pw',
      message: `8자 이상, 영문/숫자를 한 개 이상 포함해야 합니다.`,
    };
  }

  if (!reg.nm.test(signupData.name)) {
    return {
      field: 'nm',
      message: `1~50자를 입력해주세요.`,
    };
  }

  if (!reg.pn.test(signupData.phone)) {
    return {
      field: 'pn',
      message: `010-1234-5678과 같이 입력해주세요.`,
    };
  }

  return null;
}

function showError(field, message) {
  errorMessage[field].textContent = message;
}

async function signupApi(signupData) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signupData),
  });

  if (!res.ok) {
    throw new Error(`HTTP 오류: ${res.status}`);
  }

  return res;
}

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  clearMessages();

  const signupData = getsignupData();
  const validation = validationData(signupData);

  if (validation) {
    showError(validation.field, validation.message);
    return;
  }

  try {
    await signupApi(signupData);
    alert(`회원가입이 완료되었습니다!`);

    location.href = `../`;
  } catch (e) {
    errorMessage.common.textContent = `형식에 맞지 않습니다. 회원 정보를 다시 입력해주세요.`;
  }
});

enterPress();
