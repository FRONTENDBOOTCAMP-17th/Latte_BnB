import constants from '../src/constants.js';
const API_BASE = constants.API_BASE_URL;

const elements = {
  cancelbtn: document.getElementById('cancel'),
};

const storageKeys = {
  token: 'accessToken',
  reservationId: 'reservationId',
};

function getToken() {
  return localStorage.getItem(storageKeys.token);
}

function getReservationId() {
  return localStorage.getItem(storageKeys.reservationId);
}

function clearReservationId() {
  localStorage.removeItem(storageKeys.reservationId);
}

function gotoReservationList() {
  location.replace(`../reservations-check/`);
}

function formatMonthDay(dateString) {
  const [, month, day] = dateString.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

function createDetail(detailData) {
  const { accommodation, guestCount, pricing, schedule } = detailData.data;

  const checkIn = formatMonthDay(schedule.checkInDate);
  const checkOut = formatMonthDay(schedule.checkOutDate);

  return `
        <div
          id="roomInfo"
          class="mx-4 border-b-2 border-shark-300 p-4 md:mx-auto md:w-lg lg:w-170.5 lg:flex lg:items-start lg:gap-4"
          >
          <img
              src="${accommodation.thumbnailUrl}"
              alt="${accommodation.title}"
              class="block w-full h-55 object-cover rounded-md lg:h-55 lg:w-70 lg:shrink-0"
          />

          <div id="room" class="mt-4 lg:mt-0 lg:min-w-0 lg:flex-1">
              <p id="name" class="text-2xl font-bold break-keep">
              ${accommodation.title}
              </p>
              <p id="location" class="mt-4 text-base font-semibold text-shark-500">
              ${accommodation.location}
              </p>
          </div>
          </div>

          <div id="schedule" class="mx-4 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 p-4 md:w-lg md:justify-self-center lg:w-170.5">
            <p id="check" class="text-2xl font-bold">예약 일정</p>
            <p class="text-2xl">총 ${schedule.nights}박</p>
            <p id="checkIn" class="text-base font-semibold text-shark-500">체크인</p>
            <p id="checkOut" class="text-base font-semibold text-shark-500">체크아웃</p>
            <p id="inDay" class="text-xl font-bold">${checkIn} ${schedule.checkInTime}</p>
            <p id="outDay" class="text-xl font-bold">${checkOut} ${schedule.checkOutTime}</p>
          </div>

          <div id="guestInfo" class="mx-4 border-b-2 border-shark-300 p-4 md:w-lg md:justify-self-center lg:w-170.5">
            <p id="guest" class="text-2xl font-bold">게스트</p>
            <p id="people" class="mt-4 text-base font-semibold text-shark-500">성인 ${guestCount.adults}명, 어린이 ${guestCount.children}명</p>
          </div>

          <div id="priceInfo" class="mx-4 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 p-4  md:w-lg md:justify-self-center lg:w-170.5">
            <p id="price" class="text-2xl font-bold">결제 정보</p>
            <p></p>
            <p id="totalPrice" class="self-center text-base font-semibold text-shark-500">총 결제 금액</p>
            <p id="total" class="text-right text-2xl font-extrabold">${pricing.totalPrice}원</p>
          </div>
        `;
}

function renderDetail(detailData) {
  const container = document.createElement('div');
  container.id = 'container';
  container.innerHTML = createDetail(detailData);

  elements.cancelbtn.parentNode.insertBefore(container, elements.cancelbtn);
}

async function detailApi(reservationId, token) {
  const res = await fetch(`${API_BASE}/reservations/${reservationId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP 오류: ${res.status}`);
  }

  return res.json();
}

async function loadDetail() {
  const token = getToken();
  const reservationId = getReservationId();

  if (!token || !reservationId) {
    gotoReservationList();
    return;
  }

  try {
    const detailData = await detailApi(reservationId, token);
    renderDetail(detailData);
  } catch (e) {
    clearReservationId();
    gotoReservationList();
  }
}

async function cancelReservation() {
  const token = getToken();
  const reservationId = getReservationId();

  const isConfirm = confirm(`예약을 취소하시겠습니까?`);
  if (!isConfirm) return;

  try {
    const res = await fetch(
      `${API_BASE}/reservations/${reservationId}/cancel`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(`HTTP 오류: ${res.status}`);
    }

    alert(`취소가 완료되었습니다.`);
    clearReservationId();
    gotoReservationList();
  } catch (e) {
    alert('예약을 취소하지 못했습니다.\n' + e.message);
  }
}

loadDetail();
elements.cancelbtn.addEventListener('click', cancelReservation);
