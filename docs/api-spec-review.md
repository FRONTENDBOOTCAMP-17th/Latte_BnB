# Latte BnB API 명세서 리뷰

> 원본: [backend-api-spec.md](./backend-api-spec.md)
> 리뷰어: FullStackFamily 강사
> 실제 구현 API 문서: https://www.fullstackfamily.com/lattebnb/api-docs

---

## 개요

`backend-api-spec.md`를 기반으로 실제 백엔드 API를 구현했습니다.
구현 과정에서 발견된 문제점과 변경 사항을 정리합니다.

**잘 된 점:**
- API 설계 원칙(Base URL, 페이지네이션, 정렬, 금액 규칙 등)이 체계적으로 정리됨
- 공통 데이터 스키마(AccommodationCard, ReservationDetail 등)를 정의하여 일관성 확보
- `updated` 필드로 부분 업데이트 패턴을 고려한 것은 바닐라 JS 환경에서 좋은 설계
- 에러 응답 포맷이 `field` + `reason` 구조로 프론트에서 처리하기 편함

---

## 1. 수정된 항목

### 1.1 refreshToken 제거

| 항목 | 원본 명세서 | 실제 구현 |
|------|------------|----------|
| 로그인 응답 | `accessToken` + `refreshToken` | `accessToken`만 |

**이유**: 토큰 갱신 API(`POST /auth/refresh`)가 정의되지 않아 refreshToken의 존재 의미가 없습니다. 교육용 프로토타입이므로 accessToken만 발급하고, 만료 시 재로그인하는 방식이 적합합니다.

### 1.2 회원 탈퇴 엔드포인트 변경

| 항목 | 원본 명세서 | 실제 구현 |
|------|------------|----------|
| 회원 탈퇴 | `DELETE /api/v1/me` (Body에 password) | `POST /api/lattebnb/v1/me/withdraw` |

**이유**: 일부 HTTP 클라이언트(특히 `fetch`)에서 `DELETE` 요청에 Body를 포함하면 무시되거나 에러가 발생할 수 있습니다. `POST`로 변경하여 호환성을 확보했습니다.

### 1.3 Base URL 변경

| 항목 | 원본 명세서 | 실제 구현 |
|------|------------|----------|
| Base URL | `/api/v1` | `/api/lattebnb/v1` |

**이유**: FullStackFamily 서버에서 다른 API와 네임스페이스가 충돌하지 않도록 `/lattebnb` 접두어를 추가했습니다.

### 1.4 가격 필드명 통일

| 항목 | 원본 명세서 | 실제 구현 |
|------|------------|----------|
| 예약 생성 요청 | `pricingSnapshot.adultTotalPrice` | `pricingSnapshot.adultSubtotal` |
| 예약 생성 요청 | `pricingSnapshot.childTotalPrice` | `pricingSnapshot.childSubtotal` |

**이유**: 예약 상세 응답에서는 `adultSubtotal`, `childSubtotal`을 사용하는데, 요청에서만 다른 이름(`adultTotalPrice`)을 사용하면 혼란스럽습니다. 요청/응답 모두 같은 이름으로 통일했습니다.

---

## 2. 명세서의 문제점

### 2.1 문서 구조

| # | 문제 | 설명 |
|---|------|------|
| 1 | 섹션 번호 누락 | 3.8 → 3.11로 점프 (3.9, 3.10 없음) |
| 2 | 관리자 생성 방법 미정의 | admin 계정을 어떻게 만드는지 설명 없음 |

**해결**: Seed 데이터로 관리자 계정(`admin`/`Admin1234!`)을 미리 생성해두었습니다.

### 2.2 로그아웃 처리 모호

명세서에서 로그아웃의 Request Body가 `{}`(빈 객체)이고, 서버에서 무엇을 하는지 정의되지 않았습니다.

JWT는 서버에 세션이 없으므로, **서버는 200 응답만 반환**합니다.
실제 로그아웃은 프론트엔드에서 localStorage의 토큰을 삭제하면 됩니다.

```javascript
// 프론트엔드 로그아웃 처리
localStorage.removeItem('accessToken');
// 서버 호출은 선택 사항
await fetch(`${BASE_URL}/auth/logout`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### 2.3 유효성 검증 규칙 누락

명세서에 입력값 검증 규칙이 대부분 빠져있습니다. 실제 구현에서 추가한 규칙:

| 필드 | 규칙 |
|------|------|
| `username` | 4~20자, 영문 소문자 + 숫자 + `_` |
| `password` | 8~50자, 영문 + 숫자 모두 포함 필수 |
| `name` | 1~50자, 필수 |
| `phone` | 선택, 숫자만 10~11자리 (서버에서 하이픈 자동 포맷팅) |
| `checkInDate` | 오늘+1일 이후 |
| `checkOutDate` | 체크인 이후 |
| `nights` | 최대 30박 |
| `adults` | 1명 이상 |
| `adults + children` | 숙소 maxGuest 이하 |

### 2.4 serviceFee 계산 로직 미정의

명세서에서 `serviceFee: 17000`이 어떤 기준으로 결정되는지 설명이 없습니다.

**실제 구현**: 숙소별 고정 금액으로 DB에 저장되어 있습니다.
관리자가 숙소 등록/수정 시 직접 설정합니다.

### 2.5 예약 금액 계산 공식 미명시

명세서에 예시만 있고 공식이 없어서 혼란 가능성이 있습니다.

**실제 계산 공식:**
```
adultSubtotal = adultPrice × nights × adults
childSubtotal = childPrice × nights × children
totalPrice = adultSubtotal + childSubtotal + serviceFee
```

예시 검증:
```
adultPrice=128,000, adults=2, nights=2
→ adultSubtotal = 128,000 × 2 × 2 = 512,000 ✓

childPrice=64,000, children=1, nights=2
→ childSubtotal = 64,000 × 2 × 1 = 128,000 ✓

serviceFee = 17,000
→ totalPrice = 512,000 + 128,000 + 17,000 = 657,000 ✓
```

### 2.6 location 필드 이중 타입

같은 `location` 필드인데 API에 따라 타입이 다릅니다:

- **목록**: `"location": "서울 성동구"` (문자열)
- **상세**: `"location": { "region": "서울 성동구", "address": "서울특별시..." }` (객체)

이 설계는 의도적입니다. 프론트에서 API별로 타입을 구분해서 처리해야 합니다.

```javascript
// 목록 카드
<p>{accommodation.location}</p>

// 상세 페이지
<p>{accommodation.location.region}</p>
<p>{accommodation.location.address}</p>
```

---

## 3. 보완 사항

### 3.1 예약 가능 날짜 확인

숙소 상세 조회 응답의 `bookingPolicy.blockedDates`에 예약 불가 날짜가 포함됩니다.

```json
{
  "bookingPolicy": {
    "minNights": 1,
    "blockedDates": [
      { "startDate": "2026-04-15", "endDate": "2026-04-16", "reason": "RESERVATION" },
      { "startDate": "2026-04-21", "endDate": "2026-04-21", "reason": "HOST_BLOCK" }
    ]
  }
}
```

프론트에서 달력 UI를 구현할 때:
- `RESERVATION`: 다른 사용자의 예약으로 선택 불가
- `HOST_BLOCK`: 호스트가 직접 차단한 날짜
- 두 유형 모두 시작일~종료일 범위를 비활성화 처리

### 3.2 동시 예약 충돌

두 사용자가 같은 날짜를 동시에 예약하면, 먼저 처리된 요청만 성공하고 나머지는 409 에러를 반환합니다.

```json
{
  "success": false,
  "message": "선택한 날짜에 이미 예약이 존재합니다.",
  "error": { "code": "DATE_CONFLICT" }
}
```

프론트에서 이 에러를 받으면 사용자에게 다른 날짜를 선택하도록 안내해야 합니다.

### 3.3 예약 취소 후 날짜 해제

예약을 취소하면 해당 날짜의 차단이 자동으로 풀립니다.
다른 사용자가 그 날짜에 새로 예약할 수 있게 됩니다.

---

## 4. 요약: 원본 명세서와의 차이

| # | 항목 | 원본 | 실제 구현 | 이유 |
|---|------|------|----------|------|
| 1 | Base URL | `/api/v1` | `/api/lattebnb/v1` | 네임스페이스 분리 |
| 2 | refreshToken | 있음 | 없음 | 갱신 API 미정의 |
| 3 | 회원 탈퇴 | `DELETE /me` | `POST /me/withdraw` | DELETE + Body 호환성 |
| 4 | 가격 필드명 | `adultTotalPrice` | `adultSubtotal` | 요청/응답 통일 |
| 5 | 로그아웃 | 서버 처리 모호 | 200 응답만 반환 | JWT는 서버 세션 없음 |
| 6 | username 규칙 | 미정의 | 4~20자, 영소문자+숫자+_ | 유효성 추가 |
| 7 | password 규칙 | 미정의 | 8~50자, 영문+숫자 | 유효성 추가 |
| 8 | 예약 날짜 검증 | 미정의 | 체크인≥내일, 최대30박 | 유효성 추가 |
| 9 | 인원 검증 | 미정의 | adults≥1, total≤maxGuest | 유효성 추가 |
| 10 | serviceFee | 계산 방법 미정의 | 숙소별 고정 금액 | DB에 직접 저장 |

---

## 5. 프론트엔드 개발 시 참고

- **API 호출 실패 시**: `response.json()`으로 에러 메시지를 파싱하여 사용자에게 표시
- **토큰 관리**: localStorage에 저장, 만료(24시간) 시 재로그인
- **금액 표시**: `(128000).toLocaleString()` → `"128,000"`
- **날짜 처리**: `YYYY-MM-DD` 문자열, `new Date('2026-04-10')` 주의 (UTC 변환됨)
- **CORS**: `localhost:5500`, `localhost:5173` 등에서 직접 호출 가능 (프록시 불필요)
