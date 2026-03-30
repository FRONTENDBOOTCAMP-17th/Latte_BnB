# Latte BnB 백엔드 API 명세서

## 1. 문서 목적

본 문서는 [prototype-Implementation-process.md](/e:/projects/Latte_BnB/docs/prototype-Implementation-process.md)를 기준으로, Latte BnB 프로토타입 구현에 필요한 백엔드 API 명세를 정의한다.

---

## 2. 전제 조건

### 2.1 프로젝트 범위

- 숙소 목록 조회 / 검색 / 정렬 / 페이지네이션
- 숙소 상세 조회
- 회원가입 / 로그인 / 로그아웃
- 위시리스트 목록 조회
- 현재 페이지 숙소들의 위시리스트 상태 확인
- 찜 상태 변경
- 예약 요청 페이지용 숙소 정보 조회
- 예약 생성
- 내 예약 목록 조회
- 예약 상세 조회
- 예약 취소
- 내 프로필 조회
- 회원 탈퇴
- 관리자용 숙소 등록 / 조회 / 수정 / 삭제

### 2.2 API 요약 표

| Method | API URL | Authorization 여부 | Request Body | API 요약 |
| --- | --- | --- | --- | --- |
| `POST` | `/api/v1/auth/signup` | 아니오 | `username`, `password`, `name`, `phone` | 일반 회원가입 |
| `POST` | `/api/v1/auth/login` | 아니오 | `username`, `password` | 로그인 및 토큰 발급 |
| `POST` | `/api/v1/auth/logout` | 예 | `-` | 로그아웃 처리 |
| `GET` | `/api/v1/accommodations?page={page}&pageLimit={pageLimit}&query={query}&sort={sort}` | 아니오 | `-` | 숙소 목록 조회, 검색, 정렬, 페이지네이션 |
| `GET` | `/api/v1/accommodations/{id}` | 아니오 | `-` | 숙소 상세 조회 |
| `GET` | `/api/v1/me/wishlist?page={page}&pageLimit={pageLimit}` | 예 | `-` | 위시리스트 목록 조회 |
| `POST` | `/api/v1/me/wishlist/check` | 예 | `accommodationIds[]` | 현재 페이지 숙소들의 찜 여부 확인 |
| `PATCH` | `/api/v1/me/wishlist` | 예 | `accommodation.id`, `isWishlisted` | 찜 추가/삭제 통합 |
| `GET` | `/api/v1/accommodations/{id}/reservation-context` | 예 | `-` | 예약 요청 페이지 진입용 숙소/요금 정보 조회 |
| `POST` | `/api/v1/reservations` | 예 | `accommodation.id`, `schedule`, `guestCount`, `agreeToTerms` | 예약 생성 및 확정 |
| `GET` | `/api/v1/me/reservations?page={page}&pageLimit={pageLimit}&status={status}` | 예 | `-` | 내 예약 목록 조회 |
| `GET` | `/api/v1/reservations/{id}` | 예 | `-` | 예약 상세 조회 |
| `PATCH` | `/api/v1/reservations/{id}/cancel` | 예 | `reason` | 예약 취소 |
| `GET` | `/api/v1/me/profile` | 예 | `-` | 내 프로필 조회 |
| `DELETE` | `/api/v1/me` | 예 | `password` | 회원 탈퇴 |
| `GET` | `/api/v1/admin/accommodations?page={page}&pageLimit={pageLimit}&query={query}` | 예(Admin) | `-` | 관리자 숙소 목록 조회 |
| `GET` | `/api/v1/admin/accommodations/{id}` | 예(Admin) | `-` | 관리자 숙소 단건 조회 |
| `POST` | `/api/v1/admin/accommodations` | 예(Admin) | 숙소 등록 필드 | 관리자 숙소 등록 |
| `PATCH` | `/api/v1/admin/accommodations/{id}` | 예(Admin) | 수정할 숙소 필드 | 관리자 숙소 수정 |
| `DELETE` | `/api/v1/admin/accommodations/{id}` | 예(Admin) | `-` | 관리자 숙소 삭제 |

---

## 3. API 설계 원칙

### 3.1 Base URL

```txt
/api/v1
```

### 3.2 인증 방식

- 인증이 필요한 API는 `Authorization: Bearer {accessToken}` 헤더를 사용한다.
- 로그인 성공 시 `accessToken`, `refreshToken`을 발급한다.
- 관리자 API는 일반 인증 외에 관리자 권한 검증이 추가되어야 한다.

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
- 예약 금액은 성인과 어린이의 1박 요금을 분리해서 계산한다.
- 필드명은 `adultPrice`, `childPrice`, `serviceFee`, `totalPrice`로 통일한다.

```json
{
  "adultPrice": 128000,
  "childPrice": 64000,
  "serviceFee": 17000,
  "totalPrice": 657000,
  "currency": "KRW"
}
```

### 3.6 페이지네이션 규칙

- 기본 `pageLimit`은 20이다.
- `page`는 1부터 시작한다.
- 응답은 항상 `pagination` 메타를 포함한다.
- 현재 프로토타입에서는 `pageLimit` 최대값을 20으로 제한한다.

### 3.7 정렬 규칙

| 값 | 설명 | 기본값 여부 |
| --- | --- | --- |
| `dictAsc` | 사전 오름차순 | 기본값 |
| `dictDesc` | 사전 내림차순 |  |
| `priceAsc` | 가격 오름차순 |  |
| `priceDesc` | 가격 내림차순 |  |

### 3.8 ID 및 키 네이밍 규칙

- 모든 리소스 ID는 숫자형 `id`를 사용한다.
- `listingId`, `reservationId`처럼 리소스명을 중복한 필드는 사용하지 않는다.
- 관계가 필요한 경우 리소스 객체로 감싼다.
- 예시:

```json
{
  "accommodation": {
    "id": 101,
    "title": "성수 브릭하우스"
  },
  "reservation": {
    "id": 9001
  }
}
```

### 3.11 예약 가능 날짜 규칙

- `bookingPolicy.blockedDates`는 오늘 이후 날짜 중 선택 불가한 기간 목록이다.
- 프론트가 연속 구간을 효율적으로 처리할 수 있도록 각 원소는 `startDate`, `endDate`, `reason`을 가진다.
- 하루만 막힌 경우에도 `startDate`와 `endDate`를 같은 날짜로 표현한다.
- `reason`은 다음 둘 중 하나다.
  - `RESERVATION`: 이미 다른 사용자의 예약이 존재함
  - `HOST_BLOCK`: 숙소 주인이 직접 차단한 날짜임

### 3.12 부분 업데이트 친화적 응답 규칙

상태관리 라이브러리를 사용하지 않고, 변경된 DOM 영역만 갱신할 예정이므로 아래 원칙을 따른다.

1. 같은 UI 블록은 어느 API에서든 동일한 스키마를 사용한다.
2. 변경 API는 전체 페이지 데이터가 아니라, 바뀐 리소스와 관련 요약 정보만 돌려준다.
3. 응답에는 선택적으로 `updated` 필드를 두고, 프론트가 부분 렌더링할 수 있는 블록 단위 데이터를 제공한다.

권장 구조:

```json
{
  "success": true,
  "message": "찜 상태가 변경되었습니다.",
  "data": {
    "accommodation": {
      "id": 101
    },
    "isWishlisted": true
  },
  "updated": {
    "wishlistStatus": {
      "id": 101,
      "isWishlisted": true
    },
    "wishlistSummary": {
      "totalCount": 8
    }
  }
}
```

### 3.13 공통 응답 포맷

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
        "field": "schedule.checkOutDate",
        "reason": "체크아웃 날짜는 체크인 날짜 이후여야 합니다."
      }
    ]
  }
}
```

---

## 4. 공통 데이터 스키마

### 4.1 AccommodationCard

랜딩 페이지, 검색 결과, 위시리스트, 관리자 목록에서 공통 사용한다.

```json
{
  "id": 101,
  "title": "성수 브릭하우스",
  "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
  "location": "서울 성동구",
  "maxGuest": 4,
  "pricing": {
    "adultPrice": 128000,
    "childPrice": 64000,
    "currency": "KRW"
  }
}
```

### 4.2 AccommodationDetail

숙소 상세 페이지와 관리자 단건 조회에서 사용한다.

```json
{
  "id": 101,
  "title": "성수 브릭하우스",
  "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
  "location": {
    "region": "서울 성동구",
    "address": "서울특별시 성동구 연무장길 00"
  },
  "maxGuest": 4,
  "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
  "images": [
    {
      "url": "https://cdn.lattebnb.com/accommodations/101/1.jpg",
      "title": "거실",
      "description": "채광이 좋은 메인 공간"
    },
    {
      "url": "https://cdn.lattebnb.com/accommodations/101/2.jpg",
      "title": "침실",
      "description": "퀸사이즈 침대 1개"
    }
  ],
  "pricing": {
    "adultPrice": 128000,
    "childPrice": 64000,
    "serviceFee": 17000,
    "currency": "KRW"
  },
  "bookingPolicy": {
    "minNights": 1,
    "blockedDates": [
      {
        "startDate": "2026-04-15",
        "endDate": "2026-04-16",
        "reason": "RESERVATION"
      }
    ]
  }
}
```

### 4.3 ReservationRequestContext

예약 요청 페이지 최초 진입 시 사용한다.

```json
{
  "accommodation": {
    "id": 101,
    "title": "성수 브릭하우스",
    "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
    "location": "서울 성동구",
    "maxGuest": 4
  },
  "pricing": {
    "adultPrice": 128000,
    "childPrice": 64000,
    "serviceFee": 17000,
    "currency": "KRW"
  },
  "bookingPolicy": {
    "minNights": 1,
    "blockedDates": [
      {
        "startDate": "2026-04-15",
        "endDate": "2026-04-16",
        "reason": "RESERVATION"
      },
      {
        "startDate": "2026-04-21",
        "endDate": "2026-04-21",
        "reason": "HOST_BLOCK"
      }
    ]
  }
}
```

### 4.4 ReservationCard

내 예약 목록에서 사용한다.

```json
{
  "id": 9001,
  "accommodation": {
    "id": 101,
    "title": "성수 브릭하우스",
    "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
    "location": "서울 성동구"
  },
  "schedule": {
    "checkInDate": "2026-04-10",
    "checkOutDate": "2026-04-12",
    "nights": 2
  },
  "guestCount": {
    "adults": 2,
    "children": 1,
    "total": 3
  },
  "pricing": {
    "totalPrice": 657000,
    "currency": "KRW"
  },
  "status": "CONFIRMED"
}
```

### 4.5 ReservationDetail

예약 상세 페이지에서 사용한다.

```json
{
  "id": 9001,
  "status": "CONFIRMED",
  "accommodation": {
    "id": 101,
    "title": "성수 브릭하우스",
    "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
    "location": "서울 성동구"
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
  "pricing": {
    "adultPrice": 128000,
    "childPrice": 64000,
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

### 4.6 WishlistCheckResult

현재 페이지 숙소 목록 중 실제로 찜한 숙소 ID만 반환할 때 사용한다.

```json
{
  "wishlistedAccommodationIds": [102, 104]
}
```

### 4.7 UserProfile

```json
{
  "id": 1,
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

### 5.2 숙소 정렬 값

| 값 | 설명 |
| --- | --- |
| `dictAsc` | 사전 오름차순 |
| `dictDesc` | 사전 내림차순 |
| `priceAsc` | 가격 오름차순 |
| `priceDesc` | 가격 내림차순 |

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

#### Response 201

```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "user": {
      "id": 1,
      "username": "latte_user",
      "name": "홍길동",
      "phone": "010-2345-6789"
    }
  }
}
```

#### Response 409

```json
{
  "success": false,
  "message": "이미 사용 중인 아이디입니다.",
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "details": [
      {
        "field": "username",
        "reason": "이미 가입된 아이디입니다."
      }
    ]
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
      "id": 1,
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

`GET /api/v1/accommodations?page=1&pageLimit=20&query=성수&sort=dictAsc`

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `page` | number | 아니오 | 기본값 1 |
| `pageLimit` | number | 아니오 | 기본값 20, 최대 20 |
| `query` | string | 아니오 | 숙소 이름 또는 지역 포함 검색 |
| `sort` | string | 아니오 | 기본값 `dictAsc`, 허용값 `dictAsc`, `dictDesc`, `priceAsc`, `priceDesc` |

#### Response 200

```json
{
  "success": true,
  "message": "숙소 목록 조회에 성공했습니다.",
  "data": {
    "accommodations": [
      {
        "id": 101,
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
        "location": "서울 성동구",
        "maxGuest": 4,
        "pricing": {
          "adultPrice": 128000,
          "childPrice": 64000,
          "currency": "KRW"
        }
      },
      {
        "id": 102,
        "title": "성수 루프탑 스테이",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/102/thumb.jpg",
        "location": "서울 성동구",
        "maxGuest": 3,
        "pricing": {
          "adultPrice": 146000,
          "childPrice": 73000,
          "currency": "KRW"
        }
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageLimit": 20,
      "totalItems": 87,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "query": "성수",
      "sort": "dictAsc"
    }
  }
}
```

### 7.2 숙소 상세 조회

`GET /api/v1/accommodations/{id}`

#### Response 200

```json
{
  "success": true,
  "message": "숙소 상세 조회에 성공했습니다.",
  "data": {
    "accommodation": {
      "id": 101,
      "title": "성수 브릭하우스",
      "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
      "location": {
        "region": "서울 성동구",
        "address": "서울특별시 성동구 연무장길 00"
      },
      "maxGuest": 4,
      "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
      "images": [
        {
          "url": "https://cdn.lattebnb.com/accommodations/101/1.jpg",
          "title": "거실",
          "description": "채광이 좋은 메인 공간"
        },
        {
          "url": "https://cdn.lattebnb.com/accommodations/101/2.jpg",
          "title": "침실",
          "description": "퀸사이즈 침대 1개"
        }
      ],
      "pricing": {
        "adultPrice": 128000,
        "childPrice": 64000,
        "serviceFee": 17000,
        "currency": "KRW"
      },
      "bookingPolicy": {
        "minNights": 1,
        "blockedDates": [
          {
            "startDate": "2026-04-15",
            "endDate": "2026-04-16",
            "reason": "RESERVATION"
          }
        ]
      }
    }
  }
}
```

---

## 8. 위시리스트 API

### 8.1 위시리스트 목록 조회

`GET /api/v1/me/wishlist?page=1&pageLimit=20`

#### Response 200

```json
{
  "success": true,
  "message": "위시리스트 조회에 성공했습니다.",
  "data": {
    "accommodations": [
      {
        "id": 102,
        "title": "성수 루프탑 스테이",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/102/thumb.jpg",
        "location": "서울 성동구",
        "maxGuest": 3,
        "pricing": {
          "adultPrice": 146000,
          "childPrice": 73000,
          "currency": "KRW"
        }
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageLimit": 20,
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

### 8.2 현재 페이지 숙소 찜 여부 확인

`POST /api/v1/me/wishlist/check`

#### Request Body

```json
{
  "accommodationIds": [101, 102, 103, 104]
}
```

#### Response 200

```json
{
  "success": true,
  "message": "현재 페이지 숙소의 찜 상태 조회에 성공했습니다.",
  "data": {
    "wishlistedAccommodationIds": [102, 104]
  }
}
```

### 8.3 찜 추가/삭제 통합

`PATCH /api/v1/me/wishlist`

#### Request Body

```json
{
  "accommodation": {
    "id": 101
  },
  "isWishlisted": true
}
```

#### Response 200

```json
{
  "success": true,
  "message": "찜 상태가 변경되었습니다.",
  "data": {
    "accommodation": {
      "id": 101
    },
    "isWishlisted": true
  },
  "updated": {
    "wishlistStatus": {
      "id": 101,
      "isWishlisted": true
    },
    "wishlistSummary": {
      "totalCount": 9
    }
  }
}
```

#### 찜 해제 예시

```json
{
  "success": true,
  "message": "찜 상태가 변경되었습니다.",
  "data": {
    "accommodation": {
      "id": 101
    },
    "isWishlisted": false
  },
  "updated": {
    "wishlistStatus": {
      "id": 101,
      "isWishlisted": false
    },
    "wishlistSummary": {
      "totalCount": 8
    },
    "removedAccommodationIds": [101]
  }
}
```

`removedAccommodationIds`는 위시리스트 페이지에서 해당 카드를 DOM에서 제거해야 함을 의미한다.

---

## 9. 예약 API

### 9.1 예약 요청 페이지용 숙소 정보 조회

`GET /api/v1/accommodations/{id}/reservation-context`

#### Response 200

```json
{
  "success": true,
  "message": "예약 요청 페이지 정보를 조회했습니다.",
  "data": {
    "accommodation": {
      "id": 101,
      "title": "성수 브릭하우스",
      "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
      "location": "서울 성동구",
      "maxGuest": 4
    },
    "pricing": {
      "adultPrice": 128000,
      "childPrice": 64000,
      "serviceFee": 17000,
      "currency": "KRW"
    },
    "bookingPolicy": {
      "minNights": 1,
      "blockedDates": [
        {
          "startDate": "2026-04-15",
          "endDate": "2026-04-16",
          "reason": "RESERVATION"
        },
        {
          "startDate": "2026-04-21",
          "endDate": "2026-04-21",
          "reason": "HOST_BLOCK"
        }
      ]
    }
  }
}
```

### 9.2 예약 생성

`POST /api/v1/reservations`

#### Request Body

```json
{
  "accommodation": {
    "id": 101
  },
  "schedule": {
    "checkInDate": "2026-04-10",
    "checkOutDate": "2026-04-12"
  },
  "guestCount": {
    "adults": 2,
    "children": 1
  },
  "pricingSnapshot": {
    "adultTotalPrice": 512000,
    "childTotalPrice": 128000,
    "totalPrice": 657000
  },
  "agreeToTerms": true
}
```

#### Response 201

생성 직후 예약 상세 페이지로 이동할 수 있도록 예약 상세 정보를 함께 반환한다.

```json
{
  "success": true,
  "message": "예약이 완료되었습니다.",
  "data": {
    "reservation": {
      "id": 9001,
      "status": "CONFIRMED",
      "accommodation": {
        "id": 101,
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
        "location": "서울 성동구"
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
      "pricing": {
        "adultPrice": 128000,
        "childPrice": 64000,
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
      "id": 9001,
      "accommodation": {
        "id": 101,
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
        "location": "서울 성동구"
      },
      "schedule": {
        "checkInDate": "2026-04-10",
        "checkOutDate": "2026-04-12",
        "nights": 2
      },
      "guestCount": {
        "adults": 2,
        "children": 1,
        "total": 3
      },
      "pricing": {
        "totalPrice": 657000,
        "currency": "KRW"
      },
      "status": "CONFIRMED"
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
        "field": "schedule.checkInDate",
        "reason": "해당 기간에는 이미 예약 또는 차단 일정이 존재합니다."
      }
    ]
  }
}
```

### 9.3 내 예약 목록 조회

`GET /api/v1/me/reservations?page=1&pageLimit=20&status=CONFIRMED`

#### Query Params

| 이름 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `page` | number | 아니오 | 기본값 1 |
| `pageLimit` | number | 아니오 | 기본값 20 |
| `status` | string | 아니오 | `CONFIRMED`, `CANCELLED` |

#### Response 200

```json
{
  "success": true,
  "message": "내 예약 목록 조회에 성공했습니다.",
  "data": {
    "reservations": [
      {
        "id": 9001,
        "accommodation": {
          "id": 101,
          "title": "성수 브릭하우스",
          "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
          "location": "서울 성동구"
        },
        "schedule": {
          "checkInDate": "2026-04-10",
          "checkOutDate": "2026-04-12",
          "nights": 2
        },
        "guestCount": {
          "adults": 2,
          "children": 1,
          "total": 3
        },
        "pricing": {
          "totalPrice": 657000,
          "currency": "KRW"
        },
        "status": "CONFIRMED"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageLimit": 20,
      "totalItems": 3,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### 9.4 예약 상세 조회

`GET /api/v1/reservations/{id}`

#### Response 200

```json
{
  "success": true,
  "message": "예약 상세 조회에 성공했습니다.",
  "data": {
    "reservation": {
      "id": 9001,
      "status": "CONFIRMED",
      "accommodation": {
        "id": 101,
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
        "location": "서울 성동구"
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
      "pricing": {
        "adultPrice": 128000,
        "childPrice": 64000,
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

`PATCH /api/v1/reservations/{id}/cancel`

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
    "reservation": {
      "id": 9001,
      "status": "CANCELLED"
    }
  },
  "updated": {
    "reservationDetail": {
      "id": 9001,
      "status": "CANCELLED",
      "statusInfo": {
        "daysUntilCheckIn": 14,
        "hoursUntilCheckIn": 336,
        "canCancel": false
      },
      "cancelledAt": "2026-04-01T03:20:15Z"
    },
    "reservationCard": {
      "id": 9001,
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
      "id": 1,
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
    "deletedUserId": 1
  }
}
```

---

## 11. 관리자 숙소 API

### 11.1 관리자 숙소 목록 조회

`GET /api/v1/admin/accommodations?page=1&pageLimit=20&query=성수`

#### Response 200

```json
{
  "success": true,
  "message": "관리자 숙소 목록 조회에 성공했습니다.",
  "data": {
    "accommodations": [
      {
        "id": 101,
        "title": "성수 브릭하우스",
        "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
        "location": "서울 성동구",
        "maxGuest": 4,
        "pricing": {
          "adultPrice": 128000,
          "childPrice": 64000,
          "currency": "KRW"
        }
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "pageLimit": 20,
      "totalItems": 87,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 11.2 관리자 숙소 단건 조회

`GET /api/v1/admin/accommodations/{id}`

#### Response 200

```json
{
  "success": true,
  "message": "관리자 숙소 단건 조회에 성공했습니다.",
  "data": {
    "accommodation": {
      "id": 101,
      "title": "성수 브릭하우스",
      "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb.jpg",
      "location": {
        "region": "서울 성동구",
        "address": "서울특별시 성동구 연무장길 00"
      },
      "maxGuest": 4,
      "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
      "images": [
        {
          "url": "https://cdn.lattebnb.com/accommodations/101/1.jpg",
          "title": "거실",
          "description": "채광이 좋은 메인 공간"
        }
      ],
      "pricing": {
        "adultPrice": 128000,
        "childPrice": 64000,
        "serviceFee": 17000,
        "currency": "KRW"
      },
      "bookingPolicy": {
        "minNights": 1,
        "blockedDates": [
          {
            "startDate": "2026-04-15",
            "endDate": "2026-04-16",
            "reason": "RESERVATION"
          }
        ]
      }
    }
  }
}
```

### 11.3 관리자 숙소 등록

`POST /api/v1/admin/accommodations`

#### Request Body

```json
{
  "title": "성수 브릭하우스",
  "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/temp/thumb.jpg",
  "location": {
    "region": "서울 성동구",
    "address": "서울특별시 성동구 연무장길 00"
  },
  "maxGuest": 4,
  "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
  "images": [
    {
      "url": "https://cdn.lattebnb.com/accommodations/temp/1.jpg",
      "title": "거실",
      "description": "채광이 좋은 메인 공간"
    }
  ],
  "pricing": {
    "adultPrice": 128000,
    "childPrice": 64000,
    "serviceFee": 17000,
    "currency": "KRW"
  },
  "bookingPolicy": {
    "minNights": 1,
    "blockedDates": [
      {
        "startDate": "2026-04-15",
        "endDate": "2026-04-16",
        "reason": "RESERVATION"
      }
    ]
  }
}
```

#### Response 201

```json
{
  "success": true,
  "message": "숙소 등록이 완료되었습니다.",
  "data": {
    "accommodation": {
      "id": 201,
      "title": "성수 브릭하우스",
      "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/201/thumb.jpg",
      "location": {
        "region": "서울 성동구",
        "address": "서울특별시 성동구 연무장길 00"
      },
      "maxGuest": 4,
      "description": "감각적인 인테리어와 채광이 좋은 도심형 스테이",
      "images": [
        {
          "url": "https://cdn.lattebnb.com/accommodations/201/1.jpg",
          "title": "거실",
          "description": "채광이 좋은 메인 공간"
        }
      ],
      "pricing": {
        "adultPrice": 128000,
        "childPrice": 64000,
        "serviceFee": 17000,
        "currency": "KRW"
      },
      "bookingPolicy": {
        "minNights": 1,
        "blockedDates": [
          {
            "startDate": "2026-04-15",
            "endDate": "2026-04-16",
            "reason": "RESERVATION"
          }
        ]
      }
    }
  }
}
```

### 11.4 관리자 숙소 수정

`PATCH /api/v1/admin/accommodations/{id}`

#### Request Body

```json
{
  "title": "성수 브릭하우스 리뉴얼",
  "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb-renewal.jpg",
  "location": {
    "region": "서울 성동구",
    "address": "서울특별시 성동구 연무장길 00"
  },
  "maxGuest": 5,
  "description": "리뉴얼된 감각적인 도심형 스테이",
  "images": [
    {
      "url": "https://cdn.lattebnb.com/accommodations/101/1.jpg",
      "title": "거실",
      "description": "리뉴얼 후 메인 공간"
    }
  ],
  "pricing": {
    "adultPrice": 138000,
    "childPrice": 69000,
    "serviceFee": 17000,
    "currency": "KRW"
  },
  "bookingPolicy": {
    "minNights": 1,
    "blockedDates": [
      {
        "startDate": "2026-04-15",
        "endDate": "2026-04-16",
        "reason": "RESERVATION"
      },
      {
        "startDate": "2026-04-21",
        "endDate": "2026-04-21",
        "reason": "HOST_BLOCK"
      }
    ]
  }
}
```

#### Response 200

```json
{
  "success": true,
  "message": "숙소 수정이 완료되었습니다.",
  "data": {
    "accommodation": {
      "id": 101
    }
  },
  "updated": {
    "accommodation": {
      "id": 101,
      "title": "성수 브릭하우스 리뉴얼",
      "thumbnailUrl": "https://cdn.lattebnb.com/accommodations/101/thumb-renewal.jpg",
      "location": {
        "region": "서울 성동구",
        "address": "서울특별시 성동구 연무장길 00"
      },
      "maxGuest": 5,
      "description": "리뉴얼된 감각적인 도심형 스테이",
      "images": [
        {
          "url": "https://cdn.lattebnb.com/accommodations/101/1.jpg",
          "title": "거실",
          "description": "리뉴얼 후 메인 공간"
        }
      ],
      "pricing": {
        "adultPrice": 138000,
        "childPrice": 69000,
        "serviceFee": 17000,
        "currency": "KRW"
      },
      "bookingPolicy": {
        "minNights": 1,
        "blockedDates": [
          {
            "startDate": "2026-04-15",
            "endDate": "2026-04-16",
            "reason": "RESERVATION"
          },
          {
            "startDate": "2026-04-21",
            "endDate": "2026-04-21",
            "reason": "HOST_BLOCK"
          }
        ]
      }
    }
  }
}
```

### 11.5 관리자 숙소 삭제

`DELETE /api/v1/admin/accommodations/{id}`

#### Response 200

```json
{
  "success": true,
  "message": "숙소 삭제가 완료되었습니다.",
  "data": {
    "accommodation": {
      "id": 101
    }
  }
}
```