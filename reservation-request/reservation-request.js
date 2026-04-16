import toast from '../src/components/toast.js';
import calendar from './calendar.js';
import { getProfile } from '../src/api/auth.js';
import { openModal, closeModal } from '../src/components/modal.js';
import {
  getReservationContext,
  createReservation,
} from '../src/api/reservation.js';

const params = new URLSearchParams(location.search);
const roomId = params.get('id');

async function checkTokenAvailable() {
  try {
    const res = await getProfile();
    if (!res) {
      alert('로그인이 필요합니다.');
      location.href = '/login/';
      return false;
    }
    return true;
  } catch (error) {
    if (error.status === 401) {
      alert('로그인이 필요합니다.');
      location.href = '/login/';
    }
    return false;
  }
}

let adults = 1;
let children = 0;
let room = null;

calendar.setCalendarChange(updateDateBtn);

function won(price) {
  return `₩${price.toLocaleString()}`;
}

function dateFormat(date) {
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();

  return `${year}-${month}-${day}`;
}

function showDate(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function getNights() {
  const checkin = calendar.getCheckinDate();
  const checkout = calendar.getCheckoutDate();
  if (!checkin || !checkout) {
    return 1;
  }
  return Math.round((checkout - checkin) / (1000 * 60 * 60 * 24));
}

function updateDateBtn() {
  const checkin = calendar.getCheckinDate();
  const checkout = calendar.getCheckoutDate();
  let text = '날짜 선택';

  if (checkin && checkout) {
    text = `${showDate(checkin)} ~ ${showDate(checkout)}`;
  }

  document.getElementById('btn-date').textContent = text;
}

async function getRoomContext() {
  try {
    const contextRes = await getReservationContext(roomId);
    if (!contextRes) return;

    room = contextRes.data.accommodation;
    room.pricing = contextRes.data.pricing;
    room.bookingPolicy = contextRes.data.bookingPolicy;

    calendar.setBlockedDates(room.bookingPolicy.blockedDates);
    calendar.setDefaultDates();

    document.getElementById('thumb').src = room.thumbnailUrl;
    document.getElementById('title').textContent = room.title;
    document.getElementById('adult-price').textContent =
      `${won(room.pricing.adultPrice)} / 1박`;
    document.getElementById('child-price').textContent =
      `${won(room.pricing.childPrice)} / 1박`;
    document.getElementById('max-guest').textContent =
      `최대 ${room.maxGuest}명`;

    updatePricing();
  } catch (e) {
    console.error(e);
    toast.warn('숙소 정보를 불러오지 못했습니다.');
  }
}

function updatePricing() {
  if (!room) {
    return;
  }
  const nights = getNights();
  const { pricing } = room;
  const adultTotal = pricing.adultPrice * nights * adults;
  const childTotal = pricing.childPrice * nights * children;

  document.getElementById('adult-subtotal-label').textContent =
    `${won(pricing.adultPrice)} × ${nights}박 × 성인 ${adults}명`;
  document.getElementById('adult-subtotal').textContent = won(adultTotal);
  document.getElementById('child-subtotal-label').textContent =
    `${won(pricing.childPrice)} × ${nights}박 × 어린이 ${children}명`;
  document.getElementById('child-subtotal').textContent = won(childTotal);
  document.getElementById('service-fee').textContent = won(pricing.serviceFee);
  document.getElementById('total-price').textContent = won(
    adultTotal + childTotal + pricing.serviceFee,
  );
}

async function submitCalendarDate() {
  const checkin = calendar.getCheckinDate();
  const checkout = calendar.getCheckoutDate();
  if (!checkin || !checkout) {
    toast.warn('날짜를 선택해 주세요.');
    return;
  }

  const nights = getNights();
  const { pricing } = room;
  const adultTotal = pricing.adultPrice * nights * adults;
  const childTotal = pricing.childPrice * nights * children;
  const totalPrice = adultTotal + childTotal + pricing.serviceFee;

  try {
    const contextRes = await createReservation({
      accommodation: { id: room.id },
      schedule: {
        checkInDate: dateFormat(checkin),
        checkOutDate: dateFormat(checkout),
      },
      guestCount: { adults, children },
      pricingSnapshot: {
        nights,
        adultSubtotal: adultTotal,
        childSubtotal: childTotal,
        serviceFee: pricing.serviceFee,
        totalPrice,
      },
      agreeToTerms: true,
    });

    const schedule = contextRes.data.schedule;

    alert(
      `[예약이 완료되었습니다]\n체크인: ${schedule.checkInDate} ${schedule.checkInTime}\n체크아웃: ${schedule.checkOutDate} ${schedule.checkOutTime}`,
    );

    location.href = '/reservations-check/';
  } catch (e) {
    console.error(e);
    toast.warn('예약에 실패했습니다.');
  }
}

const calModal = document.getElementById('modal-calendar');
const guestModal = document.getElementById('modal-guest');

document.getElementById('btn-date').addEventListener('click', () => {
  openModal(calModal);
});

document
  .getElementById('modal-calendar-cancel')
  .addEventListener('click', () => {
    closeModal(calModal);
  });

document.getElementById('modal-calendar-save').addEventListener('click', () => {
  if (!calendar.getCheckinDate() || !calendar.getCheckoutDate()) {
    toast.warn('날짜를 모두 선택해 주세요.');
    return;
  }

  closeModal(calModal);
  updateDateBtn();
  updatePricing();
});

document.getElementById('btn-guest').addEventListener('click', () => {
  openModal(guestModal);
});

document.getElementById('modal-guest-cancel').addEventListener('click', () => {
  closeModal(guestModal);
});

document.getElementById('modal-guest-save').addEventListener('click', () => {
  closeModal(guestModal);

  let guestText = `성인 ${adults}명`;

  if (children > 0) {
    guestText += `, 어린이 ${children}명`;
  }
  document.getElementById('btn-guest').textContent = guestText;

  updatePricing();
});

// 어른 카운트
document.getElementById('btn-adult-minus').addEventListener('click', () => {
  if (adults <= 1) {
    return;
  }
  adults--;
  document.getElementById('adult-cnt').textContent = adults;
});

document.getElementById('btn-adult-plus').addEventListener('click', () => {
  if (!room || adults + children >= room.maxGuest) {
    return;
  }
  adults++;
  document.getElementById('adult-cnt').textContent = adults;
});

// 어린이 카운트
document.getElementById('btn-child-minus').addEventListener('click', () => {
  if (children <= 0) {
    return;
  }
  children--;
  document.getElementById('child-cnt').textContent = children;
});

document.getElementById('btn-child-plus').addEventListener('click', () => {
  if (!room || adults + children >= room.maxGuest) {
    return;
  }
  children++;
  document.getElementById('child-cnt').textContent = children;
});

document.getElementById('btn-back').addEventListener('click', () => {
  location.href = `/accommodations-detail/?id=${roomId}`;
});

document
  .getElementById('btn-submit')
  .addEventListener('click', submitCalendarDate);

checkTokenAvailable().then((ok) => {
  if (ok) {
    getRoomContext();
  }
});
