# JavaScript 파일 구조화 가이드

> Latte BnB 프로젝트를 기반으로 한 **초보자용** JS 파일 구조 가이드입니다.
> "어떤 코드를 어디에 넣어야 하지?"라는 고민을 해결해 드립니다.

---

## 목차

1. [왜 파일을 나눠야 할까?](#1-왜-파일을-나눠야-할까)
2. [현재 우리 프로젝트 구조 분석](#2-현재-우리-프로젝트-구조-분석)
3. [권장 폴더 구조](#3-권장-폴더-구조)
4. [파일을 나누는 4가지 기준](#4-파일을-나누는-4가지-기준)
5. [실전 리팩토링 예시 — Before & After](#5-실전-리팩토링-예시--before--after)
6. [네이밍 컨벤션 정리](#6-네이밍-컨벤션-정리)
7. [import/export 패턴 정리](#7-importexport-패턴-정리)
8. [체크리스트 — 새 파일을 만들 때](#8-체크리스트--새-파일을-만들-때)

---

## 1. 왜 파일을 나눠야 할까?

하나의 JS 파일에 모든 코드를 넣으면 처음엔 편합니다. 하지만 코드가 늘어나면 아래와 같은 문제가 생깁니다.

| 문제 | 설명 |
|------|------|
| **찾기 어려움** | "로그인 유효성 검사 코드가 어디 있지?" → 500줄짜리 파일을 스크롤... |
| **충돌 위험** | 팀원 A가 위쪽을, 팀원 B가 아래쪽을 고치다 Git 충돌 발생 |
| **재사용 불가** | 다른 페이지에서 같은 기능이 필요해도 복붙밖에 못 함 |
| **테스트 어려움** | 한 함수만 테스트하고 싶은데 파일 전체가 실행됨 |

**핵심 원칙: 한 파일은 한 가지 역할만 한다.**

이것을 **단일 책임 원칙(Single Responsibility Principle)** 이라고 부릅니다.

---

## 2. 현재 우리 프로젝트 구조 분석

### 현재 구조

```
Latte_BnB/
├── src/
│   ├── assets/              # 이미지, SVG
│   ├── components/          # 공용 UI 컴포넌트
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── hamburger.js
│   │   ├── navigation.js
│   │   ├── pagination.js
│   │   └── toast.js
│   ├── styles/              # CSS 파일
│   ├── main.js              # 전역 초기화 (헤더, 푸터, 인증)
│   ├── landing.js           # 랜딩 페이지 로직
│   ├── constants.js         # API URL 설정
│   ├── RoomCard.js          # 숙소 카드 클래스
│   └── style.css            # 메인 스타일시트
├── login/
│   ├── index.html
│   └── index.js             # 로그인 전체 로직 (유효성검사 + API + DOM)
├── signup/
│   ├── index.html
│   └── index.js             # 회원가입 전체 로직
├── accommodations-detail/
│   ├── index.html
│   └── accommodations-detail.js  # 숙소 상세 전체 로직
├── reservation-request/
│   ├── index.html
│   ├── reservation-request.js
│   └── calendar.js          # 캘린더 로직 (잘 분리된 예시!)
├── ...기타 페이지들
```

### 현재 구조의 좋은 점 ✓

- `src/components/` 폴더에 공용 컴포넌트가 잘 모여 있음
- `constants.js`로 API URL을 한곳에서 관리함
- `RoomCard.js`에서 클래스를 사용해 데이터를 캡슐화함
- `calendar.js`처럼 복잡한 로직을 별도 파일로 분리한 것은 좋은 사례!

### 개선이 필요한 점

| 문제 | 예시 |
|------|------|
| **API 호출 코드가 여기저기 흩어져 있음** | `landing.js`, `login/index.js`, `signup/index.js`, `RoomCard.js` 등 각 파일마다 `fetch` 코드가 중복됨 |
| **유효성 검사가 중복됨** | `login/index.js`와 `signup/index.js`에 같은 정규표현식이 복붙됨 |
| **한 파일이 너무 많은 일을 함** | `login/index.js` 하나에 DOM 조작 + 유효성 검사 + API 호출 + 에러 처리가 전부 들어 있음 |
| **인증 관련 코드가 분산됨** | `localStorage.getItem('accessToken')`이 5개 이상의 파일에 흩어져 있음 |

---

## 3. 권장 폴더 구조

```
Latte_BnB/
├── src/
│   ├── assets/               # 이미지, SVG 등 정적 파일
│   │
│   ├── api/                  # ⭐ API 호출 함수 모음 (NEW)
│   │   ├── client.js         #    공통 fetch 래퍼
│   │   ├── auth.js           #    로그인/회원가입 API
│   │   ├── accommodation.js  #    숙소 관련 API
│   │   ├── reservation.js    #    예약 관련 API
│   │   └── wishlist.js       #    위시리스트 API
│   │
│   ├── utils/                # ⭐ 유틸리티 함수 모음 (NEW)
│   │   ├── validate.js       #    유효성 검사 함수들
│   │   ├── format.js         #    가격 포맷, 날짜 포맷 등
│   │   └── auth.js           #    토큰 저장/조회/삭제
│   │
│   ├── components/           # 공용 UI 컴포넌트 (기존 유지)
│   │   ├── header.js
│   │   ├── footer.js
│   │   ├── hamburger.js
│   │   ├── navigation.js
│   │   ├── pagination.js
│   │   └── toast.js
│   │
│   ├── styles/               # CSS 파일 (기존 유지)
│   │
│   ├── main.js               # 전역 초기화 (기존 유지)
│   ├── constants.js          # 설정값 (기존 유지)
│   └── style.css             # 메인 스타일시트 (기존 유지)
│
├── login/                    # 페이지별 폴더 (기존 유지)
│   ├── index.html
│   └── index.js              #    → API/유효성검사를 import해서 사용
├── signup/
├── ...
```

### 폴더별 역할 한눈에 보기

```
src/
├── api/          → "서버와 통신하는 코드"만 넣는다
├── utils/        → "순수한 계산/변환 함수"만 넣는다
├── components/   → "재사용 가능한 UI 조각"만 넣는다
├── styles/       → CSS 파일만 넣는다
├── assets/       → 이미지, 아이콘만 넣는다
└── main.js       → 모든 페이지가 공유하는 초기화 코드
```

> **"어디에 넣어야 하지?" 판단 흐름도:**
>
> 1. 서버에 데이터를 보내거나 받는 코드인가? → `api/`
> 2. DOM을 만들거나 조작하지 않는 순수 함수인가? → `utils/`
> 3. HTML 요소를 만들어서 반환하는 코드인가? → `components/`
> 4. 특정 페이지에서만 쓰는 코드인가? → 해당 페이지 폴더의 `index.js`

---

## 4. 파일을 나누는 4가지 기준

### 기준 1: API 호출 코드를 분리한다

**왜?** API 서버 주소가 바뀌거나, 인증 방식이 바뀌면 모든 파일을 고쳐야 합니다.
API 함수를 한곳에 모아두면, 수정할 곳이 한 군데뿐입니다.

#### Before — 여러 파일에 fetch가 흩어져 있음

```js
// login/index.js 에서
const res = await fetch(`${API_BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData),
});

// signup/index.js 에서 (거의 같은 코드!)
const res = await fetch(`${API_BASE}/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(signupData),
});

// landing.js 에서
const res = await fetch(`${constants.API_BASE_URL}/accommodations?${params}`, {
  method: 'GET',
});

// RoomCard.js 에서
const res = await fetch(`${constants.API_BASE_URL}/me/wishlist`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
  body: JSON.stringify({ accommodationId: this.#id, isWishlisted: !this.#isWish }),
});
```

매번 `fetch`, `headers`, `JSON.stringify`, `res.ok` 체크를 반복하고 있습니다.

#### After — API 함수를 한 곳에 모음

**`src/api/client.js`** — 모든 API 호출의 기반이 되는 공통 함수

```js
import constants from '../constants.js';

const BASE_URL = constants.API_BASE_URL;

/**
 * 공통 fetch 래퍼
 * - 모든 API 호출은 이 함수를 통해서 합니다.
 * - 인증 토큰이 있으면 자동으로 헤더에 추가합니다.
 */
export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // 토큰이 있으면 자동으로 Authorization 헤더 추가
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`HTTP 에러: ${res.status}`);
  }

  return res.json();
}
```

**`src/api/auth.js`** — 인증 관련 API만 모음

```js
import { request } from './client.js';

export async function login(username, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function signup(userData) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getProfile() {
  return request('/me/profile');
}
```

**`src/api/accommodation.js`** — 숙소 관련 API만 모음

```js
import { request } from './client.js';

export async function fetchAccommodations(params) {
  const query = new URLSearchParams(params).toString();
  return request(`/accommodations?${query}`);
}

export async function fetchAccommodationById(id) {
  return request(`/accommodations/${id}`);
}
```

**사용하는 쪽 (login/index.js)**

```js
// Before: fetch 코드가 20줄
// After: 한 줄!
import { login } from '../src/api/auth.js';

const result = await login(username, password);
```

---

### 기준 2: 유효성 검사를 분리한다

**왜?** 로그인과 회원가입에서 같은 정규표현식을 복붙하고 있습니다.
나중에 비밀번호 규칙이 바뀌면 두 곳 다 고쳐야 합니다 (그리고 한 곳을 빼먹기 쉽습니다).

#### Before — 같은 정규표현식이 두 파일에 중복

```js
// login/index.js
const regId = /^[a-z0-9_]{4,20}$/;
const regPw = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

// signup/index.js (복붙!)
const regId = /^[a-z0-9_]{4,20}$/;
const regPw = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
const regNm = /^(?=.*\S).{1,50}$/;
const regPn = /^010-\d{4}-\d{4}$/;
```

#### After — `src/utils/validate.js` 로 추출

```js
// src/utils/validate.js

/** 아이디: 4~20자, 영소문자/숫자/밑줄 */
export function isValidUsername(value) {
  return /^[a-z0-9_]{4,20}$/.test(value);
}

/** 비밀번호: 8자 이상, 영문+숫자 최소 1개씩 */
export function isValidPassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
}

/** 이름: 1~50자, 공백만으로 구성되지 않음 */
export function isValidName(value) {
  return /^(?=.*\S).{1,50}$/.test(value);
}

/** 전화번호: 010-XXXX-XXXX */
export function isValidPhone(value) {
  return /^010-\d{4}-\d{4}$/.test(value);
}
```

**사용하는 쪽 (login/index.js)**

```js
import { isValidUsername, isValidPassword } from '../src/utils/validate.js';

if (!isValidUsername(loginData.username)) {
  result1.textContent = '아이디를 입력해주세요.';
  return;
}
```

> 함수 이름(`isValidUsername`)이 정규표현식(`/^[a-z0-9_]{4,20}$/`)보다 읽기 쉽습니다.
> 코드를 읽는 사람이 정규표현식을 해석할 필요 없이 "아, 사용자명 유효성 검사구나" 하고 바로 이해할 수 있습니다.

---

### 기준 3: 인증(토큰) 관리를 분리한다

**왜?** `localStorage.getItem('accessToken')`이 프로젝트 곳곳에 퍼져 있습니다.
나중에 토큰 저장 방식을 바꾸면 (예: 쿠키로 변경) 수십 곳을 고쳐야 합니다.

#### Before — 흩어진 토큰 관리

```js
// login/index.js
localStorage.setItem('accessToken', token);

// main.js
const token = localStorage.getItem('accessToken');

// landing.js
Authorization: `Bearer ${localStorage.getItem('accessToken')}`,

// RoomCard.js
Authorization: `Bearer ${localStorage.getItem('accessToken')}`,

// profile/profile.js
localStorage.removeItem('accessToken');
```

#### After — `src/utils/auth.js` 로 추출

```js
// src/utils/auth.js

const TOKEN_KEY = 'accessToken';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}
```

**사용하는 쪽**

```js
import { setToken } from '../src/utils/auth.js';

// 로그인 성공 시
setToken(data.data.accessToken);
```

> **장점:** 나중에 토큰을 `sessionStorage`나 쿠키로 바꾸고 싶다면
> `src/utils/auth.js` **한 파일만** 수정하면 됩니다.

---

### 기준 4: 페이지 JS는 "조립"만 한다

각 페이지의 `index.js`는 다른 모듈을 **가져다 조립하는 역할**만 해야 합니다.
직접 API를 호출하거나, 유효성 검사 로직을 가지고 있으면 안 됩니다.

#### Before — login/index.js가 모든 것을 직접 처리 (80줄)

```js
// login/index.js — 유효성 검사 + API 호출 + DOM 조작 + 에러 처리 전부

import constants from '../src/constants.js';
const API_BASE = constants.API_BASE_URL;

const regId = /^[a-z0-9_]{4,20}$/;           // 유효성 검사
const regPw = /^(?=.*[A-Za-z])(?=.*\d)...$/;  // 유효성 검사

loginbtn.addEventListener('click', async () => {
  // ...유효성 검사 20줄...
  // ...fetch 호출 15줄...
  // ...에러 처리 10줄...
  // ...DOM 업데이트 10줄...
});
```

#### After — login/index.js는 조립만 (30줄)

```js
// login/index.js — 각 모듈을 가져다 조립만 한다

import { login } from '../src/api/auth.js';
import { setToken } from '../src/utils/auth.js';
import { isValidUsername, isValidPassword } from '../src/utils/validate.js';

const loginBtn = document.getElementById('loginbtn');
const idInput = document.getElementById('loginId');
const pwInput = document.getElementById('loginPw');

loginBtn.addEventListener('click', async () => {
  const username = idInput.value.trim();
  const password = pwInput.value.trim();

  // 유효성 검사 (validate.js에서 가져옴)
  if (!isValidUsername(username)) {
    showError('result1', '아이디를 입력해주세요.');
    return;
  }
  if (!isValidPassword(password)) {
    showError('result2', '비밀번호를 입력해주세요.');
    return;
  }

  try {
    // API 호출 (api/auth.js에서 가져옴)
    const data = await login(username, password);
    // 토큰 저장 (utils/auth.js에서 가져옴)
    setToken(data.data.accessToken);
    alert('로그인되었습니다.');
    location.href = '../';
  } catch (e) {
    showError('result3', '아이디 또는 비밀번호를 다시 입력해주세요.');
  }
});

function showError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.style.color = 'red';
}
```

> **차이점이 보이시나요?**
> - `login()` — API 호출은 `api/auth.js`가 담당
> - `isValidUsername()` — 유효성 검사는 `utils/validate.js`가 담당
> - `setToken()` — 토큰 저장은 `utils/auth.js`가 담당
> - `index.js` — 이것들을 **조립**해서 페이지 동작을 만드는 것만 담당

---

## 5. 실전 리팩토링 예시 — Before & After

### 예시: RoomCard.js에서 API 호출 분리하기

현재 `RoomCard.js`는 위시리스트 하트를 클릭하면 **컴포넌트 내부에서 직접 fetch를 호출**합니다.
카드 컴포넌트가 API 통신까지 책임지고 있는 것입니다.

#### Before

```js
// src/RoomCard.js (현재 코드)
this.#wishNode.addEventListener('click', async (e) => {
  const res = await fetch(`${constants.API_BASE_URL}/me/wishlist`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    body: JSON.stringify({
      accommodationId: this.#id,
      isWishlisted: !this.#isWish,
    }),
  });
  const result = await res.json();
  // ...
});
```

#### After — API를 분리

```js
// src/api/wishlist.js (NEW)
import { request } from './client.js';

export async function toggleWishlist(accommodationId, isWishlisted) {
  return request('/me/wishlist', {
    method: 'PATCH',
    body: JSON.stringify({ accommodationId, isWishlisted }),
  });
}
```

```js
// src/RoomCard.js (수정 후)
import { toggleWishlist } from './api/wishlist.js';
import toast from './components/toast.js';

// 이벤트 핸들러가 훨씬 깔끔해집니다
this.#wishNode.addEventListener('click', async () => {
  try {
    const result = await toggleWishlist(this.#id, !this.#isWish);
    this.setWish(result.data.isWishlisted);
    toast.success('성공', result.message, 3);
  } catch {
    toast.warn('실패', '위시리스트에 추가하려면 로그인해야합니다.', 3);
  }
});
```

> **RoomCard는 "카드 UI"만 책임지고, API 통신은 `wishlist.js`가 책임집니다.**

---

## 6. 네이밍 컨벤션 정리

파일 이름만 보고 "이 파일이 뭘 하는지" 알 수 있어야 합니다.

### 폴더/파일 이름 규칙

| 종류 | 규칙 | 예시 |
|------|------|------|
| **폴더** | 소문자, 하이픈 구분 | `api/`, `utils/`, `components/` |
| **컴포넌트 파일** | camelCase | `header.js`, `toast.js`, `pagination.js` |
| **클래스 파일** | PascalCase | `RoomCard.js` (클래스를 export하는 파일) |
| **유틸리티 파일** | camelCase, 역할 이름 | `validate.js`, `format.js`, `auth.js` |
| **API 파일** | camelCase, 리소스 이름 | `accommodation.js`, `reservation.js` |
| **페이지 진입 파일** | `index.js` | 모든 페이지 폴더에서 동일하게 |

### 변수/함수 이름 규칙

| 종류 | 규칙 | 예시 |
|------|------|------|
| **일반 변수** | camelCase | `roomData`, `searchInput` |
| **DOM 요소** | camelCase + 요소 힌트 | `loginBtn`, `idInput`, `roomList` |
| **상수** | UPPER_SNAKE_CASE | `API_BASE_URL`, `TOKEN_KEY` |
| **함수 — 가져오기** | `fetch` + 명사 | `fetchAccommodations()` |
| **함수 — 검사** | `is` + 형용사 | `isValidUsername()`, `isLoggedIn()` |
| **함수 — UI 만들기** | `build` + 명사 | `buildHeader()`, `buildPagination()` |
| **함수 — 이벤트** | `handle` + 동사 | `handleClick()`, `handleSubmit()` |
| **클래스** | PascalCase | `RoomCard`, `Calendar` |

---

## 7. import/export 패턴 정리

### Named Export (이름 내보내기) — 여러 개를 내보낼 때

```js
// src/utils/validate.js
export function isValidUsername(value) { ... }
export function isValidPassword(value) { ... }

// 사용하는 쪽
import { isValidUsername, isValidPassword } from '../src/utils/validate.js';
```

**언제 쓰나요?**
- 한 파일에서 여러 함수를 내보낼 때
- `api/`, `utils/` 폴더의 파일들

### Default Export (기본 내보내기) — 한 가지를 내보낼 때

```js
// src/components/header.js
export default { buildHeader, buildSearchBar };

// 사용하는 쪽
import header from './components/header.js';
header.buildHeader();
```

**언제 쓰나요?**
- 파일이 하나의 컴포넌트나 클래스를 대표할 때
- `components/` 폴더의 파일들

### 우리 프로젝트의 규칙 제안

| 폴더 | export 방식 | 이유 |
|------|-------------|------|
| `api/` | Named Export | 여러 API 함수를 리소스별로 묶으므로 |
| `utils/` | Named Export | 여러 유틸 함수를 역할별로 묶으므로 |
| `components/` | Default Export | 하나의 컴포넌트 객체를 내보내므로 |
| 클래스 파일 | Named Export | `export class RoomCard` — 명시적이므로 |

---

## 8. 체크리스트 — 새 파일을 만들 때

새로운 JS 파일을 만들기 전에 아래 질문들을 확인하세요.

### 파일을 만들기 전

- [ ] 이미 비슷한 기능의 파일이 있지는 않은가?
- [ ] 기존 파일에 추가하는 게 더 자연스럽지 않은가?
- [ ] 이 코드는 다른 곳에서도 재사용할 수 있는가?

### 파일 위치 결정

```
"이 코드는..." → 넣을 곳
─────────────────────────────────────────
서버와 통신한다         → src/api/○○○.js
순수 계산/변환이다      → src/utils/○○○.js
재사용 가능한 UI다      → src/components/○○○.js
이 페이지에서만 쓴다    → 해당페이지/index.js 안에
```

### 파일을 만든 후

- [ ] 파일 이름이 역할을 잘 설명하는가?
- [ ] 한 파일에 한 가지 역할만 있는가?
- [ ] export 방식이 일관적인가? (api/utils → Named, components → Default)
- [ ] 다른 파일에서 쉽게 import해서 쓸 수 있는가?

---

## 정리 — 핵심 3줄 요약

1. **한 파일 = 한 역할.** API, 유효성 검사, 토큰 관리, DOM 조작을 한 파일에 섞지 않는다.
2. **중복은 추출한다.** 같은 코드가 2곳 이상에 있으면 `utils/` 또는 `api/`로 빼낸다.
3. **페이지 JS는 조립만.** 각 모듈을 import해서 연결하는 것이 페이지 파일의 역할이다.

> 이 가이드를 따라 하나씩 리팩토링하면 됩니다.
> 한 번에 다 바꿀 필요 없이, **새로 작성하는 코드부터** 이 규칙을 적용해 보세요!
