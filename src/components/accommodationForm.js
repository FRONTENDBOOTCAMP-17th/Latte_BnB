import constants from '../constants.js';

let originData = null;
let modifiedData = null;
let element = null;

async function fetchAccommodation(id) {
  const res = await fetch(
    `${constants.API_BASE_URL}/admin/accommodations/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('HTTP 에러: ' + res.status);
  }

  const { success, message, data } = await res.json();

  originData = data;

  return { success, message };
}

function buildViewMode() {
  element = document.createElement('div');
  element.id = 'accommodation';
  element.innerHTML = `
    <img src="${originData.thumbnailUrl}" alt="숙소 대표 이미지" />
    <div id="mainInfo">
      <h1 id="title"></h1>
      <p id="address"></p>
      <div id="subInfo">
        <span id="region"></span>
        <span id="maxGuest"></span>
      </div>
    </div>
    <p id="description"></p>
    <div id="images">
      <h2>숙박장소</h2>
    </div>
    <div id="pricing">
      <h2>가격정책 (단위: 원)</h2>
      <p id="adultPrice"></p>
      <p id="childPrice"></p>
      <p id="serviceFee"></p>
    </div>
    <div id="booking">
      <h2>예약정책</h2>
      <p id="minNights"></p>
    </div>
  `;

  fillData();

  return element;
}

function buildEditMode() {
  modifiedData = originData;
}

function fillData(isEdit = false) {
  const html = getHTMLReference();

  if (isEdit) {
  } else {
    html.title.textContent = originData.title;
    html.address.textContent = originData.location.address;
    html.region.textContent = originData.location.region;
    html.maxGuest.textContent = `최대 ${originData.maxGuest}명까지 숙박 가능`;
    html.description.textContent = originData.description;
    html.images.appendChild(fillImages());
    html.adultPrice.textContent = `성인: ₩${Number.parseInt(originData.pricing.adultPrice).toLocaleString()}`;
    html.childPrice.textContent = `어린이: ₩${Number.parseInt(originData.pricing.childPrice).toLocaleString()}`;
    html.serviceFee.textContent = originData.pricing.serviceFee
      ? `서비스 수수료: ₩${Number.parseInt(originData.pricing.serviceFee).toLocaleString()}`
      : '서비스 수수료 없음';
    html.minNights.textContent = `최소 ${originData.bookingPolicy.minNights}박부터 예약 가능`;
    html.booking.appendChild(fillBlockedDate());
  }
}

function fillImages() {
  if (originData.images.length > 0) {
    const container = document.createElement('div');
    container.id = 'imagesContainer';

    for (let image of originData.images) {
      if (!image.url) {
        continue;
      }

      const div = document.createElement('div');
      const img = document.createElement('img');
      img.src = image.url;

      const title = document.createElement('h3');
      title.textContent = image.title;

      const description = document.createElement('p');
      description.textContent = image.description;

      div.append(img, title, description);
      container.appendChild(div);
    }

    return container;
  } else {
    const div = document.createElement('div');
    div.textContent = '숙박장소 이미지가 없습니다.';

    return div;
  }
}

function fillBlockedDate() {
  if (originData.bookingPolicy.blockedDates.length > 0) {
    const container = document.createElement('div');
    container.id = 'blockedDates';

    for (let blockedDate of originData.bookingPolicy.blockedDates) {
      const div = document.createElement('div');
      const blockedRange = document.createElement('p');
      blockedRange.className = 'blockedRange';
      blockedRange.textContent =
        '예약 불가 날짜: ' +
        `${blockedDate.startDate} ~ ${blockedDate.endDate}`;

      const blockedReason = document.createElement('p');
      blockedReason.className = 'blockedReason';
      blockedReason.textContent =
        '사유: ' + (blockedDate.reason === 'RESERVATION')
          ? '예약상태'
          : '관리자지정';

      div.append(blockedRange, blockedReason);
      container.appendChild(div);
    }

    return container;
  } else {
    const div = document.createElement('div');
    div.textContent = '설정된 예약 불가 날짜가 없습니다.';

    return div;
  }
}

function getHTMLReference() {
  const title = element.querySelector('#title');
  const address = element.querySelector('#address');
  const region = element.querySelector('#region');
  const maxGuest = element.querySelector('#maxGuest');
  const description = element.querySelector('#description');
  const images = element.querySelector('#images');
  const adultPrice = element.querySelector('#adultPrice');
  const childPrice = element.querySelector('#childPrice');
  const serviceFee = element.querySelector('#serviceFee');
  const minNights = element.querySelector('#minNights');
  const booking = element.querySelector('#booking');

  return {
    title,
    address,
    region,
    maxGuest,
    description,
    images,
    adultPrice,
    childPrice,
    serviceFee,
    minNights,
    booking,
  };
}

export default { fetchAccommodation, buildViewMode };
