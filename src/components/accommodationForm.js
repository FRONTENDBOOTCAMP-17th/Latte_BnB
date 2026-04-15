import { request } from '../api/client.js';
import { FormImage } from './FormImage.js';
import constants from '../constants.js';

let originData = null;
let modifiedData = null;
let element = null;
const imageMap = new Map();

async function fetchAccommodation(id) {
  const { success, message, data } = await request(
    `/admin/accommodations/${id}`,
    { method: 'GET' },
  );

  originData = data;

  return { success, message };
}

function buildViewMode() {
  element = document.createElement('div');
  element.id = 'accommodation';
  element.className =
    'min-w-100 w-full max-w-3xl flex flex-col items-center bg-white gap-4 md:rounded-t-2xl pb-10';
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

function buildForm(mode = constants.FORM_MODE.VIEW) {
  // if (mode === Mode.VIEW) {
  //   return buildViewMode();
  // }

  if (originData && mode === constants.FORM_MODE.EDIT) {
    modifiedData = JSON.parse(JSON.stringify(originData));
  }

  element = document.createElement('div');
  element.id = 'accommodation';
  element.className =
    'min-w-100 w-full max-w-3xl flex flex-col items-center bg-white gap-4 md:rounded-t-2xl pb-10';
  // element.innerHTML = `
  //   ${buildThumbnail(mode)}
  // `;
  element.append(
    buildThumbnail(mode),
    buildInfo(mode),
    buildDescription(mode),
    buildImages(mode),
    buildPricing(mode),
    buildBooking(mode),
  );

  return element;
}

function buildThumbnail(mode) {
  const thumbnailHTML = document.createElement('div');
  thumbnailHTML.className = 'w-full relative';
  switch (mode) {
    case constants.FORM_MODE.VIEW:
      thumbnailHTML.innerHTML = `
      <img src="${originData.thumbnailUrl}" alt="숙소 대표 이미지" id="thumbnail" class="w-full md:rounded-t-2xl"/>
      `;
      break;
    case constants.FORM_MODE.EDIT:
      thumbnailHTML.innerHTML = `
      <img src="${originData.thumbnailUrl}" alt="숙소 대표 이미지" id="thumbnail" class="w-full md:rounded-t-2xl"/>
      `;
      thumbnailHTML.appendChild(buildThumbnailDeleteBtn());
      break;
    case constants.FORM_MODE.ADD:
      thumbnailHTML.innerHTML = `
      <div id="emptyThumbnail" class="w-full aspect-video text-sm bg-shark-100 text-shark-600 md:rounded-t-2xl flex items-center justify-center">표시 할 썸네일이 없습니다.</div>
      `;
      thumbnailHTML.appendChild(buildThumbnailDeleteBtn());
      break;
  }

  if (mode !== constants.FORM_MODE.VIEW) {
    thumbnailHTML.innerHTML += `
    <div id="thumbnailPannel" class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 mx-2 rounded-xl flex flex-col gap-2">
      <span class="absolute top-0 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">썸네일 수정</span>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="thumbnailURL" class="text-shark-600 text-sm font-semibold">URL</label>
        <input type="text" id="thumbnailURL" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">삽입</button>
      </div>
    </div>
    `;
    thumbnailHTML
      .querySelector('#thumbnailPannel')
      .appendChild(buildImageFileUploader('thumbnail', '썸네일 파일 업로드'));
  }

  return thumbnailHTML;
}
function buildThumbnailDeleteBtn() {
  const button = document.createElement('button');
  button.id = 'thumbnailDeleteBtn';
  button.className =
    'absolute border-2 border-primary-700 bg-primary-500 text-white top-2 right-2 hover:bg-primary-500/80 p-1 rounded-xl';
  button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pointer-events-none">
        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>`;
  return button;
}
function buildInfo(mode) {
  const infoContainer = document.createElement('div');
  infoContainer.className = 'w-full';

  const mainInfoHTML = document.createElement('div');
  mainInfoHTML.id = 'mainInfo';
  mainInfoHTML.className = 'text-center';
  mainInfoHTML.innerHTML = `
  <h1 id="title" class="scroll-m-20 text-shark-700 text-center text-4xl font-extrabold tracking-tight text-balance">숙소 이름</h1>
  <p id="address" class="leading-7 text-shark-700 [&:not(:first-child)]:mt-6 text-sm">주소</p>
  `;

  const subInfoHTML = document.createElement('div');
  subInfoHTML.id = 'subInfo';
  subInfoHTML.innerHTML = `
  <span id="region" class="leading-7 text-shark-700 [&:not(:first-child)]:mt-6 text-sm">지역</span>
  <span class="leading-7 text-shark-700 [&:not(:first-child)]:mt-6 text-sm">·</span>
  <span id="maxGuest" class="leading-7 text-shark-700 [&:not(:first-child)]:mt-6 text-sm">최대 숙박 가능 인원</span>
  `;

  mainInfoHTML.append(subInfoHTML);
  infoContainer.append(mainInfoHTML);

  if (mode !== constants.FORM_MODE.VIEW) {
    infoContainer.innerHTML += `
    <div class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 mx-2 rounded-xl grid grid-cols-[auto_1fr_max-content] gap-2">
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">숙소 주요 정보 수정</span>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="titleInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">숙소 이름</label>
        <input type="text" id="titleInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="contents">
        <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 items-center gap-2">
          <label for="regionInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">지역</label>
          <input type="text" id="regionInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        </div>
        <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 row-start-3 items-center gap-2">
          <label for="detailAddressInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">상세 주소</label>
          <input type="text" id="detailAddressInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        </div>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg col-start-3 row-start-3 h-1/2 place-self-end md:h-full md:place-self-auto">주소 적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 items-center gap-2">
        <label for="maxGuestInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">최대 숙박 인원</label>
        <input type="number" id="maxGuestInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
    </div>
    `;
  }

  return infoContainer;
}
function buildDescription(mode) {
  const descriptionContainer = document.createElement('div');
  descriptionContainer.className = 'w-full';

  const description = document.createElement('p');
  description.id = 'description';
  description.className =
    'leading-7 text-center text-shark-700 [&:not(:first-child)]:mt-6 mx-4';
  description.textContent = '숙소 설명';

  descriptionContainer.append(description);

  if (mode !== constants.FORM_MODE.VIEW) {
    descriptionContainer.innerHTML += `
    <div class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 mx-2 rounded-xl flex flex-col gap-2">
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">숙소 설명 수정</span>
      <textarea id="descriptionInput" class="w-full resize-none min-h-30 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"></textarea>
      <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
    </div>
    `;
  }

  return descriptionContainer;
}

function buildImages(mode) {
  const images = document.createElement('div');
  images.id = 'images';
  images.className = 'w-full px-2';
  images.innerHTML = `<h2 class="scroll-m-20 border-b border-b-shark-200 pb-2 text-3xl text-shark-700 font-semibold tracking-tight first:mt-0 mb-2">숙박장소</h2>`;

  const container = document.createElement('div');
  container.id = 'imagesContainer';
  container.className =
    'w-full flex flex-nowrap gap-5 overflow-x-auto thin-scroll py-4';

  if (mode === constants.FORM_MODE.EDIT || mode === constants.FORM_MODE.VIEW) {
    if (originData.images.length > 0) {
      for (const image of originData.images) {
        if (!image.url) {
          continue;
        }
        const imageHTML = new FormImage(
          image.url,
          mode,
          image.title,
          image.description,
        );
        imageMap.set(imageHTML.getId(), imageHTML);
        container.appendChild(imageHTML.getElement());
      }
    } else {
      container.appendChild(buildEmptyImage());
    }
  } else if (mode === constants.FORM_MODE.ADD) {
    container.appendChild(buildEmptyImage());
  }

  images.appendChild(container);

  if (mode !== constants.FORM_MODE.VIEW) {
    images.innerHTML += `
    <div id="imageInsertPannel" class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl flex flex-col gap-2">
      <span class="absolute top-0 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">이미지 삽입</span>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="imageURL" class="text-shark-600 text-sm font-semibold">URL</label>
        <input type="text" id="imageURL" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">삽입</button>
      </div>
    </div>
    <div class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl flex flex-col gap-2">
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">이미지 이름, 설명 수정</span>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="imageTitleInput" class="text-shark-600 text-sm font-semibold flex-none">제목</label>
        <input type="text" id="imageTitleInput" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">적용</button>
      </div>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="imageDescriptionInput" class="text-shark-600 text-sm font-semibold flex-none">설명</label>
        <input type="text" id="imageDescriptionInput" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">적용</button>
      </div>
    </div>
    `;
    images
      .querySelector('#imageInsertPannel')
      .appendChild(buildImageFileUploader('image', '이미지 파일 업로드', true));
  }

  return images;
}

function buildEmptyImage() {
  const div = document.createElement('div');
  div.className =
    'min-h-70 min-w-50 w-full flex items-center justify-center bg-shark-100 border-2 border-shark-200 rounded-lg text-shark-600 text-sm';
  div.textContent = '숙박장소 이미지가 없습니다.';
  return div;
}

function buildImageFileUploader(id, content, multiple = false) {
  const fragment = document.createDocumentFragment();

  const input = document.createElement('input');
  input.type = 'file';
  input.id = `${id}File`;
  input.className = 'hidden';
  input.accept = 'image/*';
  if (multiple) {
    input.multiple = true;
  }
  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files ?? []);

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxSize = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.type)) {
        alert('jpg, png, webp, gif 파일만 업로드 가능합니다.');
        e.target.value = '';
        return;
      }

      if (file.size > maxSize) {
        alert('파일 크기는 5MB 이하여야 합니다.');
        e.target.value = '';
        return;
      }
    }
  });

  const button = document.createElement('button');
  button.type = 'button';
  button.id = `${id}UploadBtn`;
  button.className =
    'bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg';
  button.textContent = content;
  button.addEventListener('click', () => {
    input.click();
  });

  fragment.append(input, button);

  return fragment;
}

function buildPricing(mode) {
  const pricing = document.createElement('div');
  pricing.id = 'pricing';
  pricing.className = 'px-2 w-full';
  pricing.innerHTML = `<h2 class="scroll-m-20 border-b border-b-shark-200 pb-2 text-3xl text-shark-700 font-semibold tracking-tight first:mt-0 mb-2">가격정책 (단위: 원)</h2>`;

  const pricingContent = document.createElement('div');
  pricingContent.id = 'pricingContent';
  pricingContent.className = 'grid grid-cols-[max-content_1fr] text-shark-700';

  const adultPrice = document.createElement('p');
  adultPrice.id = 'adultPrice';
  adultPrice.className = 'grid grid-cols-subgrid col-span-2';
  adultPrice.innerHTML = `
  <span class="row-start-1 col-start-1 flex justify-between gap-2 mr-1">
     <span>성</span>
     <span>인</span>
     : ₩
   </span>
  `;

  const childPrice = document.createElement('p');
  childPrice.id = 'childPrice';
  childPrice.className = 'grid grid-cols-subgrid col-span-2';
  childPrice.innerHTML = `
  <span class="row-start-2 col-start-1 flex justify-between gap-2 mr-1">
    <span>어</span>
    <span>린</span>
    <span>이</span>
    : ₩
  </span>
  `;

  const serviceFee = document.createElement('p');
  serviceFee.id = 'serviceFee';
  serviceFee.classname = 'grid grid-cols-subgrid col-span-2';
  serviceFee.innerHTML = `
  <span class="row-start-3 col-start-1 flex justify-between gap-2 mr-1">
    <span>서비스</span>
    <span>수수료</span>
    : ₩
  </span>
  `;

  pricingContent.append(adultPrice, childPrice, serviceFee);
  pricing.appendChild(pricingContent);

  if (mode !== constants.FORM_MODE.VIEW) {
    pricing.innerHTML += `
    <div class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl grid grid-cols-[auto_1fr_max-content] gap-2">
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">숙소 가격 정책 수정</span>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="adultPriceInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">성인 가격</label>
        <input type="text" id="adultPriceInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="childPriceInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">어린이 가격</label>
        <input type="text" id="childPriceInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="serviceFeeInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">서비스 수수료</label>
        <input type="text" id="serviceFeeInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
    </div>
    `;
  }

  return pricing;
}

function buildBooking(mode) {
  const booking = document.createElement('div');
  booking.id = 'booking';
  booking.className = 'w-full px-2';
  booking.innerHTML = `<h2 class="scroll-m-20 border-b border-b-shark-200 pb-2 text-3xl text-shark-700 font-semibold tracking-tight first:mt-0 mb-2">예약정책</h2>`;

  const minNights = document.createElement('p');
  minNights.id = 'minNights';
  minNights.className = 'text-lg text-shark-700 mb-2 mt-4';

  booking.appendChild(minNights);
  booking.appendChild(fillBlockedDate(mode));

  if (mode !== constants.FORM_MODE.VIEW) {
    booking.innerHTML += `
    <div class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl grid grid-cols-[auto_1fr_max-content] gap-2">
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">숙소 예약 정책 수정</span>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 items-center gap-2">
        <label for="minNightsInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">최소 숙박 가능일</label>
        <input type="number" id="minNightsInput" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="startDateInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">예약불가 시작일</label>
        <input type="date" id="startDateInput" class="w-full col-span-3 md:col-span-2 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="endDateInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">예약불가 종료일</label>
        <input type="date" id="endDateInput" class="w-full col-span-3 md:col-span-2 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
      </div>
      <button type="button" class="col-span-3 bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">예약 불가 날짜 추가</button>
    </div>
    `;
  }

  return booking;
}

function fillData(mode = constants.FORM_MODE.VIEW) {
  if (mode === constants.FORM_MODE.ADD) {
    return;
  }

  const html = getHTMLReference();

  if (mode === constants.FORM_MODE.EDIT) {
  } else if (mode === constants.FORM_MODE.VIEW) {
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

function fillBlockedDate(mode = constants.FORM_MODE.VIEW) {
  if (originData !== null && originData.bookingPolicy.blockedDates.length > 0) {
    const container = document.createElement('div');
    container.id = 'blockedDates';
    container.className = 'thin-scroll max-h-100 overflow-y-scroll';

    for (let blockedDate of originData.bookingPolicy.blockedDates) {
      const div = document.createElement('div');
      div.className =
        'relative bg-primary-50/50 border-2 border-primary-50 rounded-lg mr-2 my-4 px-4 py-2';
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

      if (
        mode === constants.FORM_MODE.EDIT ||
        mode === constants.FORM_MODE.ADD
      ) {
        const button = document.createElement('button');
        button.className =
          'absolute bg-primary-500 text-white top-1/2 -translate-y-1/2 right-2 hover:bg-primary-500/80 p-2 rounded-lg text-sm';
        button.textContent = '삭제';
        div.appendChild(button);
      }

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

export default { fetchAccommodation, buildViewMode, buildForm };
