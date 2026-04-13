# Latte BnB 프로필 API 변경 안내

## 변경 요약

1. **GET /me/profile 응답 구조 변경** — `data.user`로 래핑 + `role`, `createdAt`, `bio`, `region` 필드 추가
2. **PATCH /me/profile 신규** — 자기소개(bio)와 거주 지역(region) 수정 엔드포인트

---

## 1. GET /me/profile — 프로필 조회

### 변경된 응답 구조

**Before** (이전):
```json
{ "data": { "id": 23, "username": "hello", ... } }
```

**After** (현재):
```json
{ "data": { "user": { "id": 23, "username": "hello", "role": "USER", "createdAt": "...", "bio": "...", "region": "서울", ... } } }
```

### JavaScript 코드

```js
const token = localStorage.getItem("lbnb-token");

const response = await fetch(
  "https://api.fullstackfamily.com/api/lattebnb/v1/me/profile",
  {
    headers: {
      Authorization: "Bearer " + token,
    },
  }
);

const result = await response.json();

if (result.success) {
  const user = result.data.user;  // ← data.user 안에 있습니다!

  console.log("이름:", user.name);
  console.log("역할:", user.role);       // "USER" 또는 "ADMIN"
  console.log("가입일:", user.createdAt); // "2026-03-31T00:00:00"
  console.log("자기소개:", user.bio);     // null이면 아직 미설정
  console.log("지역:", user.region);      // null이면 아직 미설정
}
```

### 응답 예시 (200)

```json
{
  "success": true,
  "message": "프로필 조회에 성공했습니다.",
  "data": {
    "user": {
      "id": 23,
      "username": "hello1234",
      "name": "hjb",
      "phone": "010-1234-5678",
      "avatarUrl": "https://api.fullstackfamily.com/images/lattebnb/default-avatar.png",
      "role": "USER",
      "createdAt": "2026-03-31T00:00:00",
      "bio": "여행을 좋아하는 개발자입니다",
      "region": "서울"
    }
  }
}
```

> `bio`와 `region`은 설정하지 않았으면 응답에 포함되지 않습니다 (null 필드 자동 제외).

---

## 2. PATCH /me/profile — 프로필 수정 (신규!)

자기소개와 거주 지역을 수정합니다. **바꾸고 싶은 필드만 보내면 됩니다.**

### 요청 (Request)

```
PATCH /api/lattebnb/v1/me/profile
Authorization: Bearer {token}
Content-Type: application/json
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| bio | string | 선택 | 자기소개 (최대 200자). 빈 문자열 `""`을 보내면 삭제됩니다 |
| region | string | 선택 | 거주 지역 (아래 목록 중 하나) |

### region 허용 값

```
서울, 경기, 인천, 강원, 충남, 충북, 대전, 세종,
경남, 경북, 대구, 울산, 부산, 전남, 전북, 광주, 제주
```

### JavaScript 코드

```js
const token = localStorage.getItem("lbnb-token");

// bio와 region 함께 수정
const response = await fetch(
  "https://api.fullstackfamily.com/api/lattebnb/v1/me/profile",
  {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({
      bio: "여행을 좋아하는 개발자입니다",
      region: "서울",
    }),
  }
);

const result = await response.json();

if (result.success) {
  const user = result.data.user;
  console.log("자기소개:", user.bio);
  console.log("지역:", user.region);
}
```

### 응답 예시 (200)

```json
{
  "success": true,
  "message": "프로필이 수정되었습니다.",
  "data": {
    "user": {
      "id": 23,
      "username": "hello1234",
      "name": "hjb",
      "phone": "010-1234-5678",
      "avatarUrl": "https://api.fullstackfamily.com/images/lattebnb/default-avatar.png",
      "role": "USER",
      "createdAt": "2026-03-31T00:00:00",
      "bio": "여행을 좋아하는 개발자입니다",
      "region": "서울"
    }
  }
}
```

### bio 삭제하기

빈 문자열을 보내면 bio가 삭제(null)됩니다.

```js
await fetch("https://api.fullstackfamily.com/api/lattebnb/v1/me/profile", {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  },
  body: JSON.stringify({ bio: "" }),  // bio가 null로 삭제됨
});
```

### 에러 응답

| 상황 | 코드 | 메시지 |
|------|------|--------|
| bio 200자 초과 | 400 | 자기소개는 200자를 초과할 수 없습니다. |
| 잘못된 region 값 | 400 | 유효하지 않은 지역입니다. |
| 인증 없음 | 401 | 인증 토큰이 필요합니다. |

---

## API 문서 페이지

https://www.fullstackfamily.com/lattebnb/api-docs

위 페이지에서 직접 API를 호출하고 응답을 확인할 수 있습니다.
