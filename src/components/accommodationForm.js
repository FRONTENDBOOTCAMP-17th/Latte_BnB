import { request } from '../api/client.js';
import { FormImage } from './FormImage.js';
import constants from '../constants.js';

let originData = null;
let modifiedData = null;
let element = null;
let currentMode = constants.FORM_MODE.VIEW;
let thumbnailFile = null;
let thumbnailPreviewUrl = '';
let selectedImageId = null;
const imageMap = new Map();
const blockedDateMap = new Map();

const EMPTY_FORM_DATA = {
  thumbnailUrl: '',
  title: '',
  description: '',
  location: {
    address: '',
    region: '',
  },
  maxGuest: '',
  images: [],
  pricing: {
    adultPrice: '',
    childPrice: '',
    serviceFee: '',
  },
  bookingPolicy: {
    minNights: '',
    blockedDates: [],
  },
};

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function createEmptyFormData() {
  return cloneData(EMPTY_FORM_DATA);
}

function syncBlockedDateMap(blockedDates = []) {
  blockedDateMap.clear();

  for (const blockedDate of blockedDates) {
    blockedDateMap.set(crypto.randomUUID(), { ...blockedDate });
  }
}

function syncModifiedBlockedDatesFromMap() {
  if (!modifiedData) {
    return;
  }

  if (!modifiedData.bookingPolicy) {
    modifiedData.bookingPolicy = {
      minNights: '',
      blockedDates: [],
    };
  }

  modifiedData.bookingPolicy.blockedDates = Array.from(blockedDateMap.values()).map(
    (blockedDate) => ({
      ...blockedDate,
    }),
  );
}

function initializeFormState(mode = constants.FORM_MODE.VIEW) {
  currentMode = mode;
  clearThumbnailFileState();

  if (mode === constants.FORM_MODE.ADD) {
    modifiedData = createEmptyFormData();
    modifiedData.maxGuest = '1';
    modifiedData.bookingPolicy.minNights = '1';
  } else if (originData) {
    modifiedData = cloneData(originData);
  } else {
    modifiedData = createEmptyFormData();
  }

  syncImageMap(modifiedData.images ?? []);
  syncBlockedDateMap(modifiedData.bookingPolicy?.blockedDates ?? []);
}

function formatPrice(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return '';
  }
  return parsed.toLocaleString();
}

function getTodayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function clearThumbnailPreviewUrl() {
  if (thumbnailPreviewUrl) {
    URL.revokeObjectURL(thumbnailPreviewUrl);
    thumbnailPreviewUrl = '';
  }
}

function clearThumbnailFileState() {
  clearThumbnailPreviewUrl();
  thumbnailFile = null;
}

function clearImagePreviewUrls() {
  for (const image of imageMap.values()) {
    if (image.previewUrl) {
      URL.revokeObjectURL(image.previewUrl);
    }
  }
}

function clearImageState() {
  clearImagePreviewUrls();
  imageMap.clear();
  selectedImageId = null;
}

function syncModifiedImagesFromMap() {
  if (!modifiedData) {
    return;
  }

  modifiedData.images = Array.from(imageMap.values()).map((image) => ({
    url: image.url,
    title: image.title,
    description: image.description,
  }));
}

function syncImageMap(images = []) {
  clearImageState();

  for (const image of images) {
    if (!image?.url) {
      continue;
    }

    const id = crypto.randomUUID();
    imageMap.set(id, {
      id,
      url: image.url,
      title: image.title ?? '',
      description: image.description ?? '',
      file: null,
      previewUrl: '',
    });

    if (!selectedImageId) {
      selectedImageId = id;
    }
  }

  syncModifiedImagesFromMap();
}

async function fetchAccommodation(id) {
  const { success, message, data } = await request(
    `/admin/accommodations/${id}`,
    { method: 'GET' },
  );

  originData = success ? data : null;

  return { success, message };
}

function buildViewMode() {
  return buildForm(constants.FORM_MODE.VIEW);
}

function buildForm(mode = constants.FORM_MODE.VIEW) {
  initializeFormState(mode);

  element = document.createElement('div');
  element.id = 'accommodation';
  element.className =
    'min-w-100 w-full max-w-3xl flex flex-col items-center bg-white gap-4 md:rounded-t-2xl pb-10';
  element.append(
    buildThumbnail(mode),
    buildInfo(mode),
    buildDescription(mode),
    buildImages(mode),
    buildPricing(mode),
    buildBooking(mode),
  );

  fillData(mode);
  bindNumberInputControls();
  bindNonNegativeIntegerTextInputs();
  bindBookingControls();

  return element;
}

function buildThumbnail(mode) {
  const thumbnailHTML = document.createElement('div');
  thumbnailHTML.className = 'w-full relative';
  const display = document.createElement('div');
  display.id = 'thumbnailDisplay';
  display.className = 'w-full relative';
  thumbnailHTML.appendChild(display);

  if (mode !== constants.FORM_MODE.VIEW) {
    display.appendChild(buildThumbnailDeleteBtn());
    const thumbnailPanel = document.createElement('div');
    thumbnailPanel.id = 'thumbnailPannel';
    thumbnailPanel.className =
      'relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 mx-2 rounded-xl flex flex-col gap-2';
    thumbnailPanel.innerHTML = `
      <span class="absolute top-0 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">썸네일 수정</span>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="thumbnailURL" class="text-shark-600 text-sm font-semibold">URL</label>
        <input type="text" id="thumbnailURL" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="thumbnailInsertBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">삽입</button>
      </div>
    `;
    thumbnailPanel.appendChild(
      buildImageFileUploader('thumbnail', '썸네일 파일 업로드'),
    );
    thumbnailHTML.appendChild(thumbnailPanel);
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
        <button type="button" id="titleApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
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
        <button type="button" id="addressApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg col-start-3 row-start-3 h-1/2 place-self-end md:h-full md:place-self-auto">주소 적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 items-center gap-2">
        <label for="maxGuestInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">최대 숙박 인원</label>
        <div class="w-full col-span-2 md:col-span-1 flex items-center gap-2">
          <button
            type="button"
            data-number-control="decrement"
            data-target-input="maxGuestInput"
            aria-label="최대 숙박 인원 감소"
            class="h-8 w-8 shrink-0 rounded-full bg-primary-500 text-white text-lg leading-none hover:bg-primary-500/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="pointer-events-none m-auto h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
            </svg>
          </button>
          <input type="number" id="maxGuestInput" min="1" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
          <button
            type="button"
            data-number-control="increment"
            data-target-input="maxGuestInput"
            aria-label="최대 숙박 인원 증가"
            class="h-8 w-8 shrink-0 rounded-full bg-primary-500 text-white text-lg leading-none hover:bg-primary-500/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="pointer-events-none m-auto h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
        <button type="button" id="maxGuestApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
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
      <button type="button" id="descriptionApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
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
  container.appendChild(buildEmptyImage());

  images.appendChild(container);

  if (mode !== constants.FORM_MODE.VIEW) {
    const imageInsertPanel = document.createElement('div');
    imageInsertPanel.id = 'imageInsertPannel';
    imageInsertPanel.className =
      'relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl flex flex-col gap-2';
    imageInsertPanel.innerHTML = `
      <span class="absolute top-0 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">이미지 삽입</span>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="imageURL" class="text-shark-600 text-sm font-semibold">URL</label>
        <input type="text" id="imageURL" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="imageInsertBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">삽입</button>
      </div>
    `;
    imageInsertPanel.appendChild(
      buildImageFileUploader('image', '이미지 파일 업로드', true),
    );

    const imageMetaPanel = document.createElement('div');
    imageMetaPanel.className =
      'relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl flex flex-col gap-2';
    imageMetaPanel.innerHTML = `
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">이미지 이름, 설명 수정</span>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="imageTitleInput" class="text-shark-600 text-sm font-semibold flex-none">제목</label>
        <input type="text" id="imageTitleInput" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="imageTitleApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">적용</button>
      </div>
      <div class="w-full flex flex-nowrap items-center gap-2">
        <label for="imageDescriptionInput" class="text-shark-600 text-sm font-semibold flex-none">설명</label>
        <input type="text" id="imageDescriptionInput" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="imageDescriptionApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg flex-none">적용</button>
      </div>
    `;

    images.append(imageInsertPanel, imageMetaPanel);
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
  serviceFee.className = 'grid grid-cols-subgrid col-span-2';
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
        <input type="text" id="adultPriceInput" inputmode="numeric" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="adultPriceApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="childPriceInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">어린이 가격</label>
        <input type="text" id="childPriceInput" inputmode="numeric" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="childPriceApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="serviceFeeInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">서비스 수수료</label>
        <input type="text" id="serviceFeeInput" inputmode="numeric" class="w-full col-span-2 md:col-span-1 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
        <button type="button" id="serviceFeeApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
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

  const blockedDates = document.createElement('div');
  blockedDates.id = 'blockedDates';
  blockedDates.className = 'thin-scroll max-h-100 overflow-y-scroll';

  booking.append(minNights, blockedDates);

  if (mode !== constants.FORM_MODE.VIEW) {
    booking.innerHTML += `
    <div class="relative border-2 border-primary-200 bg-primary-50 px-4 pb-4 pt-6 mt-5 rounded-xl grid grid-cols-[auto_1fr_max-content] gap-2">
      <span class="absolute top-0 left-4 -translate-y-1/2 text-sm px-2 text-shark-600 bg-white border-primary-200 border-2 rounded-xl">숙소 예약 정책 수정</span>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 items-center gap-2">
        <label for="minNightsInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">최소 숙박 가능일</label>
        <div class="w-full col-span-2 md:col-span-1 flex items-center gap-2">
          <button
            type="button"
            data-number-control="decrement"
            data-target-input="minNightsInput"
            aria-label="최소 숙박 가능일 감소"
            class="h-8 w-8 shrink-0 rounded-full bg-primary-500 text-white text-lg leading-none hover:bg-primary-500/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="pointer-events-none m-auto h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/>
            </svg>
          </button>
          <input type="number" id="minNightsInput" min="1" class="w-full bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
          <button
            type="button"
            data-number-control="increment"
            data-target-input="minNightsInput"
            aria-label="최소 숙박 가능일 증가"
            class="h-8 w-8 shrink-0 rounded-full bg-primary-500 text-white text-lg leading-none hover:bg-primary-500/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" class="pointer-events-none m-auto h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
        <button type="button" id="minNightsApplyBtn" class="bg-primary-500 hover:bg-primary-500/80 text-white text-sm px-2 py-1 rounded-lg">적용</button>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="startDateInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">예약불가 시작일</label>
        <input type="date" id="startDateInput" class="w-full col-span-3 md:col-span-2 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
      </div>
      <div class="w-full grid grid-cols-subgrid col-start-1 -col-end-1 gap-2">
        <label for="endDateInput" class="text-shark-600 text-sm font-semibold col-span-3 md:col-span-1">예약불가 종료일</label>
        <input type="date" id="endDateInput" class="w-full col-span-3 md:col-span-2 bg-white text-shark-600 text-sm rounded-lg px-2 py-1 border-1 border-primary-200"/>
      </div>
      <button type="button" id="blockedDateAddBtn" disabled class="col-span-3 bg-primary-500 hover:bg-primary-500/80 disabled:bg-primary-300 disabled:hover:bg-primary-300 text-white text-sm px-2 py-1 rounded-lg">예약 불가 날짜 추가</button>
    </div>
    `;
  }

  return booking;
}

function fillData(mode = constants.FORM_MODE.VIEW) {
  if (!modifiedData || !element) {
    return;
  }

  const html = getHTMLReference();
  const data = modifiedData;

  renderThumbnail(mode);

  if (html.title) {
    html.title.textContent = data.title || '숙소 이름';
  }
  if (html.address) {
    html.address.textContent = data.location?.address || '주소';
  }
  if (html.region) {
    html.region.textContent = data.location?.region || '지역';
  }
  if (html.maxGuest) {
    html.maxGuest.textContent = data.maxGuest
      ? `최대 ${data.maxGuest}명까지 숙박 가능`
      : '최대 숙박 가능 인원';
  }
  if (html.description) {
    html.description.textContent = data.description || '숙소 설명';
  }

  fillImages(mode, html.imagesContainer, data.images ?? []);

  appendPriceValue(
    html.adultPrice,
    'adultPriceValue',
    'row-start-1 col-start-2',
    formatPrice(data.pricing?.adultPrice),
  );
  appendPriceValue(
    html.childPrice,
    'childPriceValue',
    'row-start-2 col-start-2',
    formatPrice(data.pricing?.childPrice),
  );
  appendPriceValue(
    html.serviceFee,
    'serviceFeeValue',
    'row-start-3 col-start-2',
    formatPrice(data.pricing?.serviceFee),
  );

  if (html.minNights) {
    html.minNights.textContent = data.bookingPolicy?.minNights
      ? `최소 ${data.bookingPolicy.minNights}박부터 예약 가능`
      : '';
  }

  fillBlockedDate(mode, html.blockedDates);

  if (mode !== constants.FORM_MODE.VIEW) {
    fillEditInputs(html, data);
  }
}

function appendPriceValue(target, valueClass, rowClass, amount) {
  if (!target) {
    return;
  }

  target.querySelector(`.${valueClass}`)?.remove();

  if (!amount) {
    return;
  }

  const value = document.createElement('span');
  value.className = `${valueClass} ${rowClass} font-semibold`;
  value.textContent = `: ₩${amount}`;
  target.appendChild(value);
}

function fillEditInputs(html, data) {
  const { region, detailAddress } = splitAddressParts(
    data.location?.region ?? '',
    data.location?.address ?? '',
  );

  if (html.thumbnailURL) {
    html.thumbnailURL.value = data.thumbnailUrl ?? '';
  }
  if (html.titleInput) {
    html.titleInput.value = data.title ?? '';
  }
  if (html.regionInput) {
    html.regionInput.value = region;
  }
  if (html.detailAddressInput) {
    html.detailAddressInput.value = detailAddress;
  }
  if (html.maxGuestInput) {
    html.maxGuestInput.value = data.maxGuest ?? '';
  }
  if (html.descriptionInput) {
    html.descriptionInput.value = data.description ?? '';
  }
  if (html.adultPriceInput) {
    html.adultPriceInput.value = data.pricing?.adultPrice ?? '';
  }
  if (html.childPriceInput) {
    html.childPriceInput.value = data.pricing?.childPrice ?? '';
  }
  if (html.serviceFeeInput) {
    html.serviceFeeInput.value = data.pricing?.serviceFee ?? '';
  }
  if (html.minNightsInput) {
    html.minNightsInput.value = data.bookingPolicy?.minNights ?? '';
  }

  syncSelectedImageInputs();
}

function createThumbnailImage(src) {
  const thumbnail = document.createElement('img');
  thumbnail.src = src;
  thumbnail.alt = '숙소 대표 이미지';
  thumbnail.id = 'thumbnail';
  thumbnail.className = 'w-full md:rounded-t-2xl';
  return thumbnail;
}

function createEmptyThumbnail() {
  const emptyThumbnail = document.createElement('div');
  emptyThumbnail.id = 'emptyThumbnail';
  emptyThumbnail.className =
    'w-full aspect-video text-sm bg-shark-100 text-shark-600 md:rounded-t-2xl flex items-center justify-center';
  emptyThumbnail.textContent = '표시 할 썸네일이 없습니다.';
  return emptyThumbnail;
}

function renderThumbnail(mode = currentMode) {
  if (!element) {
    return;
  }

  const html = getHTMLReference();
  if (!html.thumbnailDisplay) {
    return;
  }

  const deleteBtn = html.thumbnailDeleteBtn;
  html.thumbnailDisplay.replaceChildren();

  if (modifiedData?.thumbnailUrl) {
    html.thumbnailDisplay.appendChild(createThumbnailImage(modifiedData.thumbnailUrl));
  } else {
    html.thumbnailDisplay.appendChild(createEmptyThumbnail());
  }

  if (deleteBtn && mode !== constants.FORM_MODE.VIEW) {
    deleteBtn.classList.toggle('hidden', !modifiedData?.thumbnailUrl);
    html.thumbnailDisplay.appendChild(deleteBtn);
  }
}

function normalizeAddressValue(value) {
  return `${value ?? ''}`.trim().replace(/\s+/g, ' ');
}

function combineAddress(region, detailAddress) {
  const normalizedRegion = normalizeAddressValue(region);
  const normalizedDetail = normalizeAddressValue(detailAddress);
  if (!normalizedRegion) {
    return normalizedDetail;
  }
  if (!normalizedDetail) {
    return normalizedRegion;
  }
  if (normalizedDetail.startsWith(normalizedRegion)) {
    return normalizedDetail;
  }
  return `${normalizedRegion} ${normalizedDetail}`;
}

function splitAddressParts(region, fullAddress) {
  const normalizedRegion = normalizeAddressValue(region);
  const normalizedAddress = normalizeAddressValue(fullAddress);

  if (!normalizedRegion) {
    return {
      region: '',
      detailAddress: normalizedAddress,
    };
  }

  if (normalizedAddress.startsWith(normalizedRegion)) {
    return {
      region: normalizedRegion,
      detailAddress: normalizedAddress.slice(normalizedRegion.length).trim(),
    };
  }

  return {
    region: normalizedRegion,
    detailAddress: normalizedAddress,
  };
}

function syncSelectedImageInputs(options = {}) {
  if (!element) {
    return;
  }

  const html = getHTMLReference();
  const selectedImage = selectedImageId ? imageMap.get(selectedImageId) : null;
  const preserveTitle = options.preserveTitle === true;
  const preserveDescription = options.preserveDescription === true;

  if (html.imageTitleInput && !preserveTitle) {
    html.imageTitleInput.value = selectedImage?.title ?? '';
  }
  if (html.imageDescriptionInput && !preserveDescription) {
    html.imageDescriptionInput.value = selectedImage?.description ?? '';
  }
}

function getNumberStep(input) {
  const rawStep = Number.parseFloat(input.step);
  if (!Number.isFinite(rawStep) || rawStep <= 0) {
    return 1;
  }
  return rawStep;
}

function clampNumberByInput(input, value) {
  let nextValue = value;

  if (input.min !== '') {
    nextValue = Math.max(nextValue, Number.parseFloat(input.min));
  }
  if (input.max !== '') {
    nextValue = Math.min(nextValue, Number.parseFloat(input.max));
  }

  return nextValue;
}

function bindNumberInputControls() {
  if (!element) {
    return;
  }

  const controls = element.querySelectorAll('[data-number-control]');
  for (const button of controls) {
    button.addEventListener('click', () => {
      const inputId = button.dataset.targetInput;
      if (!inputId) {
        return;
      }

      const input = element.querySelector(`#${inputId}`);
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      const step = getNumberStep(input);
      const direction = button.dataset.numberControl === 'decrement' ? -1 : 1;
      const currentValue = Number.parseFloat(input.value);
      const baseValue = Number.isNaN(currentValue) ? 0 : currentValue;
      const nextValue = clampNumberByInput(input, baseValue + direction * step);

      input.value = String(nextValue);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
    });
  }

  const numberInputs = [element.querySelector('#maxGuestInput'), element.querySelector('#minNightsInput')];
  for (const input of numberInputs) {
    if (!(input instanceof HTMLInputElement)) {
      continue;
    }

    input.addEventListener('keydown', (e) => {
      const allowedKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Home',
        'End',
      ];
      if (allowedKeys.includes(e.key) || (e.ctrlKey || e.metaKey)) {
        return;
      }
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener('paste', (e) => {
      const pastedText = e.clipboardData?.getData('text') ?? '';
      if (!/^\d+$/.test(pastedText)) {
        e.preventDefault();
      }
    });

    input.addEventListener('input', () => {
      const onlyDigits = input.value.replace(/[^\d]/g, '');
      if (input.value !== onlyDigits) {
        input.value = onlyDigits;
      }
      if (input.value && Number.parseInt(input.value, 10) < 1) {
        input.value = '1';
      }
    });

    input.addEventListener(
      'wheel',
      (e) => {
        if (document.activeElement === input) {
          e.preventDefault();
        }
      },
      { passive: false },
    );
  }
}

function bindNonNegativeIntegerTextInputs() {
  if (!element) {
    return;
  }

  const integerInputs = [
    element.querySelector('#adultPriceInput'),
    element.querySelector('#childPriceInput'),
    element.querySelector('#serviceFeeInput'),
  ];

  for (const input of integerInputs) {
    if (!(input instanceof HTMLInputElement)) {
      continue;
    }

    input.addEventListener('keydown', (e) => {
      const allowedKeys = [
        'Backspace',
        'Delete',
        'ArrowLeft',
        'ArrowRight',
        'Tab',
        'Home',
        'End',
      ];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
      }
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    });

    input.addEventListener('paste', (e) => {
      const pastedText = e.clipboardData?.getData('text') ?? '';
      if (!/^\d+$/.test(pastedText)) {
        e.preventDefault();
      }
    });

    input.addEventListener('input', () => {
      const onlyDigits = input.value.replace(/[^\d]/g, '');
      if (input.value !== onlyDigits) {
        input.value = onlyDigits;
      }
    });
  }
}

function isDateBlocked(date, ignoredBlockedDateId = null) {
  if (!date) {
    return false;
  }

  for (const [blockedDateId, blockedDate] of blockedDateMap.entries()) {
    if (blockedDateId === ignoredBlockedDateId) {
      continue;
    }

    if (blockedDate.startDate <= date && date <= blockedDate.endDate) {
      return true;
    }
  }

  return false;
}

function doesBlockedDateRangeOverlap(startDate, endDate, ignoredBlockedDateId = null) {
  if (!startDate || !endDate) {
    return false;
  }

  for (const [blockedDateId, blockedDate] of blockedDateMap.entries()) {
    if (blockedDateId === ignoredBlockedDateId) {
      continue;
    }

    if (startDate <= blockedDate.endDate && blockedDate.startDate <= endDate) {
      return true;
    }
  }

  return false;
}

function syncBlockedDateAddButtonState() {
  if (!element) {
    return;
  }

  const html = getHTMLReference();
  if (!html.blockedDateAddBtn) {
    return;
  }

  const canAdd = Boolean(
    html.startDateInput?.value &&
      html.endDateInput?.value &&
      html.startDateInput.value <= html.endDateInput.value,
  );
  html.blockedDateAddBtn.disabled = !canAdd;
}

function bindBookingControls() {
  if (!element) {
    return;
  }

  const html = getHTMLReference();
  const today = getTodayString();

  if (html.startDateInput instanceof HTMLInputElement) {
    html.startDateInput.min = today;
    html.startDateInput.addEventListener('change', () => {
      if (html.startDateInput.value && html.startDateInput.value < today) {
        html.startDateInput.value = '';
      }

      if (html.startDateInput.value && isDateBlocked(html.startDateInput.value)) {
        alert('이미 예약 불가로 설정된 날짜는 선택할 수 없습니다.');
        html.startDateInput.value = '';
      }

      if (
        html.endDateInput instanceof HTMLInputElement &&
        html.startDateInput.value
      ) {
        html.endDateInput.min = html.startDateInput.value;
        if (
          html.endDateInput.value &&
          html.endDateInput.value < html.startDateInput.value
        ) {
          html.endDateInput.value = '';
        }
      }

      syncBlockedDateAddButtonState();
    });
  }

  if (html.endDateInput instanceof HTMLInputElement) {
    html.endDateInput.min = html.startDateInput?.value || today;
    html.endDateInput.addEventListener('change', () => {
      if (html.endDateInput.value && html.endDateInput.value < today) {
        html.endDateInput.value = '';
      }

      if (html.endDateInput.value && isDateBlocked(html.endDateInput.value)) {
        alert('이미 예약 불가로 설정된 날짜는 선택할 수 없습니다.');
        html.endDateInput.value = '';
      }

      if (
        html.startDateInput instanceof HTMLInputElement &&
        html.startDateInput.value &&
        html.endDateInput.value &&
        html.endDateInput.value < html.startDateInput.value
      ) {
        html.endDateInput.value = '';
      }

      syncBlockedDateAddButtonState();
    });
  }

  syncBlockedDateAddButtonState();
}

function fillImages(mode, container, images = [], syncOptions = {}) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (imageMap.size === 0) {
    container.appendChild(buildEmptyImage());
    syncSelectedImageInputs(syncOptions);
    return;
  }

  for (const image of imageMap.values()) {
    const imageHTML = new FormImage(
      image.url,
      mode,
      image.title,
      image.description,
      {
        id: image.id,
        checked: image.id === selectedImageId,
      },
    );
    container.appendChild(imageHTML.getElement());
  }

  syncSelectedImageInputs(syncOptions);
}

function buildEmptyBlockedDate() {
  const div = document.createElement('div');
  div.className =
    'min-h-70 flex items-center justify-center bg-primary-50/50 border-2 border-primary-50 rounded-lg text-shark-700 text-sm';
  div.textContent = '설정된 예약 불가 날짜가 없습니다.';
  return div;
}

function removeThumbnail() {
  if (!modifiedData) {
    return;
  }

  modifiedData.thumbnailUrl = '';
  clearThumbnailFileState();

  const html = getHTMLReference();
  if (html.thumbnailURL) {
    html.thumbnailURL.value = '';
  }
  if (html.thumbnailFileInput) {
    html.thumbnailFileInput.value = '';
  }

  renderThumbnail();
}

function setThumbnailFromUrl(url) {
  if (!modifiedData) {
    return;
  }

  clearThumbnailFileState();
  modifiedData.thumbnailUrl = url.trim();

  const html = getHTMLReference();
  if (html.thumbnailURL) {
    html.thumbnailURL.value = modifiedData.thumbnailUrl;
  }
  if (html.thumbnailFileInput) {
    html.thumbnailFileInput.value = '';
  }

  renderThumbnail();
}

function setThumbnailFromFile(file) {
  if (!modifiedData || !(file instanceof File)) {
    return;
  }

  clearThumbnailPreviewUrl();
  thumbnailFile = file;
  thumbnailPreviewUrl = URL.createObjectURL(file);
  modifiedData.thumbnailUrl = thumbnailPreviewUrl;

  const html = getHTMLReference();
  if (html.thumbnailURL) {
    html.thumbnailURL.value = '';
  }
  if (html.thumbnailFileInput) {
    html.thumbnailFileInput.value = '';
  }

  renderThumbnail();
}

function getThumbnailFile() {
  return thumbnailFile;
}

function addImageEntry({
  url,
  title = '',
  description = '',
  file = null,
  previewUrl = '',
}) {
  if (!url) {
    return;
  }

  const id = crypto.randomUUID();
  imageMap.set(id, {
    id,
    url,
    title,
    description,
    file,
    previewUrl,
  });
  selectedImageId = id;
  syncModifiedImagesFromMap();
}

function addImageFromUrl(url) {
  if (!modifiedData) {
    return;
  }

  const trimmedUrl = url.trim();
  if (!trimmedUrl) {
    return;
  }

  addImageEntry({ url: trimmedUrl });

  const html = getHTMLReference();
  if (html.imageURL) {
    html.imageURL.value = '';
  }
  if (html.imageFileInput) {
    html.imageFileInput.value = '';
  }

  fillImages(currentMode, html.imagesContainer);
}

function addImagesFromFiles(files) {
  if (!modifiedData) {
    return;
  }

  for (const file of files) {
    if (!(file instanceof File)) {
      continue;
    }

    const previewUrl = URL.createObjectURL(file);
    addImageEntry({
      url: previewUrl,
      file,
      previewUrl,
    });
  }

  const html = getHTMLReference();
  if (html.imageURL) {
    html.imageURL.value = '';
  }
  if (html.imageFileInput) {
    html.imageFileInput.value = '';
  }

  fillImages(currentMode, html.imagesContainer);
}

function removeImage(imageId) {
  const image = imageMap.get(imageId);
  if (!image) {
    return;
  }

  if (image.previewUrl) {
    URL.revokeObjectURL(image.previewUrl);
  }

  imageMap.delete(imageId);

  if (selectedImageId === imageId) {
    selectedImageId = imageMap.keys().next().value ?? null;
  }

  syncModifiedImagesFromMap();

  const html = getHTMLReference();
  fillImages(currentMode, html.imagesContainer);
}

function setSelectedImage(imageId) {
  if (!imageMap.has(imageId)) {
    return;
  }

  selectedImageId = imageId;
  syncSelectedImageInputs();
}

function updateSelectedImageTitle(title) {
  if (!selectedImageId) {
    return;
  }

  const image = imageMap.get(selectedImageId);
  if (!image) {
    return;
  }

  image.title = title.trim();
  syncModifiedImagesFromMap();

  const html = getHTMLReference();
  fillImages(currentMode, html.imagesContainer, [], {
    preserveDescription: true,
  });
}

function updateSelectedImageDescription(description) {
  if (!selectedImageId) {
    return;
  }

  const image = imageMap.get(selectedImageId);
  if (!image) {
    return;
  }

  image.description = description.trim();
  syncModifiedImagesFromMap();

  const html = getHTMLReference();
  fillImages(currentMode, html.imagesContainer, [], {
    preserveTitle: true,
  });
}

function getImageFiles() {
  return Array.from(imageMap.values())
    .filter((image) => image.file instanceof File)
    .map((image) => image.file);
}

function updateAccommodationTitle(title) {
  if (!modifiedData) {
    return;
  }

  modifiedData.title = title.trim();
  const html = getHTMLReference();
  if (html.title) {
    html.title.textContent = modifiedData.title || '숙소 이름';
  }
}

function updateAccommodationAddress(region, address) {
  if (!modifiedData) {
    return;
  }

  const normalizedRegion = normalizeAddressValue(region);
  const fullAddress = combineAddress(region, address);

  modifiedData.location = {
    ...(modifiedData.location ?? {}),
    region: normalizedRegion,
    address: fullAddress,
  };

  const html = getHTMLReference();
  if (html.region) {
    html.region.textContent = modifiedData.location.region || '지역';
  }
  if (html.address) {
    html.address.textContent = modifiedData.location.address || '주소';
  }
}

function updateAccommodationMaxGuest(maxGuest) {
  if (!modifiedData) {
    return;
  }

  modifiedData.maxGuest = maxGuest;

  const html = getHTMLReference();
  if (html.maxGuest) {
    html.maxGuest.textContent = modifiedData.maxGuest
      ? `최대 ${modifiedData.maxGuest}명까지 숙박 가능`
      : '최대 숙박 가능 인원';
  }
}

function updateAccommodationDescription(description) {
  if (!modifiedData) {
    return;
  }

  modifiedData.description = description.trim();

  const html = getHTMLReference();
  if (html.description) {
    html.description.textContent = modifiedData.description || '숙소 설명';
  }
}

function updateAccommodationPrice(type, value) {
  if (!modifiedData) {
    return;
  }

  if (!modifiedData.pricing) {
    modifiedData.pricing = {
      adultPrice: '',
      childPrice: '',
      serviceFee: '',
    };
  }

  const sanitizedValue = String(value).replace(/[^\d]/g, '');
  modifiedData.pricing[type] = sanitizedValue;

  const html = getHTMLReference();
  if (type === 'adultPrice') {
    appendPriceValue(
      html.adultPrice,
      'adultPriceValue',
      'row-start-1 col-start-2',
      formatPrice(sanitizedValue),
    );
  } else if (type === 'childPrice') {
    appendPriceValue(
      html.childPrice,
      'childPriceValue',
      'row-start-2 col-start-2',
      formatPrice(sanitizedValue),
    );
  } else if (type === 'serviceFee') {
    appendPriceValue(
      html.serviceFee,
      'serviceFeeValue',
      'row-start-3 col-start-2',
      formatPrice(sanitizedValue),
    );
  }
}

function updateAccommodationMinNights(minNights) {
  if (!modifiedData) {
    return;
  }

  if (!modifiedData.bookingPolicy) {
    modifiedData.bookingPolicy = {
      minNights: '',
      blockedDates: [],
    };
  }

  modifiedData.bookingPolicy.minNights = String(minNights).replace(/[^\d]/g, '');

  const html = getHTMLReference();
  if (html.minNights) {
    html.minNights.textContent = modifiedData.bookingPolicy.minNights
      ? `최소 ${modifiedData.bookingPolicy.minNights}박부터 예약 가능`
      : '';
  }
}

function addBlockedDate(startDate, endDate) {
  if (!modifiedData || !startDate || !endDate) {
    return { success: false, message: '시작일과 종료일을 모두 선택해주세요.' };
  }

  const today = getTodayString();
  if (startDate < today || endDate < today) {
    return { success: false, message: '오늘보다 이전 날짜는 선택할 수 없습니다.' };
  }

  if (endDate < startDate) {
    return { success: false, message: '종료일은 시작일보다 빠를 수 없습니다.' };
  }

  if (
    isDateBlocked(startDate) ||
    isDateBlocked(endDate) ||
    doesBlockedDateRangeOverlap(startDate, endDate)
  ) {
    return {
      success: false,
      message: '이미 예약 불가로 설정된 날짜와 겹치는 기간은 추가할 수 없습니다.',
    };
  }

  blockedDateMap.set(crypto.randomUUID(), {
    startDate,
    endDate,
    reason: 'HOST_BLOCK',
  });
  syncModifiedBlockedDatesFromMap();

  const html = getHTMLReference();
  fillBlockedDate(currentMode, html.blockedDates);

  if (html.startDateInput) {
    html.startDateInput.value = '';
  }
  if (html.endDateInput) {
    html.endDateInput.value = '';
    html.endDateInput.min = getTodayString();
  }

  syncBlockedDateAddButtonState();

  return { success: true };
}

function removeBlockedDate(blockedDateId) {
  if (!blockedDateMap.has(blockedDateId)) {
    return;
  }

  blockedDateMap.delete(blockedDateId);
  syncModifiedBlockedDatesFromMap();

  const html = getHTMLReference();
  fillBlockedDate(currentMode, html.blockedDates);
  syncBlockedDateAddButtonState();
}

function getModifiedData() {
  if (!modifiedData) {
    return null;
  }

  return cloneData(modifiedData);
}

function getOriginData() {
  if (!originData) {
    return null;
  }

  return cloneData(originData);
}

function fillBlockedDate(mode = constants.FORM_MODE.VIEW, container) {
  if (!container) {
    return;
  }

  container.replaceChildren();

  if (blockedDateMap.size === 0) {
    container.appendChild(buildEmptyBlockedDate());
    return;
  }

  for (const [blockedDateId, blockedDate] of blockedDateMap.entries()) {
    const div = document.createElement('div');
    div.dataset.id = blockedDateId;
    div.className =
      'relative bg-primary-50/50 border-2 border-primary-50 rounded-lg mr-2 my-4 px-4 py-2';

    const blockedRange = document.createElement('p');
    blockedRange.className = 'blockedRange text-shark-700 font-semibold';
    blockedRange.textContent = `예약 불가 날짜: ${blockedDate.startDate} ~ ${blockedDate.endDate}`;

    const blockedReason = document.createElement('p');
    blockedReason.className = 'blockedReason text-sm text-shark-600';
    blockedReason.innerHTML = `<span>사유 : </span>`;
    blockedReason.appendChild(
      document.createTextNode(
        blockedDate.reason === 'RESERVATION' ? '예약상태' : '관리자지정',
      ),
    );

    div.append(blockedRange, blockedReason);

    if (mode !== constants.FORM_MODE.VIEW) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className =
        'blockedDateDeleteBtn absolute bg-primary-500 text-white top-1/2 -translate-y-1/2 right-2 hover:bg-primary-500/80 p-2 rounded-lg text-sm';
      button.dataset.id = blockedDateId;
      button.textContent = '삭제';
      div.appendChild(button);
    }

    container.appendChild(div);
  }
}

function getHTMLReference() {
  const thumbnail = element.querySelector('#thumbnail');
  const thumbnailDisplay = element.querySelector('#thumbnailDisplay');
  const thumbnailDeleteBtn = element.querySelector('#thumbnailDeleteBtn');
  const title = element.querySelector('#title');
  const address = element.querySelector('#address');
  const region = element.querySelector('#region');
  const maxGuest = element.querySelector('#maxGuest');
  const description = element.querySelector('#description');
  const images = element.querySelector('#images');
  const imagesContainer = element.querySelector('#imagesContainer');
  const adultPrice = element.querySelector('#adultPrice');
  const childPrice = element.querySelector('#childPrice');
  const serviceFee = element.querySelector('#serviceFee');
  const minNights = element.querySelector('#minNights');
  const booking = element.querySelector('#booking');
  const blockedDates = element.querySelector('#blockedDates');

  const thumbnailURL = element.querySelector('#thumbnailURL');
  const thumbnailInsertBtn = element.querySelector('#thumbnailInsertBtn');
  const thumbnailFileInput = element.querySelector('#thumbnailFile');
  const imageURL = element.querySelector('#imageURL');
  const imageInsertBtn = element.querySelector('#imageInsertBtn');
  const imageFileInput = element.querySelector('#imageFile');
  const imageTitleInput = element.querySelector('#imageTitleInput');
  const imageTitleApplyBtn = element.querySelector('#imageTitleApplyBtn');
  const imageDescriptionInput = element.querySelector('#imageDescriptionInput');
  const imageDescriptionApplyBtn = element.querySelector('#imageDescriptionApplyBtn');
  const titleInput = element.querySelector('#titleInput');
  const titleApplyBtn = element.querySelector('#titleApplyBtn');
  const regionInput = element.querySelector('#regionInput');
  const detailAddressInput = element.querySelector('#detailAddressInput');
  const addressApplyBtn = element.querySelector('#addressApplyBtn');
  const maxGuestInput = element.querySelector('#maxGuestInput');
  const maxGuestApplyBtn = element.querySelector('#maxGuestApplyBtn');
  const descriptionInput = element.querySelector('#descriptionInput');
  const descriptionApplyBtn = element.querySelector('#descriptionApplyBtn');
  const adultPriceInput = element.querySelector('#adultPriceInput');
  const adultPriceApplyBtn = element.querySelector('#adultPriceApplyBtn');
  const childPriceInput = element.querySelector('#childPriceInput');
  const childPriceApplyBtn = element.querySelector('#childPriceApplyBtn');
  const serviceFeeInput = element.querySelector('#serviceFeeInput');
  const serviceFeeApplyBtn = element.querySelector('#serviceFeeApplyBtn');
  const minNightsInput = element.querySelector('#minNightsInput');
  const minNightsApplyBtn = element.querySelector('#minNightsApplyBtn');
  const startDateInput = element.querySelector('#startDateInput');
  const endDateInput = element.querySelector('#endDateInput');
  const blockedDateAddBtn = element.querySelector('#blockedDateAddBtn');

  return {
    thumbnail,
    thumbnailDisplay,
    thumbnailDeleteBtn,
    title,
    address,
    region,
    maxGuest,
    description,
    images,
    imagesContainer,
    adultPrice,
    childPrice,
    serviceFee,
    minNights,
    booking,
    blockedDates,
    thumbnailURL,
    thumbnailInsertBtn,
    thumbnailFileInput,
    imageURL,
    imageInsertBtn,
    imageFileInput,
    imageTitleInput,
    imageTitleApplyBtn,
    imageDescriptionInput,
    imageDescriptionApplyBtn,
    titleInput,
    titleApplyBtn,
    regionInput,
    detailAddressInput,
    addressApplyBtn,
    maxGuestInput,
    maxGuestApplyBtn,
    descriptionInput,
    descriptionApplyBtn,
    adultPriceInput,
    adultPriceApplyBtn,
    childPriceInput,
    childPriceApplyBtn,
    serviceFeeInput,
    serviceFeeApplyBtn,
    minNightsInput,
    minNightsApplyBtn,
    startDateInput,
    endDateInput,
    blockedDateAddBtn,
  };
}

export default {
  fetchAccommodation,
  buildViewMode,
  buildForm,
  removeThumbnail,
  setThumbnailFromUrl,
  setThumbnailFromFile,
  getThumbnailFile,
  addImageFromUrl,
  addImagesFromFiles,
  removeImage,
  setSelectedImage,
  updateSelectedImageTitle,
  updateSelectedImageDescription,
  getImageFiles,
  updateAccommodationTitle,
  updateAccommodationAddress,
  updateAccommodationMaxGuest,
  updateAccommodationDescription,
  updateAccommodationPrice,
  updateAccommodationMinNights,
  addBlockedDate,
  removeBlockedDate,
  getOriginData,
  getModifiedData,
};
