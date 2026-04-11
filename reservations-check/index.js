import { buildEmptyState } from '../src/components/emptyState.js';
import { getToken } from '../src/utils/auth.js';
import { showReservations } from '../src/api/reservation.js';
import pagination from '../src/components/pagination.js';

const elements = {
  list: document.getElementById('reservation-list'),
  result: document.getElementById('result'),
};

getToken();

function showError(message) {
  elements.result.textContent = message;
  elements.result.classList.add('text-negative-500');
}

function clearMessage() {
  elements.result.textContent = '';
  elements.result.classList.remove('text-negative-500');
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
    <img class="w-full h-40 object-cover rounded-xl" />
    <p class="mt-2 font-bold"></p>
    <p class="text-sm text-gray-500"></p>
      `;

  item.querySelector('img').src = accommodation.thumbnailUrl;
  item.querySelector('img').alt = accommodation.title;
  item.querySelector('.font-bold').textContent = accommodation.title;
  item.querySelector('.text-sm').textContent =
    `${checkIn} ~ ${checkOut} | ${schedule.nights}박`;

  item.addEventListener('click', () => {
    location.href = `../reservations-detail/?id=${id}`;
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

async function changePage() {
  const data = await showReservations({
    page: pagination.paginationData.page,
    pageLimit: 20,
  });
  const rsv = data.data.reservations;
  const cancelledReservations = getReservations(rsv);
  renderReservations(cancelledReservations);
  pagination.setPrevNext(data.meta.pagination);
}

async function loadReservation() {
  try {
    clearMessage();

    const token = getToken();

    if (!token) {
      showError(`로그인이 필요합니다.`);
      return;
    }

    const data = await showReservations({ pageLimit: 20 });
    const rsv = data.data.reservations;
    const cancelledReservations = getReservations(rsv);

    if (cancelledReservations.length === 0) {
      renderEmptyState();
      return;
    }

    renderReservations(cancelledReservations);
    elements.list.after(pagination.buildPagination(data.meta.pagination));
  } catch (e) {
    showError(`에러 발생: ${e.message}`);
  }
}

loadReservation();

document.addEventListener('click', (e) => {
  if (e.target.id === 'prevButton') {
    pagination.setCurrentPage(pagination.paginationData.page - 1);
    changePage();
  }

  if (e.target.id === 'nextButton') {
    pagination.setCurrentPage(pagination.paginationData.page + 1);
    changePage();
  }
});
