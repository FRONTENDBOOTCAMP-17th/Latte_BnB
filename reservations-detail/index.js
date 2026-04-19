import { getToken } from '../src/utils/auth.js';
import { openModal, closeModal } from '../src/components/modal.js';
import {
  getReservationDetail,
  removeReservation,
} from '../src/api/reservation.js';

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

  const content = document.createElement('div');
  const side = document.createElement('div');

  content.innerHTML = `
  <div
    id='roomInfo'
    class='mx-4 mb-2 border-b-2 border-shark-300 py-5 md:mx-auto md:w-lg lg:mx-0 lg:w-full lg:py-6 lg:flex lg:items-start lg:gap-6'>
    <img
      class='block w-full h-55 object-cover rounded-md lg:h-55 lg:w-80 lg:shrink-0' />
    <div id='room' class='mt-4 lg:mt-0 lg:min-w-0 lg:flex-1'>
      <p id='name' class='text-2xl font-bold break-keep'></p>
      <p id='location' class='mt-4 text-base font-semibold text-shark-500'></p>
    </div>
  </div>

  <div id="schedule" class="mx-4 mb-2 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 py-6 md:w-lg md:justify-self-center lg:mx-0 lg:w-full lg:py-6">
    <p id="check" class="text-2xl font-bold"></p>
    <p id="nights"></p>
    <p id="checkIn" class="text-base font-semibold text-shark-500"></p>
    <p id="checkOut" class="text-base font-semibold text-shark-500"></p>
    <p id="inDay" class="text-xl font-bold"></p>
    <p id="outDay" class="text-xl font-bold"></p>
  </div>
  `;

  side.innerHTML = `
  <div
    id='guestInfo'
    class='mx-4 mb-2 border-b-2 border-shark-300 py-6 md:w-lg md:justify-self-center lg:mx-0 lg:mb-0 lg:w-full lg:py-0 lg:pb-5 lg:border-b lg:border-shark-200'>
    <p id='guest' class='text-2xl font-bold'></p>
    <p id='people' class='mt-4 text-base font-semibold text-shark-500'></p>
  </div>

  <div id="priceInfo" class="mx-4 mb-8 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 py-6 md:w-lg md:justify-self-center lg:mx-0 lg:mb-0 lg:w-full lg:border-b-0 lg:py-5">
    <p id="price" class="text-2xl font-bold"></p>
    <p id="blank"></p>
    <p id="totalPrice" class="self-center text-base font-semibold text-shark-500"></p>
    <p id="total" class="text-right text-2xl font-extrabold"></p>
  </div>
  `;

  content.querySelector('img').src = accommodation.thumbnailUrl;
  content.querySelector('img').alt = accommodation.title;
  content.querySelector('#name').textContent = accommodation.title;
  content.querySelector('#location').textContent = accommodation.location;

  content.querySelector('#check').textContent = `예약 일정`;
  content.querySelector('#checkIn').textContent = `체크인`;
  content.querySelector('#checkOut').textContent = `체크아웃`;
  content.querySelector('#inDay').textContent =
    `${checkIn} ${schedule.checkInTime}`;
  content.querySelector('#outDay').textContent =
    `${checkOut} ${schedule.checkOutTime}`;

  side.querySelector('#guest').textContent = `게스트`;
  side.querySelector('#people').textContent =
    `성인 ${guestCount.adults}명, 어린이 ${guestCount.children}명`;

  side.querySelector('#price').textContent = `결제 정보`;
  side.querySelector('#totalPrice').textContent = `총 결제 금액`;
  side.querySelector('#total').textContent =
    `${pricing.totalPrice.toLocaleString()}원`;

  return { content, side };
}

const elements = {
  cancel: document.getElementById('cancel'),
  modalContainer: document.getElementById('modalContainer'),
  cancelModal: document.getElementById('cancelModal'),
  cancelYes: document.getElementById('cancelYes'),
  cancelNo: document.getElementById('cancelNo'),
  cancelConfirmModal: document.getElementById('cancelConfirmModal'),
  confirmYes: document.getElementById('confirmYes'),
  cancelFaultModal: document.getElementById('cancelFaultModal'),
  cancelFault: document.getElementById('cancelFault'),
  faultYes: document.getElementById('faultYes'),
};

function renderDetail(detailData) {
  const detail = createDetail(detailData);
  document.getElementById('detail-content').appendChild(detail.content);
  document.getElementById('detail-side').prepend(detail.side);
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

function showCancelStep(step) {
  const isOpen = step !== 'idle';

  if (isOpen) {
    openModal(elements.modalContainer);
  } else {
    closeModal(elements.modalContainer);
  }

  step === 'confirm'
    ? openModal(elements.cancelModal)
    : closeModal(elements.cancelModal);
  step === 'success'
    ? openModal(elements.cancelConfirmModal)
    : closeModal(elements.cancelConfirmModal);
  step === 'error'
    ? openModal(elements.cancelFaultModal)
    : closeModal(elements.cancelFaultModal);
}

elements.cancel.addEventListener('click', () => {
  showCancelStep('confirm');
});

elements.cancelNo.addEventListener('click', () => {
  showCancelStep('idle');
});

elements.cancelYes.addEventListener('click', async () => {
  try {
    await removeReservation(reservationId);
    showCancelStep('success');
  } catch (e) {
    elements.cancelFault.textContent = `예약을 취소하지 못했습니다.\n다시 시도해주세요.`;
    showCancelStep('error');
  }
});

elements.faultYes.addEventListener('click', () => {
  location.reload();
});

elements.confirmYes.addEventListener('click', () => {
  gotoReservationList();
});

loadDetail();
