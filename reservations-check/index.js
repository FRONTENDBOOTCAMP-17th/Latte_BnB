import constants from '../src/constants.js';
import { buildEmptyState } from '../src/components/emptyState.js';

const API_BASE = constants.API_BASE_URL;

const elements = {
  list: document.getElementById('reservation-list'),
  result: document.getElementById('result'),
};

function getToken() {
  return localStorage.getItem('accessToken');
}

function showError(message) {
  elements.result.textContent = message;
  elements.result.style.color = 'red';
}

function clearMessage() {
  elements.result.textContent = '';
  elements.result.style.color = '';
}

function formatMonthDay(dateString) {
  const [, month, day] = dateString.split('-');
  return `${Number(month)}월 ${Number(day)}일`;
}

function getReservations(reservations) {
  return reservations.filter(
    (reservation) => reservation.status !== 'CANCELLED',
  );
}

function renderEmptyState() {
  elements.list.textContent = '';
  elements.result.textContent = '';

  const emptyState = buildEmptyState(`예약 목록이`);
  elements.list.appendChild(emptyState);

  return;
}

function createReservationItem(reservation) {
  const { accommodation, schedule, id } = reservation;

  const checkIn = formatMonthDay(schedule.checkInDate);
  const checkOut = formatMonthDay(schedule.checkOutDate);

  const item = document.createElement('li');
  item.className = 'w-full max-w-[600px] mx-auto';

  item.innerHTML = `
    <img class="w-full h-40 object-cover rounded-md"
    src="${accommodation.thumbnailUrl}"
    alt="${accommodation.title}">
    <p class="mt-2 font-bold">${accommodation.title}</p>
    <p class="text-sm text-gray-500">${checkIn} ~ ${checkOut} | ${schedule.nights}박</p>
      `;

  item.addEventListener('click', () => {
    localStorage.setItem('reservationId', id);
    location.href = `../reservations-detail/`;
  });

  return item;
}

function renderReservations(reservations) {
  elements.list.textContent = '';

  reservations.forEach((reservation) => {
    const item = createReservationItem(reservation);
    elements.list.appendChild(item);
  });
}

async function listApi(token) {
  const res = await fetch(`${API_BASE}/me/reservations`, {
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

async function loadReservation() {
  try {
    clearMessage();

    const token = getToken();

    if (!token) {
      showError(`로그인이 필요합니다.`);
      return;
    }

    const data = await listApi(token);
    const rsv = data.data.reservations;
    const cancelledReservations = getReservations(rsv);

    if (cancelledReservations.length === 0) {
      renderEmptyState();
      return;
    }

    renderReservations(cancelledReservations);
  } catch (e) {
    showError(`에러 발생: ${e.message}`);
  }
}

loadReservation();
