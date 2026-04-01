# Latte_BnB API 수정 안내 - 이미지 업로드 (2026-04-01)

> 바닐라라떼조 요청에 따라 이미지 업로드 API를 추가했습니다.

---

## 변경 요약

숙소 이미지를 직접 업로드하고 URL을 받을 수 있는 API가 추가되었습니다.
기존에는 외부 이미지 URL을 직접 입력해야 했지만, 이제 파일을 업로드하면 서버에서 URL을 반환합니다.

```
1단계: 이미지 업로드  →  imageUrl 받기
2단계: 숙소 등록/수정  →  thumbnailUrl, images[].url에 해당 URL 사용
```

---

## 이미지 업로드 API

```
POST https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations/images
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

> 관리자(ADMIN) 권한 필요

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | file | O | 이미지 파일 (JPEG, PNG, WebP, GIF / 최대 5MB) |

### JavaScript 예시

```javascript
const formData = new FormData();
formData.append("file", imageFile);  // input[type="file"]에서 가져온 File 객체

const response = await fetch(
  "https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations/images",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Content-Type은 설정하지 않음! (FormData가 자동으로 boundary 포함)
    },
    body: formData,
  }
);

const result = await response.json();
const imageUrl = result.data.imageUrl;
// "https://storage.fullstackfamily.com/content/lattebnb/accommodations/xxxxx.webp"
```

### 성공 응답 (201)

```json
{
  "success": true,
  "message": "이미지 업로드에 성공했습니다.",
  "data": {
    "imageUrl": "https://storage.fullstackfamily.com/content/lattebnb/accommodations/306ff461.webp"
  }
}
```

### 에러 응답

| HTTP | errorCode | 설명 |
|------|-----------|------|
| 400 | VALIDATION_ERROR | 파일이 비어있음 |
| 413 | FILE_TOO_LARGE | 5MB 초과 |
| 415 | UNSUPPORTED_FILE_TYPE | 허용되지 않는 형식 (JPEG, PNG, WebP, GIF 외) |

---

## 숙소 등록 시 업로드한 이미지 사용

```javascript
// 1. 이미지 여러 장 업로드
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(
    "https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations/images",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }
  );
  const data = await res.json();
  return data.data.imageUrl;
};

// 여러 이미지 업로드
const thumbnailUrl = await uploadImage(thumbnailFile);
const image1Url = await uploadImage(roomFile1);
const image2Url = await uploadImage(roomFile2);

// 2. 숙소 등록 (업로드한 URL 사용)
await fetch(
  "https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "강남 럭셔리 스위트",
      thumbnailUrl: thumbnailUrl,       // 업로드한 URL
      location: {
        region: "서울 강남구",
        address: "서울특별시 강남구 테헤란로 123",
      },
      maxGuest: 4,
      description: "강남 중심가에 위치한 럭셔리 스위트룸",
      pricing: {
        adultPrice: 200000,
        childPrice: 100000,
        serviceFee: 25000,
      },
      bookingPolicy: {
        minNights: 1,
      },
      images: [
        { url: image1Url, title: "거실", description: "넓은 거실" },
        { url: image2Url, title: "침실", description: "마스터 침실" },
      ],
    }),
  }
);
```

---

## 터미널(curl)로 테스트

```bash
# 관리자 로그인
curl -X POST https://api.fullstackfamily.com/api/lattebnb/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin1234!"}'

# 토큰 저장
TOKEN="위_응답의_accessToken_값"

# 이미지 업로드
curl -X POST https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@./room-photo.jpg"

# 숙소 등록 (업로드한 URL 사용)
curl -X POST https://api.fullstackfamily.com/api/lattebnb/v1/admin/accommodations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 숙소",
    "thumbnailUrl": "위에서_받은_URL",
    "location": {"region": "서울 강남구", "address": "테헤란로 123"},
    "maxGuest": 4,
    "pricing": {"adultPrice": 100000, "childPrice": 50000},
    "images": [
      {"url": "위에서_받은_URL", "title": "메인", "description": "메인 이미지"}
    ]
  }'
```

---

## 주의사항

1. **이미지 업로드 시 `Content-Type`을 직접 설정하지 마세요.** `FormData`가 자동으로 처리합니다.
2. 이미지는 서버에서 자동으로 **WebP 형식**으로 변환됩니다.
3. **관리자 권한(ADMIN)**이 필요합니다. 일반 사용자 토큰으로는 403 에러가 발생합니다.

---

## API 문서 페이지

온라인 API 문서: https://www.fullstackfamily.com/lattebnb/api-docs
