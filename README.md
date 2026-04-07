# Latte_BnB : 에어비앤비 클론 코딩

## 🚀 프로젝트 소개

![로고](https://cdn.discordapp.com/attachments/1453251248898838705/1486547850769731656/content.png?ex=69c5e712&is=69c49592&hm=c1b71fbe8209800256bda8555af1081e26ddd08d8ac7e8eb19808f13ee346b1b)

이 프로젝트는 에어비앤비 웹사이트를 클론 코딩하며 프론트엔드 전반(HTML, CSS, JS)을 학습하기 위해 진행되었습니다.

**바닐라 프로젝트 기간 : 26.03.26 ~ 26.04.20**  
**발표: 04.20**

### 배포주소 : [Latte_BnB](배포 URL 예정)

## 👥 팀원 소개

|                                                                                                                 [이동근](https://github.com/dongkeun99Hub)                                                                                                                  |                                                                                                                     [이선우](https://github.com/zzz664)                                                                                                                     |                     [방효진](https://github.com/lllillly)                     |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------: |
| <img src="https://media.discordapp.net/attachments/1453251248898838705/1486555024761946312/KakaoTalk_20260326_113758606.jpg?ex=69c5edc0&is=69c49c40&hm=1caf674543195ce86f30e8e4d848d179fb4e93c261dfc7f73a3278210c4fce22&=&format=webp&width=1102&height=1296" width="200"/> | <img src="https://media.discordapp.net/attachments/1453251248898838705/1486555671750250536/1670208809533.png?ex=69c5ee5b&is=69c49cdb&hm=928ebdc55ca0698638432882ae9cbaf80ffdaf7b4d5a376544be3187685431e2&=&format=webp&quality=lossless&width=502&height=402" width="200"/> | <img src="https://avatars.githubusercontent.com/u/43092333?v=4" width="200"/> |
|                                                                                                                                 역할 : 조장                                                                                                                                 |                                                                                                                                 역할 : 팀원                                                                                                                                 |                                  역할 : 팀원                                  |
|                                                                                                                             담당 페이지 : ~~~~                                                                                                                              |                                                                                                                             담당 페이지 : ~~~~                                                                                                                              |                              담당 페이지 : ~~~~                               |

## 🧠 기술 스택

|         구분         | 내용                    |
| :------------------: | :---------------------- |
|     **UI / UX**      | Figma                   |
| **프론트엔드 개발**  | HTML5, CSS, TAILWINDCSS |
| **개발 환경 / 도구** | VSCODE, GITHUB          |
|   **커뮤니케이션**   | DISCORD                 |

## 💡 주요 기능

- 메인 페이지 : 내용
- 숙소 상세 페이지 : 내용
- 위시리스트 페이지 : 내용
- 로그인/회원가입 페이지 : 내용

## 🛠️ 프로토타입

### 프로토타입 구현과정 문서
- [prototype-implementation-process.md](./docs/prototype-Implementation-process.md)

<details>
<summary>디자인 시안 모음 (클릭 시 열립니다.)</summary>
<ul>
  <li><a href="./docs/prototype-design-draft/landing.md">랜딩 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/login.md">로그인 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/register.md">회원가입 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/accommodation_detail.md">숙소 상세 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/reservation_request.md">예약 신청 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/reservation_detail.md">예약 상세 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/my_reservation.md">내 예약 목록 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/wish.md">위시리스트 페이지</a></li>
  <li><a href="./docs/prototype-design-draft/profile.md">프로필 페이지</a></li>
</ul>
</details>

## 📁 프로젝트 구조

```
Latte_BnB/
├── index.html                          ← 메인(랜딩) 페이지
├── login/
│   ├── index.html                      ← 로그인 페이지
│   └── index.js
├── signup/
│   ├── index.html                      ← 회원가입 페이지
│   └── index.js
├── profile/
│   ├── index.html                      ← 프로필 페이지
│   └── profile.js
├── accommodations-detail/
│   ├── index.html                      ← 숙소 상세 페이지
│   └── accommodations-detail.js
├── reservations-check/                 ← (신규)
│   ├── index.html                      ← 예약 확인 페이지
│   └── index.js
├── reservations-detail/                ← (신규)
│   ├── index.html                      ← 예약 상세 페이지
│   └── index.js
├── admin/
│   ├── login/
│   │   ├── index.html                  ← 관리자 로그인
│   │   ├── index.js
│   │   └── login.js
│   └── add/                            ← (신규)
│       ├── index.html                  ← 숙소 등록 폼
│       ├── index.js
│       └── addAccommodation.js
├── src/
│   ├── main.js                         ← 공통 진입점
│   ├── landing.js                      ← 랜딩 페이지 JS (대폭 확장)
│   ├── RoomCard.js                     ← 숙소 카드 컴포넌트 (찜 기능 추가)
│   ├── constants.js                    ← API URL 상수
│   ├── style.css                       ← Tailwind CSS + 테마 (admin 스타일 추가)
│   ├── styles/
│   │   └── toast.css                   ← 토스트 애니메이션
│   ├── components/
│   │   ├── header.js                   ← 공통 헤더 (검색 UI 추가)
│   │   ├── footer.js                   ← 공통 푸터
│   │   ├── toast.js                    ← 토스트 알림 (버그 수정됨)
│   │   ├── hamburger.js                ← 햄버거 메뉴 (신규)
│   │   ├── navigation.js              ← 하단 네비게이션 (신규)
│   │   ├── pagination.js              ← 페이지네이션 (신규)
│   │   ├── PreviewImage.js            ← 이미지 프리뷰 (신규)
│   │   └── numberInput.js             ← 숫자 입력 (신규)
│   └── assets/
│       ├── logo.png, search.svg
│       ├── login.svg, logout.svg       ← (신규)
│       ├── profile.svg, wish.svg       ← (신규)
│       ├── reservation.svg             ← (신규)
│       └── reservation-cancel.svg      ← (신규)
├── docs/
│   └── ...
├── vite.config.js
├── package.json
└── README.md
```

## 🖥️ 서비스 소개

### 🏠 메인 페이지 (검색 + 리스트)

- 내용

|                        |                      |
| ---------------------- | -------------------- |
| ![메인 데스크탑](경로) | ![메인 모바일](경로) |

### 📑 숙소 상세 페이지

- 내용

|                            |                          |
| -------------------------- | ------------------------ |
| ![숙소상세 데스크탑](경로) | ![숙소상세 모바일](경로) |

### ❤️ 위시리스트 페이지

- 내용

|                              |                            |
| ---------------------------- | -------------------------- |
| ![위시리스트 데스크탑](경로) | ![위시리스트 모바일](경로) |

### 🔐 로그인/회원가입 페이지

- 내용

|                          |                        |
| ------------------------ | ---------------------- |
| ![로그인 데스크탑](경로) | ![로그인 모바일](경로) |

## ⚙️ 트러블 슈팅

| 이름 👤 | 문제점 ❗ | 해결 방법 🛠️ |
| ------- | --------- | ------------ |
| 이름A   | 내용      | 내용         |
| 이름B   | 내용      | 내용         |
| 이름C   | 내용      | 내용         |

## 📝 프로젝트 후기

| 이름 👤 | 후기 |
| ------- | ---- |
| 이름A   | 내용 |
| 이름B   | 내용 |
| 이름C   | 내용 |
