import {
  getReservationDetail,
  removeReservation,
} from '../src/api/reservation.js';

const storageKeys = {
  token: 'accessToken',
};

function getToken() {
  return localStorage.getItem(storageKeys.token);
}

const reservationId = new URLSearchParams(location.search).get('id');

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

  const container = document.createElement('div');
  container.id = 'container';

  container.innerHTML = `
  <div
    id='roomInfo'
    class='mx-4 border-b-2 border-shark-300 p-4 md:mx-auto md:w-lg lg:w-170.5 lg:flex lg:items-start lg:gap-4'>
    <img
      class='block w-full h-55 object-cover rounded-md lg:h-55 lg:w-70 lg:shrink-0' />
    <div id='room' class='mt-4 lg:mt-0 lg:min-w-0 lg:flex-1'>
      <p id='name' class='text-2xl font-bold break-keep'></p>
      <p id='location' class='mt-4 text-base font-semibold text-shark-500'></p>
    </div>
  </div>

  <div id="schedule" class="mx-4 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 p-4 md:w-lg md:justify-self-center lg:w-170.5">
    <p id="check" class="text-2xl font-bold"></p>
    <p id="nights"></p>
    <p id="checkIn" class="text-base font-semibold text-shark-500"></p>
    <p id="checkOut" class="text-base font-semibold text-shark-500"></p>
    <p id="inDay" class="text-xl font-bold"></p>
    <p id="outDay" class="text-xl font-bold"></p>
  </div>

  <div
    id='guestInfo'
    class='mx-4 border-b-2 border-shark-300 p-4 md:w-lg md:justify-self-center lg:w-170.5'>
    <p id='guest' class='text-2xl font-bold'></p>
    <p id='people' class='mt-4 text-base font-semibold text-shark-500'></p>
  </div>

  <div id="priceInfo" class="mx-4 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 p-4  md:w-lg md:justify-self-center lg:w-170.5">
    <p id="price" class="text-2xl font-bold"></p>
    <p id="blank"></p>
    <p id="totalPrice" class="self-center text-base font-semibold text-shark-500"></p>
    <p id="total" class="text-right text-2xl font-extrabold"></p>
  </div>
  `;

  container.querySelector('img').src = accommodation.thumbnailUrl;
  container.querySelector('img').alt = accommodation.title;
  container.querySelector('#name').textContent = accommodation.title;
  container.querySelector('#location').textContent = accommodation.location;

  container.querySelector('#check').textContent = `예약 일정`;
  container.querySelector('#checkIn').textContent = `체크인`;
  container.querySelector('#checkOut').textContent = `체크아웃`;
  container.querySelector('#inDay').textContent =
    `${checkIn} ${schedule.checkInTime}`;
  container.querySelector('#outDay').textContent =
    `${checkOut} ${schedule.checkOutTime}`;

  container.querySelector('#guest').textContent = `게스트`;
  container.querySelector('#people').textContent =
    `성인 ${guestCount.adults}명, 어린이 ${guestCount.children}명`;

  container.querySelector('#price').textContent = `결제 정보`;
  container.querySelector('#totalPrice').textContent = `총 결제 금액`;
  container.querySelector('#total').textContent = `${pricing.totalPrice}원`;

  return container;
}

const elements = {
  cancel: document.getElementById('cancel'),
  modalContainer: document.getElementById('modalContainer'),
  cancelModal: document.getElementById('cancelModal'),
  cancelBtn: document.getElementById('cancelBtn'),
  cancelYes: document.getElementById('cancelYes'),
  cancelNo: document.getElementById('cancelNo'),
  cancelConfirmModal: document.getElementById('cancelConfirmModal'),
  confirmBtn: document.getElementById('confirmBtn'),
  confirmYes: document.getElementById('confirmYes'),
  cancelFaultModal: document.getElementById('cancelFaultModal'),
  cancelFault: document.getElementById('cancelFault'),
  faultBtn: document.getElementById('faultBtn'),
  faultYes: document.getElementById('faultYes'),
};

function renderDetail(detailData) {
  const container = createDetail(detailData);
  elements.cancel.parentNode.insertBefore(container, elements.cancel);
}

async function loadDetail() {
  const token = getToken();

  if (!token || !reservationId) {
    gotoReservationList();
    return;
  }

  try {
    const detailData = await getReservationDetail(reservationId);
    renderDetail(detailData);
  } catch (e) {
    gotoReservationList();
  }
}

function openModal() {
  elements.cancelModal.classList.remove('hidden');
  elements.cancelModal.classList.add('flex');
}

function openModalReverse() {
  elements.cancelModal.classList.remove('flex');
  elements.cancelModal.classList.add('hidden');
}

function closeModal() {
  elements.cancelConfirmModal.classList.add('hidden');
  elements.cancelConfirmModal.classList.remove('flex');
}

function closeModalReverse() {
  elements.cancelConfirmModal.classList.add('flex');
  elements.cancelConfirmModal.classList.remove('hidden');
}

function errorModal() {
  elements.cancelFaultModal.classList.add('hidden');
  elements.cancelFaultModal.classList.remove('flex');
}

function errorModalReverse() {
  elements.cancelFaultModal.classList.add('flex');
  elements.cancelFaultModal.classList.remove('hidden');
}

elements.cancel.addEventListener('click', () => {
  elements.modalContainer.classList.remove('invisible', 'opacity-0');
  elements.modalContainer.classList.add('visible', 'opacity-100');
  document.body.classList.add('overflow-hidden');
  openModal();
  closeModal();
  errorModal();
});

elements.cancelNo.addEventListener('click', () => {
  elements.modalContainer.classList.remove('visible', 'opacity-100');
  elements.modalContainer.classList.add('invisible', 'opacity-0');
  document.body.classList.remove('overflow-hidden');
  openModal();
  closeModal();
  errorModal();
});

elements.cancelYes.addEventListener('click', async () => {
  try {
    await removeReservation(reservationId);
    openModalReverse();
    closeModalReverse();
    errorModal();
  } catch (e) {
    openModalReverse();
    closeModal();
    errorModalReverse();
    elements.cancelFault.textContent = `예약을 취소하지 못했습니다.\n다시 시도해주세요.`;
  }
});

elements.faultYes.addEventListener('click', async () => {
  location.reload();
});

elements.confirmYes.addEventListener('click', () => {
  gotoReservationList();
});

loadDetail();
