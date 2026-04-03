# Latte_BnB API 수정 안내 (2026-04-03)

> 숙소 등록 500 에러 신고에 따른 수정 사항입니다.

---

## 수정 요약

| 문제 | 원인 | 수정 결과 |
|------|------|----------|
| 숙소 등록 시 500 에러 | flat JSON 미지원 (중첩 구조만 가능) | flat + 중첩 양쪽 지원 |
| 숙소 수정 시 500 에러 | 일부 필드만 보내면 나머지가 null로 덮어씌워짐 | 보내지 않은 필드는 기존 값 유지 (partial update) |
| 위시리스트 토글 시 500 에러 | flat JSON 미지원 + NPE | flat + 중첩 양쪽 지원 |

---

## 1. 숙소 등록/수정 — flat JSON 지원

이제 **두 가지 형태 모두 사용 가능**합니다.

### 방법 1: flat JSON (간단)

```javascript
await fetch("https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    title: "강남 럭셔리 스위트",
    thumbnailUrl: "https://images.unsplash.com/photo-1631049307264?w=400",
    region: "서울 강남구",
    address: "서울특별시 강남구 테헤란로 123",
    maxGuest: 6,
    description: "강남 중심가에 위치한 럭셔리 스위트룸입니다.",
    adultPrice: 200000,
    childPrice: 100000,
    serviceFee: 25000,
    minNights: 1,
    images: [
      { url: "https://example.com/room1.jpg", title: "거실", description: "넓은 거실" },
    ],
    blockedDates: [
      { startDate: "2026-05-01", endDate: "2026-05-05" },
    ],
  }),
});
```

### 방법 2: 중첩 JSON (기존 방식, 계속 지원)

```javascript
await fetch("https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    title: "강남 럭셔리 스위트",
    location: {
      region: "서울 강남구",
      address: "서울특별시 강남구 테헤란로 123",
    },
    maxGuest: 6,
    pricing: {
      adultPrice: 200000,
      childPrice: 100000,
      serviceFee: 25000,
    },
    bookingPolicy: {
      minNights: 1,
      blockedDates: [
        { startDate: "2026-05-01", endDate: "2026-05-05", reason: "HOST_BLOCK" },
      ],
    },
  }),
});
```

### flat 필드 → 중첩 필드 매핑

| flat 필드 | 중첩 필드 |
|-----------|----------|
| `region` | `location.region` |
| `address` | `location.address` |
| `adultPrice` | `pricing.adultPrice` |
| `childPrice` | `pricing.childPrice` |
| `serviceFee` | `pricing.serviceFee` |
| `currency` | `pricing.currency` |
| `minNights` | `bookingPolicy.minNights` |
| `blockedDates` | `bookingPolicy.blockedDates` |

> 중첩 필드가 있으면 중첩 필드가 우선됩니다.

---

## 2. 숙소 수정 — Partial Update

이제 **수정할 필드만 보내면** 됩니다. 보내지 않은 필드는 기존 값이 유지됩니다.

```javascript
// 제목과 가격만 수정 (나머지는 기존 값 유지)
await fetch(`https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations/${id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
  },
  body: JSON.stringify({
    title: "수정된 제목",
    adultPrice: 150000,
  }),
});
```

---

## 3. 위시리스트 토글 — flat JSON 지원

두 가지 형태 모두 사용 가능합니다.

### flat 형태 (간단)

```javascript
await fetch("https://api.fullstackfamily.com/api/lattebnb/v1/me/wishlist", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    accommodationId: 13,
    wishlisted: true,
  }),
});
```

### 중첩 형태 (기존 방식)

```javascript
await fetch("https://api.fullstackfamily.com/api/lattebnb/v1/me/wishlist", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    accommodation: { id: 13 },
    isWishlisted: true,
  }),
});
```

---

## 4. 전체 API 엔드포인트 정리

> Base URL: `https://api.fullstackfamily.com/api/lattebnb/v1`

### 인증 (Auth)

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| POST | `/auth/signup` | X | 회원가입 |
| POST | `/auth/login` | X | 로그인 |
| POST | `/auth/logout` | O | 로그아웃 |

### 프로필 (Profile)

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| GET | `/me/profile` | O | 내 프로필 조회 |
| POST | `/me/withdraw` | O | 회원 탈퇴 |

### 숙소 (Accommodations)

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| GET | `/accommodations?page=&pageLimit=&query=&sort=` | X | 숙소 목록 |
| GET | `/accommodations/{id}` | X | 숙소 상세 |

### 위시리스트 (Wishlist)

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| GET | `/me/wishlist?page=&pageLimit=` | O | 위시리스트 조회 |
| POST | `/me/wishlist/check` | O | 찜 여부 일괄 확인 |
| PATCH | `/me/wishlist` | O | 찜 토글 (추가/삭제) |

### 예약 (Reservations)

| Method | URL | 인증 | 설명 |
|--------|-----|------|------|
| GET | `/accommodations/{id}/reservation-context` | O | 예약 컨텍스트 |
| POST | `/reservations` | O | 예약 생성 |
| GET | `/me/reservations?page=&pageLimit=&status=` | O | 내 예약 목록 |
| GET | `/reservations/{id}` | O | 예약 상세 |
| PATCH | `/reservations/{id}/cancel` | O | 예약 취소 |

### 관리자 (Admin, ADMIN 권한 필요)

| Method | URL | 설명 |
|--------|-----|------|
| POST | `/admin/accommodations/images` | 이미지 업로드 |
| GET | `/admin/accommodations?page=&pageLimit=&query=` | 숙소 목록 |
| GET | `/admin/accommodations/{id}` | 숙소 상세 |
| POST | `/admin/accommodations` | 숙소 등록 |
| PATCH | `/admin/accommodations/{id}` | 숙소 수정 |
| DELETE | `/admin/accommodations/{id}` | 숙소 삭제 |

---

## 5. 테스트 결과 (2026-04-03)

| # | API | 결과 |
|---|-----|------|
| 1 | 회원가입 | PASS (201) |
| 2 | 로그인 | PASS (200) |
| 3 | 로그인 실패 | PASS (401) |
| 4 | 로그아웃 | PASS (200) |
| 5 | 프로필 조회 | PASS (200) |
| 6 | 숙소 목록 | PASS (200) |
| 7 | 숙소 상세 | PASS (200) |
| 8 | 위시 추가 | PASS (200) |
| 9 | 위시리스트 조회 | PASS (200) |
| 10 | 위시 체크 | PASS (200) |
| 11 | 위시 해제 | PASS (200) |
| 12 | 예약 컨텍스트 | PASS (200) |
| 13 | 예약 목록 | PASS (200) |
| 14 | 관리자-숙소 목록 | PASS (200) |
| 15 | 숙소 등록 (flat) | PASS (201) |
| 16 | 숙소 등록 (중첩) | PASS (201) |
| 17 | 숙소 수정 (partial) | PASS (200) |
| 18 | 이미지 업로드 | PASS (201) |
| 19 | 회원 탈퇴 | PASS (200) |

**결과: 19/19 PASS**

---

## 테스트 계정

| username | password | 역할 |
|----------|----------|------|
| testuser | Test1234! | 일반 사용자 |
| latte | Latte1234! | 일반 사용자 |
| admin | Admin1234! | 관리자 |

---

## API 문서 페이지

온라인 API 문서: https://www.fullstackfamily.com/lattebnb/api-docs
