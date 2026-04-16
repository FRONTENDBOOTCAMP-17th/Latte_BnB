import { getToken } from '../src/utils/auth.js';
import { showReservations } from '../src/api/reservation.js';
import { buildEmptyState } from '../src/components/emptyState.js';
import pagination from '../src/components/pagination.js';

const elements = {
  list: document.getElementById('reservation-list'),
  result: document.getElementById('result'),
};

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

function filterCancelled(reservations) {
  return reservations.filter(
    (reservation) => reservation.status !== 'CANCELLED',
  );
}

function renderEmptyState() {
  elements.list.textContent = '';
  elements.result.textContent = '';

  const emptyState = buildEmptyState(`예약 목록이`);
  elements.list.appendChild(emptyState);
}

function createReservationItem(reservation) {
  const { accommodation, schedule, id } = reservation;

  const checkIn = formatMonthDay(schedule.checkInDate);
  const checkOut = formatMonthDay(schedule.checkOutDate);

  const item = document.createElement('li');
  item.className =
    'w-full max-w-[600px] mx-auto shadow-xl rounded-xl overflow-hidden cursor-pointer';

  item.innerHTML = `
    <img class="w-full h-40 object-cover" />
    <p data-role="title" class="mt-4 mb-2 mx-4 font-bold"></p>
    <p data-role="schedule" class="text-sm text-gray-500 mt-2 mb-4 mx-4"></p>
      `;

  item.querySelector('img').src = accommodation.thumbnailUrl;
  item.querySelector('img').alt = accommodation.title;
  item.querySelector('[data-role="title"]').textContent = accommodation.title;
  item.querySelector('[data-role="schedule"]').textContent =
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
  try {
    const data = await showReservations({
      page: pagination.paginationData.page,
      pageLimit: 20,
    });

    const rsv = data.data.reservations;
    const cancelledReservations = filterCancelled(rsv);

    if (cancelledReservations.length === 0) {
      renderEmptyState();
      return;
    }

    renderReservations(cancelledReservations);
    pagination.setPrevNext(data.meta.pagination);
  } catch (e) {
    showError(`에러 발생: ${e.message}`);
  }
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
    const cancelledReservations = filterCancelled(rsv);

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
