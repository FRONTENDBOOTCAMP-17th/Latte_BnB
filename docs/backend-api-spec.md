# Latte BnB 백엔드 API 명세서

## 1. 문서 목적

본 문서는 [prototype-Implementation-process.md](/e:/projects/Latte_BnB/docs/prototype-Implementation-process.md)를 기준으로, Latte BnB 프로토타입 구현에 필요한 백엔드 API 명세를 정의한다.

목표는 다음과 같다.

- 백엔드 개발자가 바로 구현 가능한 수준으로 엔드포인트, 요청 바디, 응답 구조, 상태 코드, 검증 규칙을 정리한다.
- Vite + Tailwind CSS + Vanilla JS 환경에서 전역 상태관리 라이브러리 없이도 UI를 안정적으로 갱신할 수 있도록 응답 구조를 통일한다.
- 전체 화면 재조회 대신 수정된 부분만 업데이트하는 프론트엔드 전략에 맞춰, 조회 응답과 변경 응답의 역할을 구분한다.

---

## 2. 전제 조건

### 2.1 프로젝트 범위

- 숙소 목록 조회 / 검색 / 정렬 / 페이지네이션
- 숙소 상세 조회
- 회원가입 / 로그인 / 로그아웃
- 위시리스트 조회 / 추가 / 삭제
- 예약 요청 페이지용 숙소 정보 조회
- 예약 생성
- 내 예약 목록 조회
- 예약 상세 조회
- 예약 취소
- 내 프로필 조회
- 회원 탈퇴

### 2.2 제외 범위

- 소셜 로그인
- 예약 draft 생성 / 수정
- 실제 결제 연동
- 전화번호 인증 문자 발송
- 무한 스크롤
- 프로필 수정 기능

### 2.3 API 요약 표

| Method | API URL | Authorization 여부 | Request Body | API 요약 |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/signup` | 아니오 | `username`, `password`, `name`, `phone` | 일반 회원가입 |
| `POST` | `/api/v1/auth/login` | 아니오 | `username`, `password` | 로그인 및 토큰 발급 |
| `POST` | `/api/v1/auth/logout` | 예 | `-` | 로그아웃 처리 |
| `GET` | `/api/v1/listings?page={page}&pageSize={pageSize}&query={query}&sort={sort}` | 아니오 | `-` | 숙소 목록 조회, 검색, 정렬, 페이지네이션 |
| `GET` | `/api/v1/listings/{listingId}` | 아니오 | `-` | 숙소 상세 조회 |
| `GET` | `/api/v1/me/wishlist?page={page}&pageSize={pageSize}` | 예 | `-` | 위시리스트 목록 조회 |
| `POST` | `/api/v1/me/wishlist` | 예 | `listingId` | 찜 추가 |
| `DELETE` | `/api/v1/me/wishlist/{listingId}` | 예 | `-` | 찜 해제 |
| `GET` | `/api/v1/listings/{listingId}/reservation-context` | 예 | `-` | 예약 요청 페이지 진입용 숙소/요금 정보 조회 |
| `POST` | `/api/v1/reservations` | 예 | `listingId`, `checkInDate`, `checkOutDate`, `guests`, `agreeToTerms` | 예약 생성 및 확정 |
| `GET` | `/api/v1/me/reservations?page={page}&pageSize={pageSize}&status={status}` | 예 | `-` | 내 예약 목록 조회 |
| `GET` | `/api/v1/reservations/{reservationId}` | 예 | `-` | 예약 상세 조회 |
| `PATCH` | `/api/v1/reservations/{reservationId}/cancel` | 예 | `reason` | 예약 취소 |
| `GET` | `/api/v1/me/profile` | 예 | `-` | 내 프로필 조회 |
| `DELETE` | `/api/v1/me` | 예 | `password` | 회원 탈퇴 |

---

## 3. API 설계 원칙

### 3.1 Base URL

```txt
/api/v1
```

### 3.2 인증 방식

- 인증이 필요한 API는 `Authorization: Bearer {accessToken}` 헤더를 사용한다.
- 로그인 성공 시 `accessToken`, `refreshToken`을 발급한다.
- 프로토타입 단계에서는 refresh 재발급 API를 필수 범위에서 제외해도 되지만, 토큰 필드 자체는 응답에 포함하는 것을 권장한다.

### 3.3 Content-Type

```txt
Content-Type: application/json; charset=utf-8
```

### 3.4 날짜 / 시간 규칙

- 숙박 날짜는 `YYYY-MM-DD` 문자열을 사용한다.
- 상세 시간 표시는 ISO 8601 UTC 문자열을 사용한다.
- 예시:

```json
{
  "checkInDate": "2026-04-10",
  "checkOutDate": "2026-04-12",
  "cancelledAt": "2026-04-01T03:20:15Z"
}
```

### 3.5 금액 규칙

- 금액은 정수형 원화 기준으로 전달한다.
- 프론트는 문자열 포맷팅만 담당하고, 백엔드는 계산 가능한 숫자를 반환한다.
- 청소비(`cleaningFee`)는 사용하지 않는다.
- 예약 금액은 성인과 어린이의 1박 요금을 분리해서 계산한다.

```json
{
  "adultPricePerNight": 128000,
  "childPricePerNight": 64000,
  "serviceFee": 17000,
  "totalPrice": 657000,
  "currency": "KRW"
}
```

### 3.6 페이지네이션 규칙

- 기본 `pageSize`는 20
- `page`는 1부터 시작
- 응답은 항상 `pagination` 메타를 포함

### 3.7 부분 업데이트 친화적 응답 규칙

상태관리 라이브러리를 사용하지 않고, 변경된 DOM 영역만 갱신할 예정이므로 아래 원칙을 따른다.

1. 같은 UI 블록은 어느 API에서든 동일한 스키마를 사용한다.
2. 변경 API는 전체 페이지 데이터가 아니라, 바뀐 리소스와 관련 요약 정보만 돌려준다.
3. 응답에는 선택적으로 `updated` 필드를 두고, 프론트가 부분 렌더링할 수 있는 블록 단위 데이터를 제공한다.

권장 구조:

```json
{
  "success": true,
  "message": "찜이 추가되었습니다.",
  "data": {
    "listingId": "lst_101",
    "isWishlisted": true
  },
  "updated": {
    "listingCard": {
      "id": "lst_101",
      "isWishlisted": true,
      "wishlistCount": 123
    },
    "wishlistSummary": {
      "totalCount": 8
    }
  }
}
```

### 3.8 공통 응답 포맷

#### 성공 응답

```json
{
  "success": true,
  "message": "요청이 성공했습니다.",
  "data": {},
  "meta": {}
}
```

#### 실패 응답

```json
{
  "success": false,
  "message": "유효하지 않은 요청입니다.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "checkOutDate",
        "reason": "체크아웃 날짜는 체크인 날짜 이후여야 합니다."
      }
    ]
  }
}
```

---

## 4. 공통 데이터 스키마

응답 일관성을 위해 아래 UI 단위 스키마를 재사용한다.

### 4.1 ListingCard

랜딩 페이지, 검색 결과, 위시리스트에서 공통 사용한다.
카드에는 성인 1인 1박 기준 가격만 노출한다.

```json
{
  "id": "lst_101",
  "title": "성수 브릭하우스",
  "location": "서울 성동구",
  "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
  "rating": 4.91,
  "reviewCount": 128,
  "adultPricePerNight": 128000,
  "currency": "KRW",
  "isWishlisted": true,
  "hostName": "민준"
}
```

### 4.2 ListingDetail

숙소 상세 페이지에서 사용한다.

```json
{
  "id": "lst_101",
  "title": "성수 브릭하우스",
  "location": {
    "region": "서울 성동구",
    "address": "서울특별시 성동구 연무장길 00"
  },
  "images": [
    "https://cdn.lattebnb.com/listings/lst_101/1.jpg",
    "https://cdn.lattebnb.com/listings/lst_101/2.jpg"
  ],
  "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
  "amenities": ["와이파이", "주방", "세탁기", "에어컨"],
  "host": {
    "name": "민준",
    "avatarUrl": "https://cdn.lattebnb.com/hosts/host_33.jpg"
  },
  "rating": 4.91,
  "reviewCount": 128,
  "price": {
    "adultPricePerNight": 128000,
    "childPricePerNight": 64000,
    "serviceFee": 17000,
    "currency": "KRW"
  },
  "isWishlisted": false
}
```

### 4.3 ReservationRequestContext

예약 요청 페이지 최초 진입 시 사용한다.

```json
{
  "listing": {
    "id": "lst_101",
    "title": "성수 브릭하우스",
    "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
    "location": "서울 성동구",
    "hostName": "민준"
  },
  "pricing": {
    "adultPricePerNight": 128000,
    "childPricePerNight": 64000,
    "serviceFee": 17000,
    "currency": "KRW"
  },
  "bookingPolicy": {
    "minNights": 1,
    "blockedDates": ["2026-04-15", "2026-04-16"]
  }
}
```

### 4.4 ReservationCard

내 예약 목록에서 사용한다.

```json
{
  "id": "res_9001",
  "listingId": "lst_101",
  "listingTitle": "성수 브릭하우스",
  "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
  "checkInDate": "2026-04-10",
  "checkOutDate": "2026-04-12",
  "guestCount": {
    "adults": 2,
    "children": 1,
    "total": 3
  },
  "status": "CONFIRMED",
  "totalPrice": 657000,
  "currency": "KRW",
  "isWishlisted": true
}
```

### 4.5 ReservationDetail

예약 상세 페이지에서 사용한다.

```json
{
  "id": "res_9001",
  "status": "CONFIRMED",
  "listing": {
    "id": "lst_101",
    "title": "성수 브릭하우스",
    "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
    "hostName": "민준"
  },
  "schedule": {
    "checkInDate": "2026-04-10",
    "checkOutDate": "2026-04-12",
    "checkInTime": "15:00",
    "checkOutTime": "11:00",
    "nights": 2
  },
  "guestCount": {
    "adults": 2,
    "children": 1,
    "total": 3
  },
  "price": {
    "adultPricePerNight": 128000,
    "childPricePerNight": 64000,
    "adultSubtotal": 512000,
    "childSubtotal": 128000,
    "serviceFee": 17000,
    "totalPrice": 657000,
    "currency": "KRW"
  },
  "statusInfo": {
    "daysUntilCheckIn": 14,
    "hoursUntilCheckIn": 336,
    "canCancel": true
  },
  "createdAt": "2026-03-27T11:00:00Z",
  "cancelledAt": null
}
```

### 4.6 UserProfile

```json
{
  "id": "usr_1",
  "username": "latte_user",
  "name": "홍길동",
  "phone": "010-2345-6789",
  "avatarUrl": "https://cdn.lattebnb.com/users/default-avatar.png"
}
```

---

## 5. 상태값 정의

### 5.1 예약 상태

| 값 | 설명 |
| --- | --- |
| `CONFIRMED` | 예약 확정 |
| `CANCELLED` | 예약 취소 |

### 5.2 정렬 값

| 값 | 설명 |
| --- | --- |
| `recommended` | 기본 정렬 |
| `priceAsc` | 가격 오름차순 |
| `priceDesc` | 가격 내림차순 |
| `ratingDesc` | 평점 높은순 |

### 5.3 에러 코드

| 코드 | 설명 |
| --- | --- |
| `VALIDATION_ERROR` | 요청값 검증 실패 |
| `UNAUTHORIZED` | 인증 실패 |
| `FORBIDDEN` | 권한 없음 |
| `NOT_FOUND` | 리소스를 찾을 수 없음 |
| `DUPLICATE_RESOURCE` | 중복 데이터 |
| `BOOKING_UNAVAILABLE` | 예약 불가 날짜 또는 조건 충돌 |
| `CONFLICT` | 상태 충돌 |
| `INTERNAL_SERVER_ERROR` | 서버 오류 |

---

## 6. 인증 API

### 6.1 회원가입

`POST /api/v1/auth/signup`

#### Request Body

```json
{
  "username": "latte_user",
  "password": "Latte1234!",
  "name": "홍길동",
  "phone": "01023456789"
}
```

#### Validation

- `username`: 4~20자, 영문 소문자/숫자/밑줄 허용
- `password`: 8~20자, 영문/숫자/특수문자 조합
- `name`: 1~20자
- `phone`: 숫자만 저장, 응답에서는 하이픈 포맷 허용

#### Response 201

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "id": "usr_1",
      "username": "latte_user",
      "name": "홍길동",
      "phone": "010-2345-6789"
    }
  }
}
```

### 6.2 로그인

`POST /api/v1/auth/login`

#### Request Body

```json
{
  "username": "latte_user",
  "password": "Latte1234!"
}
```

#### Response 200

```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "accessToken": "access-token-example",
    "refreshToken": "refresh-token-example",
    "user": {
      "id": "usr_1",
      "username": "latte_user",
      "name": "홍길동",
      "phone": "010-2345-6789",
      "avatarUrl": "https://cdn.lattebnb.com/users/default-avatar.png"
    }
  }
}
```

#### Response 401

```json
{
  "success": false,
  "message": "아이디 또는 비밀번호를 다시 입력해주세요.",
  "error": {
    "code": "UNAUTHORIZED"
  }
}
```

### 6.3 로그아웃

`POST /api/v1/auth/logout`

#### Request Body

```json
{}
```

#### Response 200

```json
{
  "success": true,
  "message": "로그아웃되었습니다.",
  "data": {}
}
```

---

## 7. 숙소 API

### 7.1 숙소 목록 조회

`GET /api/v1/listings?page=1&pageSize=20&query=성수&sort=recommended`

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `page` | number | 아니오 | 기본값 1 |
| `pageSize` | number | 아니오 | 기본값 20, 최대 20 권장 |
| `query` | string | 아니오 | 숙소 이름 또는 지역 포함 검색 |
| `sort` | string | 아니오 | `recommended`, `priceAsc`, `priceDesc`, `ratingDesc` |

#### Response 200

```json
{
  "success": true,
  "message": "숙소 목록 조회에 성공했습니다.",
  "data": {
    "items": [
      {
        "id": "lst_101",
        "title": "성수 브릭하우스",
        "location": "서울 성동구",
        "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
        "rating": 4.91,
        "reviewCount": 128,
        "adultPricePerNight": 128000,
        "currency": "KRW",
        "isWishlisted": false,
        "hostName": "민준"
      },
      {
        "id": "lst_102",
        "title": "성수 루프탑 스테이",
        "location": "서울 성동구",
        "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_102/thumb.jpg",
        "rating": 4.87,
        "reviewCount": 94,
        "adultPricePerNight": 146000,
        "currency": "KRW",
        "isWishlisted": true,
        "hostName": "수아"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 87,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "query": "성수",
      "sort": "recommended"
    }
  }
}
```

### 7.2 숙소 상세 조회

`GET /api/v1/listings/{listingId}`

#### Response 200

```json
{
  "success": true,
  "message": "숙소 상세 조회에 성공했습니다.",
  "data": {
    "listing": {
      "id": "lst_101",
      "title": "성수 브릭하우스",
      "location": {
        "region": "서울 성동구",
        "address": "서울특별시 성동구 연무장길 00"
      },
      "images": [
        "https://cdn.lattebnb.com/listings/lst_101/1.jpg",
        "https://cdn.lattebnb.com/listings/lst_101/2.jpg",
        "https://cdn.lattebnb.com/listings/lst_101/3.jpg"
      ],
      "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
      "amenities": ["와이파이", "주방", "세탁기", "에어컨"],
      "host": {
        "name": "민준",
        "avatarUrl": "https://cdn.lattebnb.com/hosts/host_33.jpg"
      },
      "rating": 4.91,
      "reviewCount": 128,
      "price": {
        "adultPricePerNight": 128000,
        "childPricePerNight": 64000,
        "serviceFee": 17000,
        "currency": "KRW"
      },
      "isWishlisted": false
    }
  }
}
```

---

## 8. 위시리스트 API

### 8.1 위시리스트 목록 조회

`GET /api/v1/me/wishlist?page=1&pageSize=20`

#### Response 200

```json
{
  "success": true,
  "message": "위시리스트 조회에 성공했습니다.",
  "data": {
    "items": [
      {
        "id": "lst_102",
        "title": "성수 루프탑 스테이",
        "location": "서울 성동구",
        "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_102/thumb.jpg",
        "rating": 4.87,
        "reviewCount": 94,
        "adultPricePerNight": 146000,
        "currency": "KRW",
        "isWishlisted": true,
        "hostName": "수아"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 8,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    },
    "summary": {
      "totalCount": 8
    }
  }
}
```

### 8.2 찜 추가

`POST /api/v1/me/wishlist`

#### Request Body

```json
{
  "listingId": "lst_101"
}
```

#### Response 200

부분 업데이트를 위해 전체 위시리스트 목록이 아니라, 변경된 카드와 요약 정보만 내려준다.

```json
{
  "success": true,
  "message": "찜이 추가되었습니다.",
  "data": {
    "listingId": "lst_101",
    "isWishlisted": true
  },
  "updated": {
    "listingCard": {
      "id": "lst_101",
      "title": "성수 브릭하우스",
      "location": "서울 성동구",
      "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
      "rating": 4.91,
      "reviewCount": 128,
      "adultPricePerNight": 128000,
      "currency": "KRW",
      "isWishlisted": true,
      "hostName": "민준"
    },
    "wishlistSummary": {
      "totalCount": 9
    }
  }
}
```

### 8.3 찜 삭제

`DELETE /api/v1/me/wishlist/{listingId}`

#### Response 200

```json
{
  "success": true,
  "message": "찜이 해제되었습니다.",
  "data": {
    "listingId": "lst_101",
    "isWishlisted": false
  },
  "updated": {
    "listingCard": {
      "id": "lst_101",
      "isWishlisted": false
    },
    "wishlistSummary": {
      "totalCount": 8
    },
    "removedFrom": ["wishlistPage"]
  }
}
```

`removedFrom`은 위시리스트 페이지에서 해당 카드를 DOM에서 제거해야 함을 의미한다.

---

## 9. 예약 API

### 9.1 예약 요청 페이지용 숙소 정보 조회

`GET /api/v1/listings/{listingId}/reservation-context`

#### Response 200

```json
{
  "success": true,
  "message": "예약 요청 페이지 정보를 조회했습니다.",
  "data": {
    "listing": {
      "id": "lst_101",
      "title": "성수 브릭하우스",
      "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
      "location": "서울 성동구",
      "hostName": "민준"
    },
    "pricing": {
      "adultPricePerNight": 128000,
      "childPricePerNight": 64000,
      "serviceFee": 17000,
      "currency": "KRW"
    },
    "bookingPolicy": {
      "minNights": 1,
      "blockedDates": ["2026-04-15", "2026-04-16"]
    }
  }
}
```

### 9.2 예약 생성

`POST /api/v1/reservations`

#### Request Body

```json
{
  "listingId": "lst_101",
  "checkInDate": "2026-04-10",
  "checkOutDate": "2026-04-12",
  "guests": {
    "adults": 2,
    "children": 1
  },
  "agreeToTerms": true
}
```

#### Validation

- `listingId`: 필수
- `checkInDate`: 오늘 이후 날짜만 허용
- `checkOutDate`: `checkInDate` 이후 날짜만 허용
- `guests.adults`: 1 이상
- `guests.children`: 0 이상
- `agreeToTerms`: `true`여야 함

참고:

- 총 결제 금액은 `adultPricePerNight * adults * nights + childPricePerNight * children * nights + serviceFee` 규칙으로 계산한다.

#### Response 201

생성 직후 예약 상세 페이지로 이동할 수 있도록 `reservationId`와 `reservationDetail`을 함께 반환한다.

```json
{
  "success": true,
  "message": "예약이 완료되었습니다.",
  "data": {
    "reservationId": "res_9001",
    "reservation": {
      "id": "res_9001",
      "status": "CONFIRMED",
      "listing": {
        "id": "lst_101",
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
        "hostName": "민준"
      },
      "schedule": {
        "checkInDate": "2026-04-10",
        "checkOutDate": "2026-04-12",
        "checkInTime": "15:00",
        "checkOutTime": "11:00",
        "nights": 2
      },
      "guestCount": {
        "adults": 2,
        "children": 1,
        "total": 3
      },
      "price": {
        "adultPricePerNight": 128000,
        "childPricePerNight": 64000,
        "adultSubtotal": 512000,
        "childSubtotal": 128000,
        "serviceFee": 17000,
        "totalPrice": 657000,
        "currency": "KRW"
      },
      "statusInfo": {
        "daysUntilCheckIn": 14,
        "hoursUntilCheckIn": 336,
        "canCancel": true
      },
      "createdAt": "2026-03-27T11:00:00Z",
      "cancelledAt": null
    }
  },
  "updated": {
    "reservationCard": {
      "id": "res_9001",
      "listingId": "lst_101",
      "listingTitle": "성수 브릭하우스",
      "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
      "checkInDate": "2026-04-10",
      "checkOutDate": "2026-04-12",
      "guestCount": {
        "adults": 2,
        "children": 1,
        "total": 3
      },
      "status": "CONFIRMED",
      "totalPrice": 657000,
      "currency": "KRW",
      "isWishlisted": false
    }
  }
}
```

#### Response 409

```json
{
  "success": false,
  "message": "선택한 날짜에는 예약할 수 없습니다.",
  "error": {
    "code": "BOOKING_UNAVAILABLE",
    "details": [
      {
        "field": "checkInDate",
        "reason": "해당 기간에 이미 예약이 존재합니다."
      }
    ]
  }
}
```

### 9.3 내 예약 목록 조회

`GET /api/v1/me/reservations?page=1&pageSize=20&status=CONFIRMED`

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `page` | number | 아니오 | 기본값 1 |
| `pageSize` | number | 아니오 | 기본값 20 |
| `status` | string | 아니오 | `CONFIRMED`, `CANCELLED` |

#### Response 200

```json
{
  "success": true,
  "message": "내 예약 목록 조회에 성공했습니다.",
  "data": {
    "items": [
      {
        "id": "res_9001",
        "listingId": "lst_101",
        "listingTitle": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
        "checkInDate": "2026-04-10",
        "checkOutDate": "2026-04-12",
        "guestCount": {
          "adults": 2,
          "children": 1,
          "total": 3
        },
        "status": "CONFIRMED",
        "totalPrice": 657000,
        "currency": "KRW",
        "isWishlisted": true
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalItems": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 9.4 예약 상세 조회

`GET /api/v1/reservations/{reservationId}`

#### Response 200

```json
{
  "success": true,
  "message": "예약 상세 조회에 성공했습니다.",
  "data": {
    "reservation": {
      "id": "res_9001",
      "status": "CONFIRMED",
      "listing": {
        "id": "lst_101",
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/listings/lst_101/thumb.jpg",
        "hostName": "민준"
      },
      "schedule": {
        "checkInDate": "2026-04-10",
        "checkOutDate": "2026-04-12",
        "checkInTime": "15:00",
        "checkOutTime": "11:00",
        "nights": 2
      },
      "guestCount": {
        "adults": 2,
        "children": 1,
        "total": 3
      },
      "price": {
        "adultPricePerNight": 128000,
        "childPricePerNight": 64000,
        "adultSubtotal": 512000,
        "childSubtotal": 128000,
        "serviceFee": 17000,
        "totalPrice": 657000,
        "currency": "KRW"
      },
      "statusInfo": {
        "daysUntilCheckIn": 14,
        "hoursUntilCheckIn": 336,
        "canCancel": true
      },
      "createdAt": "2026-03-27T11:00:00Z",
      "cancelledAt": null
    }
  }
}
```

### 9.5 예약 취소

`PATCH /api/v1/reservations/{reservationId}/cancel`

#### Request Body

```json
{
  "reason": "일정 변경"
}
```

#### Response 200

예약 상세 페이지와 내 예약 목록의 일부 카드만 갱신할 수 있도록 응답한다.

```json
{
  "success": true,
  "message": "예약이 취소되었습니다.",
  "data": {
    "reservationId": "res_9001",
    "status": "CANCELLED"
  },
  "updated": {
    "reservationDetail": {
      "id": "res_9001",
      "status": "CANCELLED",
      "statusInfo": {
        "daysUntilCheckIn": 14,
        "hoursUntilCheckIn": 336,
        "canCancel": false
      },
      "cancelledAt": "2026-04-01T03:20:15Z"
    },
    "reservationCard": {
      "id": "res_9001",
      "status": "CANCELLED"
    }
  }
}
```

#### Response 409

```json
{
  "success": false,
  "message": "이미 취소된 예약입니다.",
  "error": {
    "code": "CONFLICT"
  }
}
```

---

## 10. 프로필 API

### 10.1 내 프로필 조회

`GET /api/v1/me/profile`

#### Response 200

```json
{
  "success": true,
  "message": "프로필 조회에 성공했습니다.",
  "data": {
    "profile": {
      "id": "usr_1",
      "username": "latte_user",
      "name": "홍길동",
      "phone": "010-2345-6789",
      "avatarUrl": "https://cdn.lattebnb.com/users/default-avatar.png"
    }
  }
}
```

### 10.2 회원 탈퇴

`DELETE /api/v1/me`

#### Request Body

```json
{
  "password": "Latte1234!"
}
```

#### Response 200

```json
{
  "success": true,
  "message": "회원 탈퇴가 완료되었습니다.",
  "data": {
    "deletedUserId": "usr_1"
  }
}
```

---

## 11. 프론트엔드 부분 업데이트 기준

이 프로젝트는 상태관리 라이브러리를 사용하지 않고, 페이지 전체를 다시 그리지 않으며, 수정된 DOM 조각만 갱신한다. 따라서 백엔드 응답은 아래 기준을 만족해야 한다.

### 11.1 목록 조회 응답

- `items`는 렌더링에 필요한 완결된 카드 단위 데이터여야 한다.
- 프론트가 추가 조회 없이 카드 렌더링을 끝낼 수 있어야 한다.
- 같은 카드 UI는 어느 목록이든 같은 필드명을 사용한다.

예:

- 숙소 카드: `ListingCard`
- 예약 카드: `ReservationCard`

### 11.2 변경 응답

- 변경 API는 `updated` 객체를 포함하는 것을 권장한다.
- `updated`에는 실제로 바뀐 UI 블록만 담는다.
- 백엔드는 전체 페이지 목록 재전송을 피한다.

예:

- 찜 추가/삭제: `listingCard`, `wishlistSummary`
- 예약 취소: `reservationDetail`, `reservationCard`
- 예약 생성: `reservation`, `reservationCard`

### 11.3 프론트엔드가 기대하는 최소 보장

백엔드는 아래를 보장해야 한다.

1. 동일 리소스는 API가 달라도 같은 키 이름을 유지한다.
2. 목록 카드에 필요한 필드는 축약하지 않는다.
3. 상태 변경 후 즉시 반영해야 하는 값은 mutation 응답에 포함한다.
4. 프론트가 "변경 후 다시 GET 요청"에 의존하지 않아도 되도록 설계한다.

예를 들어 찜 버튼 클릭 후 다음 값은 응답에 바로 있어야 한다.

- `listingId`
- `isWishlisted`
- 변경된 카드 데이터
- 위시리스트 전체 개수

---

## 12. 권장 HTTP 상태 코드

| 상태 코드 | 사용 상황 |
| --- | --- |
| `200 OK` | 일반 조회, 삭제, 수정 성공 |
| `201 Created` | 회원가입, 예약 생성 성공 |
| `400 Bad Request` | 형식 오류 |
| `401 Unauthorized` | 로그인 필요 또는 토큰 오류 |
| `403 Forbidden` | 본인 리소스 아님 |
| `404 Not Found` | 숙소/예약/유저 없음 |
| `409 Conflict` | 중복 가입, 예약 충돌, 이미 취소된 예약 |
| `422 Unprocessable Entity` | 도메인 검증 실패 |
| `500 Internal Server Error` | 서버 오류 |

---

## 13. 백엔드 구현 체크리스트

- 숙소 목록 API는 페이지네이션을 기본 지원해야 한다.
- 숙소 목록과 위시리스트 목록은 같은 `ListingCard` 스키마를 반환해야 한다.
- 숙소 상세 API와 예약 요청 컨텍스트 API는 책임을 분리해야 한다.
- 예약 API는 draft 없이 바로 생성되어야 한다.
- 예약 생성 성공 시 예약 상세 페이지 진입에 필요한 데이터가 즉시 반환되어야 한다.
- 찜/예약 취소 같은 변경 API는 전체 페이지 데이터가 아니라 변경 블록만 반환해야 한다.
- 인증 필요한 API는 일관된 `401` 응답 포맷을 사용해야 한다.

---

## 14. 최종 요약

- 랜딩은 `GET /listings` 중심의 카드 리스트 구조를 사용한다.
- 상세는 `GET /listings/{listingId}`로 분리한다.
- 예약은 draft 없이 `GET /listings/{listingId}/reservation-context` + `POST /reservations` 흐름으로 단순화한다.
- 위시리스트와 예약 취소 응답은 부분 렌더링을 위해 `updated` 블록을 포함한다.
- 카드형 UI가 많은 프로젝트이므로, 백엔드는 페이지별 응답이 아니라 "재사용 가능한 UI 데이터 단위"를 기준으로 스키마를 맞추는 것이 중요하다.
