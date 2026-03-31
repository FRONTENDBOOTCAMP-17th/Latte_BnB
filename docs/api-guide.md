# Latte BnB API 사용 가이드

> 작성: FullStackFamily 강사
> API 문서 페이지: https://www.fullstackfamily.com/lattebnb/api-docs

---

## 1. 개요

Latte BnB 프론트엔드 프로젝트를 위한 **백엔드 REST API**가 준비되어 있습니다.
별도의 백엔드 개발 없이, 아래 API를 호출하여 프론트엔드를 구현할 수 있습니다.

### Base URL

```
https://api.fullstackfamily.com/api/lattebnb/v1
```

### 인터랙티브 API 문서

아래 페이지에서 각 API를 직접 호출해보고 응답을 확인할 수 있습니다.

**https://www.fullstackfamily.com/lattebnb/api-docs**

---

## 2. 빠른 시작

### Step 1: 회원가입

```bash
curl -X POST https://api.fullstackfamily.com/api/lattebnb/v1/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "myname",
    "password": "MyPass123!",
    "name": "김철수",
    "phone": "01012345678"
  }'
```

**username 규칙**: 4~20자, 영문 소문자 + 숫자 + 밑줄(`_`)만 허용
**password 규칙**: 8~50자, 영문 + 숫자 모두 포함

### Step 2: 로그인

```bash
curl -X POST https://api.fullstackfamily.com/api/lattebnb/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "myname",
    "password": "MyPass123!"
  }'
```

응답:
```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "accessToken": "eyJhbGciOiJIUz...",
    "user": {
      "id": 1,
      "username": "myname",
      "name": "김철수"
    }
  }
}
```

### Step 3: 토큰으로 인증 필요한 API 호출

`accessToken`을 `Authorization` 헤더에 넣어서 호출합니다.

```bash
curl -X GET https://api.fullstackfamily.com/api/lattebnb/v1/me/profile \
  -H 'Authorization: Bearer eyJhbGciOiJIUz...'
```

### JavaScript (fetch) 예시

```javascript
// 회원가입
const signupRes = await fetch('https://api.fullstackfamily.com/api/lattebnb/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myname',
    password: 'MyPass123!',
    name: '김철수',
    phone: '01012345678'
  })
});
const signupData = await signupRes.json();

// 로그인
const loginRes = await fetch('https://api.fullstackfamily.com/api/lattebnb/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myname',
    password: 'MyPass123!'
  })
});
const loginData = await loginRes.json();
const token = loginData.data.accessToken;

// 인증 필요한 API 호출
const profileRes = await fetch('https://api.fullstackfamily.com/api/lattebnb/v1/me/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const profileData = await profileRes.json();
```

---

## 3. 테스트 계정

빠른 테스트를 위해 미리 생성된 계정이 있습니다.

| 아이디 | 비밀번호 | 권한 | 용도 |
|--------|----------|------|------|
| `admin` | `Admin1234!` | 관리자 | 숙소 등록/수정/삭제 (관리자 API) |
| `testuser` | `Test1234!` | 일반 | 위시리스트, 예약, 프로필 |
| `latte` | `Latte1234!` | 일반 | 위시리스트, 예약, 프로필 |

> 직접 회원가입하여 본인 계정을 사용하는 것을 권장합니다.

---

## 4. API 목록

### 4.1 인증 (Auth)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| POST | `/auth/signup` | X | 회원가입 |
| POST | `/auth/login` | X | 로그인 → accessToken 발급 |
| POST | `/auth/logout` | O | 로그아웃 |

### 4.2 숙소 (Accommodations)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/accommodations` | X | 숙소 목록 (검색, 정렬, 페이지네이션) |
| GET | `/accommodations/{id}` | X | 숙소 상세 (이미지, 가격, 차단일정 포함) |

**목록 조회 파라미터:**

| 파라미터 | 기본값 | 설명 |
|----------|--------|------|
| `page` | 1 | 페이지 번호 (1부터) |
| `pageLimit` | 20 | 한 페이지 항목 수 (최대 20) |
| `query` | - | 검색어 (숙소명, 지역) |
| `sort` | `dictAsc` | `dictAsc`, `dictDesc`, `priceAsc`, `priceDesc` |

### 4.3 위시리스트 (Wishlist)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/me/wishlist` | O | 내 위시리스트 목록 |
| POST | `/me/wishlist/check` | O | 숙소 ID 배열로 찜 여부 확인 |
| PATCH | `/me/wishlist` | O | 찜 추가/해제 토글 |

### 4.4 예약 (Reservations)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/accommodations/{id}/reservation-context` | O | 예약 페이지용 숙소 정보 |
| POST | `/reservations` | O | 예약 생성 |
| GET | `/me/reservations` | O | 내 예약 목록 |
| GET | `/reservations/{id}` | O | 예약 상세 |
| PATCH | `/reservations/{id}/cancel` | O | 예약 취소 |

### 4.5 프로필 (Profile)

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/me/profile` | O | 내 프로필 조회 |
| POST | `/me/withdraw` | O | 회원 탈퇴 |

### 4.6 관리자 (Admin)

> admin 계정으로 로그인한 토큰만 사용 가능

| Method | Endpoint | 인증 | 설명 |
|--------|----------|------|------|
| GET | `/admin/accommodations` | Admin | 관리자 숙소 목록 |
| GET | `/admin/accommodations/{id}` | Admin | 관리자 숙소 상세 |
| POST | `/admin/accommodations` | Admin | 숙소 등록 |
| PATCH | `/admin/accommodations/{id}` | Admin | 숙소 수정 |
| DELETE | `/admin/accommodations/{id}` | Admin | 숙소 삭제 |

---

## 5. 응답 형식

### 성공 응답

```json
{
  "success": true,
  "message": "요청 성공 메시지",
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "pageLimit": 20,
      "totalItems": 25,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "에러 메시지 (한글)",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      { "field": "username", "reason": "4~20자의 영문 소문자, 숫자, 밑줄만 허용됩니다." }
    ]
  }
}
```

### 에러 코드

| 코드 | HTTP | 설명 |
|------|------|------|
| `VALIDATION_ERROR` | 400 | 입력값 검증 실패 |
| `INVALID_CREDENTIALS` | 401 | 로그인 실패 |
| `UNAUTHORIZED` | 401 | 토큰 없음/만료 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `DUPLICATE_USERNAME` | 409 | 중복 아이디 |
| `DATE_CONFLICT` | 409 | 예약 날짜 충돌 |
| `MAX_GUEST_EXCEEDED` | 400 | 최대 인원 초과 |
| `INVALID_DATE_RANGE` | 400 | 날짜 범위 오류 |
| `ALREADY_CANCELLED` | 409 | 이미 취소된 예약 |
| `PASSWORD_MISMATCH` | 400 | 비밀번호 불일치 (탈퇴 시) |

---

## 6. 주요 사용 패턴

### 6.1 숙소 목록 + 찜 상태 표시

```javascript
// 1. 숙소 목록 조회 (비로그인도 가능)
const listRes = await fetch(`${BASE_URL}/accommodations?page=1&sort=priceAsc`);
const listData = await listRes.json();
const accommodations = listData.data.accommodations;

// 2. 로그인 상태면 찜 여부 확인
if (token) {
  const ids = accommodations.map(a => a.id);
  const checkRes = await fetch(`${BASE_URL}/me/wishlist/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ accommodationIds: ids })
  });
  const checkData = await checkRes.json();
  const wishlisted = checkData.data.wishlistedAccommodationIds; // [102, 104]
}
```

### 6.2 예약 생성 플로우

```javascript
// 1. 예약 컨텍스트 조회 (가격, 차단 날짜 확인)
const ctxRes = await fetch(`${BASE_URL}/accommodations/1/reservation-context`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const ctx = await ctxRes.json();
// ctx.data.pricing.adultPrice, ctx.data.bookingPolicy.blockedDates 등

// 2. 예약 생성
const reserveRes = await fetch(`${BASE_URL}/reservations`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    accommodation: { id: 1 },
    schedule: { checkInDate: '2026-05-10', checkOutDate: '2026-05-12' },
    guestCount: { adults: 2, children: 1 },
    pricingSnapshot: { adultSubtotal: 256000, childSubtotal: 64000, totalPrice: 345000 },
    agreeToTerms: true
  })
});
```

### 6.3 찜 토글

```javascript
// 찜 추가
await fetch(`${BASE_URL}/me/wishlist`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    accommodation: { id: 1 },
    isWishlisted: true
  })
});

// 찜 해제
await fetch(`${BASE_URL}/me/wishlist`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    accommodation: { id: 1 },
    isWishlisted: false
  })
});
```

---

## 7. CORS 허용 Origin

아래 주소에서 API를 호출할 수 있습니다.

- `http://localhost:5500` (Live Server 기본)
- `http://localhost:5502` (Live Server 대체)
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (Next.js 등)
- `http://127.0.0.1` 위 포트들도 동일하게 허용

---

## 8. 참고 사항

- **토큰 유효기간**: 24시간 (만료 시 다시 로그인)
- **금액**: 모든 금액은 정수(원 단위). 프론트에서 `toLocaleString()` 등으로 포맷팅
- **날짜**: 숙박 날짜는 `YYYY-MM-DD` 형식
- **시간**: `createdAt` 등 시간 필드는 `YYYY-MM-DDTHH:mm:ssZ` 형식
- **페이지네이션**: `page`는 1부터 시작, `pageLimit` 최대 20
- **Seed 데이터**: 서버 시작 시 숙소 25건이 자동 등록됩니다
