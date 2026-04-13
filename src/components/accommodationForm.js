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
  element.className =
    'min-w-100 w-fit max-w-3xl flex flex-col items-center bg-white gap-4 md:rounded-t-2xl pb-10';
  element.innerHTML = `
    <img src="${originData.thumbnailUrl}" alt="숙소 대표 이미지" id="thumbnail" class="w-full md:rounded-t-2xl" />
    <div id="mainInfo" class="px-4 text-center">
      <h1 id="title" class="scroll-m-20 text-shark-700 text-center text-4xl font-extrabold tracking-tight text-balance"></h1>
      <p id="address" class="leading-7 text-shark-700 [&:not(:first-child)]:mt-6"></p>
      <div id="subInfo">
        <span id="region" class="leading-7 text-shark-500 [&:not(:first-child)]:mt-6 text-sm"></span>
        <span class="leading-7 text-shark-500 [&:not(:first-child)]:mt-6 text-sm">·</span>
        <span id="maxGuest" class="leading-7 text-shark-500 [&:not(:first-child)]:mt-6 text-sm"></span>
      </div>
    </div>
    <p id="description" class="leading-7 text-shark-700 [&:not(:first-child)]:mt-6 mx-4"></p>
    <div id="images" class="w-full px-4">
      <h2 class="scroll-m-20 border-b border-b-shark-200 pb-2 text-3xl text-shark-700 font-semibold tracking-tight first:mt-0 mb-2">숙박장소</h2>
    </div>
    <div id="pricing" class="px-4 w-full">
      <h2 class="scroll-m-20 border-b border-b-shark-200 pb-2 text-3xl text-shark-700 font-semibold tracking-tight first:mt-0 mb-2">가격정책 (단위: 원)</h2>
      <div class="grid grid-cols-[max-content_1fr] text-shark-700">
        <p id="adultPrice" class="grid grid-cols-subgrid col-span-2">
          <span class="row-start-1 col-start-1 flex justify-between gap-2 mr-1">
            <span>성</span>
            <span>인</span>
          </span>
        </p>
        <p id="childPrice" class="grid grid-cols-subgrid col-span-2">
          <span class="row-start-2 col-start-1 flex justify-between gap-2 mr-1">
            <span>어</span>
            <span>린</span>
            <span>이</span>
          </span>
        </p>
        <p id="serviceFee" class="grid grid-cols-subgrid col-span-2">
          <span class="row-start-3 col-start-1 flex justify-between gap-2 mr-1">
            <span>서비스</span>
            <span>수수료</span>
          </span>
        </p>
      </div>
    </div>
    <div id="booking" class="px-4 w-full">
      <h2 class="scroll-m-20 border-b border-b-shark-200 pb-2 text-3xl text-shark-700 font-semibold tracking-tight first:mt-0 mb-2">예약정책</h2>
      <p id="minNights" class="text-lg text-shark-700 mb-2 mt-4"></p>
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

    const adultPrice = document.createElement('span');
    adultPrice.className = 'row-start-1 col-start-2 font-semibold';
    adultPrice.textContent = `: ₩${Number.parseInt(originData.pricing.adultPrice).toLocaleString()}`;
    html.adultPrice.appendChild(adultPrice);

    const childPrice = document.createElement('span');
    childPrice.className = 'row-start-2 col-start-2 font-semibold';
    childPrice.textContent = `: ₩${Number.parseInt(originData.pricing.childPrice).toLocaleString()}`;
    html.childPrice.appendChild(childPrice);

    const serviceFee = document.createElement('span');
    serviceFee.className = 'row-start-3 col-start-2 font-semibold';
    serviceFee.textContent = `: ₩${Number.parseInt(originData.pricing.serviceFee).toLocaleString()}`;
    html.serviceFee.appendChild(serviceFee);

    html.minNights.textContent = `최소 ${originData.bookingPolicy.minNights}박부터 예약 가능`;
    html.booking.appendChild(fillBlockedDate());
  }
}

function fillImages() {
  if (originData.images.length > 0) {
    const container = document.createElement('div');
    container.id = 'imagesContainer';
    container.className =
      'w-full flex flex-nowrap gap-5 overflow-x-auto thin-scroll py-4';

    for (let image of originData.images) {
      if (!image.url) {
        continue;
      }

      const div = document.createElement('div');

      const img = document.createElement('img');
      img.className = 'min-w-80 w-full aspect-square object-cover rounded-lg';
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
    div.className =
      'min-h-70 flex items-center justify-center bg-primary-50/50 border-2 border-primary-50 rounded-lg text-shark-700 text-sm';
    div.textContent = '숙박장소 이미지가 없습니다.';

    return div;
  }
}

function fillBlockedDate() {
  if (originData.bookingPolicy.blockedDates.length > 0) {
    const container = document.createElement('div');
    container.id = 'blockedDates';
    container.className = 'thin-scroll max-h-100 overflow-y-scroll';

    for (let blockedDate of originData.bookingPolicy.blockedDates) {
      const div = document.createElement('div');
      div.className =
        'bg-primary-50/50 border-2 border-primary-50 rounded-lg mr-2 my-4 px-4 py-2';
      const blockedRange = document.createElement('p');
      blockedRange.className = 'blockedRange text-shark-700 font-semibold';
      blockedRange.textContent =
        '예약 불가 날짜: ' +
        `${blockedDate.startDate} ~ ${blockedDate.endDate}`;

      const blockedReason = document.createElement('p');
      blockedReason.innerHTML = `
      <span>사유 : </span>`;
      blockedReason.className = 'blockedReason text-sm text-shark-600';
      blockedReason.appendChild(
        document.createTextNode(
          blockedDate.reason === 'RESERVATION' ? '예약상태' : '관리자지정',
        ),
      );

      div.append(blockedRange, blockedReason);
      container.appendChild(div);
    }

    return container;
  } else {
    const div = document.createElement('div');
    div.className =
      'min-h-70 flex items-center justify-center bg-primary-50/50 border-2 border-primary-50 rounded-lg text-shark-700 text-sm';
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
