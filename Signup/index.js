const lattebtn = document.getElementById('lattebtn');

lattebtn.addEventListener('click', async () => {
  const result1 = document.getElementById('result1');
  const result2 = document.getElementById('result2');
  const result3 = document.getElementById('result3');
  const result4 = document.getElementById('result4');
  const result5 = document.getElementById('result5');

  result1.textContent = '';
  result2.textContent = '';
  result3.textContent = '';
  result4.textContent = '';
  result5.textContent = '';

  const signupData = {
    username: document.getElementById('latteId').value.trim(),
    password: document.getElementById('lattePw').value.trim(),
    name: document.getElementById('latteNm').value.trim(),
    phone: document.getElementById('lattePn').value.trim().replace(/-/g, ''),
  };

  const regId = /^[a-z0-9_]{4,20}$/;
  const regPw = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  const regNm = /^(?=.*\S).{1,50}$/;
  const regPn = /^\d{10,11}$/;

  if (!regId.test(signupData.username)) {
    result1.textContent = '4~20자, 영소문자/숫자/_ 만 가능합니다.';
    result1.style.color = 'red';
    return;
  }

  if (!regPw.test(signupData.password)) {
    result2.textContent = '8자 이상, 영문/숫자를 한 개 이상 포함해야 합니다.';
    result2.style.color = 'red';
    return;
  }

  if (!regNm.test(signupData.name)) {
    result3.textContent = '1~50자를 입력해주세요.';
    result3.style.color = 'red';
    return;
  }

  if (!signupData.phone && !regPn.test(signupData.phone)) {
    result4.textContent = '01012345678과 같이 작성해주세요.';
    result4.style.color = 'red';
    return;
  }

  try {
    const res = await fetch(
      'https://api.fullstackfamily.com/api/lattebnb/v1/auth/signup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      },
    );

    if (!res.ok) {
      throw new Error('HTTP 오류: ' + res.status);
    }
    location.href = `../index.html`;
  } catch (e) {
    result5.textContent = `형식에 맞지 않습니다.\n회원 정보를 다시 입력해주세요.`;
    result5.style.color = 'red';
  }
});
