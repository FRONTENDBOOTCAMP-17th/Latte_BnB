import '../../src/style.css';
import toast from '../../src/components/toast.js';
import accommodationForm from '../../src/components/accommodationForm.js';
import constants from '../../src/constants.js';
import adminLogo from '../adminLogo.js';
import { checkAdmin } from '../../src/api/auth.js';
import { imageRequest, request } from '../../src/api/client.js';

checkAdmin();

const content = document.getElementById('content');
const KAKAO_POSTCODE_SCRIPT_URL =
  'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
let postcodeScriptPromise = null;

document.body.prepend(adminLogo.build());
renderAddPage();
bindDelegatedEvents();

function renderAddPage() {
  content.className = 'w-full flex justify-center';
  const formElement = accommodationForm.buildForm(constants.FORM_MODE.ADD);
  formElement.appendChild(buildSubmitButton());
  content.replaceChildren(formElement);

  const regionInput = content.querySelector('#regionInput');
  if (regionInput instanceof HTMLInputElement) {
    regionInput.readOnly = true;
    regionInput.placeholder = '주소 검색을 위해 클릭하세요';
    regionInput.classList.add('cursor-pointer');
  }
}

function buildSubmitButton() {
  const button = document.createElement('button');
  button.id = 'submitAccommodationBtn';
  button.type = 'button';
  button.className =
    'w-3/4 max-w-lg place-self-center font-semibold text-2xl text-white bg-primary-500 hover:bg-primary-500/80 m-5 p-4 rounded-3xl';
  button.textContent = '등록하기';
  return button;
}

function bindDelegatedEvents() {
  content.addEventListener('click', handleClick);
  content.addEventListener('change', handleChange);
}

async function handleClick(e) {
  const regionInput = e.target.closest('#regionInput');
  if (regionInput instanceof HTMLInputElement) {
    await openPostcodePopup(regionInput);
    return;
  }

  const deleteButton = e.target.closest('#thumbnailDeleteBtn');
  if (deleteButton) {
    accommodationForm.removeThumbnail();
    return;
  }

  const insertButton = e.target.closest('#thumbnailInsertBtn');
  if (insertButton) {
    const thumbnailURLInput = content.querySelector('#thumbnailURL');
    const url = thumbnailURLInput?.value.trim() ?? '';
    if (!url) {
      return;
    }

    accommodationForm.setThumbnailFromUrl(url);
    return;
  }

  const imageDeleteButton = e.target.closest('.imageDeleteBtn');
  if (imageDeleteButton) {
    const imageElement = imageDeleteButton.closest('[data-id]');
    const imageId = imageElement?.dataset.id;
    if (!imageId) {
      return;
    }

    accommodationForm.removeImage(imageId);
    return;
  }

  const imageInsertButton = e.target.closest('#imageInsertBtn');
  if (imageInsertButton) {
    const imageURLInput = content.querySelector('#imageURL');
    const url = imageURLInput?.value.trim() ?? '';
    if (!url) {
      return;
    }

    accommodationForm.addImageFromUrl(url);
    return;
  }

  const imageTitleApplyButton = e.target.closest('#imageTitleApplyBtn');
  if (imageTitleApplyButton) {
    const imageTitleInput = content.querySelector('#imageTitleInput');
    accommodationForm.updateSelectedImageTitle(imageTitleInput?.value ?? '');
    return;
  }

  const imageDescriptionApplyButton = e.target.closest(
    '#imageDescriptionApplyBtn',
  );
  if (imageDescriptionApplyButton) {
    const imageDescriptionInput = content.querySelector('#imageDescriptionInput');
    accommodationForm.updateSelectedImageDescription(
      imageDescriptionInput?.value ?? '',
    );
    return;
  }

  const titleApplyButton = e.target.closest('#titleApplyBtn');
  if (titleApplyButton) {
    const titleInput = content.querySelector('#titleInput');
    accommodationForm.updateAccommodationTitle(titleInput?.value ?? '');
    return;
  }

  const addressApplyButton = e.target.closest('#addressApplyBtn');
  if (addressApplyButton) {
    const regionInput = content.querySelector('#regionInput');
    const detailAddressInput = content.querySelector('#detailAddressInput');
    accommodationForm.updateAccommodationAddress(
      regionInput?.value ?? '',
      detailAddressInput?.value ?? '',
    );
    return;
  }

  const maxGuestApplyButton = e.target.closest('#maxGuestApplyBtn');
  if (maxGuestApplyButton) {
    const maxGuestInput = content.querySelector('#maxGuestInput');
    accommodationForm.updateAccommodationMaxGuest(maxGuestInput?.value ?? '');
    return;
  }

  const descriptionApplyButton = e.target.closest('#descriptionApplyBtn');
  if (descriptionApplyButton) {
    const descriptionInput = content.querySelector('#descriptionInput');
    accommodationForm.updateAccommodationDescription(
      descriptionInput?.value ?? '',
    );
    return;
  }

  const adultPriceApplyButton = e.target.closest('#adultPriceApplyBtn');
  if (adultPriceApplyButton) {
    const adultPriceInput = content.querySelector('#adultPriceInput');
    accommodationForm.updateAccommodationPrice(
      'adultPrice',
      adultPriceInput?.value ?? '',
    );
    return;
  }

  const childPriceApplyButton = e.target.closest('#childPriceApplyBtn');
  if (childPriceApplyButton) {
    const childPriceInput = content.querySelector('#childPriceInput');
    accommodationForm.updateAccommodationPrice(
      'childPrice',
      childPriceInput?.value ?? '',
    );
    return;
  }

  const serviceFeeApplyButton = e.target.closest('#serviceFeeApplyBtn');
  if (serviceFeeApplyButton) {
    const serviceFeeInput = content.querySelector('#serviceFeeInput');
    accommodationForm.updateAccommodationPrice(
      'serviceFee',
      serviceFeeInput?.value ?? '',
    );
    return;
  }

  const minNightsApplyButton = e.target.closest('#minNightsApplyBtn');
  if (minNightsApplyButton) {
    const minNightsInput = content.querySelector('#minNightsInput');
    accommodationForm.updateAccommodationMinNights(minNightsInput?.value ?? '');
    return;
  }

  const blockedDateAddButton = e.target.closest('#blockedDateAddBtn');
  if (blockedDateAddButton) {
    const startDateInput = content.querySelector('#startDateInput');
    const endDateInput = content.querySelector('#endDateInput');
    const result = accommodationForm.addBlockedDate(
      startDateInput?.value ?? '',
      endDateInput?.value ?? '',
    );
    if (!result.success && result.message) {
      alert(result.message);
    }
    return;
  }

  const blockedDateDeleteButton = e.target.closest('.blockedDateDeleteBtn');
  if (blockedDateDeleteButton) {
    const blockedDateId = blockedDateDeleteButton.dataset.id;
    if (!blockedDateId) {
      return;
    }

    accommodationForm.removeBlockedDate(blockedDateId);
    return;
  }

  const submitButton = e.target.closest('#submitAccommodationBtn');
  if (submitButton) {
    await submitAccommodation(submitButton);
  }
}

function handleChange(e) {
  const fileInput = e.target.closest('#thumbnailFile');
  if (fileInput instanceof HTMLInputElement) {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }

    accommodationForm.setThumbnailFromFile(file);
    return;
  }

  const imageFileInput = e.target.closest('#imageFile');
  if (imageFileInput instanceof HTMLInputElement) {
    const files = Array.from(imageFileInput.files ?? []);
    if (files.length === 0) {
      return;
    }

    accommodationForm.addImagesFromFiles(files);
    return;
  }

  const imageRadio = e.target.closest('input[name="image"]');
  if (imageRadio instanceof HTMLInputElement) {
    accommodationForm.setSelectedImage(imageRadio.value);
  }
}

function getRequiredMessages(modified) {
  const messages = [];
  const title = modified.title?.trim() ?? '';
  const region = modified.location?.region?.trim() ?? '';
  const maxGuest = Number.parseInt(modified.maxGuest, 10);
  const adultPrice = `${modified.pricing?.adultPrice ?? ''}`.trim();
  const childPrice = `${modified.pricing?.childPrice ?? ''}`.trim();

  if (!title) {
    messages.push('숙소 이름');
  }
  if (!region) {
    messages.push('지역');
  }
  if (!Number.isFinite(maxGuest) || maxGuest < 1) {
    messages.push('최대 수용 인원');
  }
  if (!adultPrice) {
    messages.push('성인 1박 요금');
  }
  if (!childPrice) {
    messages.push('어린이 1박 요금');
  }

  return messages;
}

function buildRequestPayload(modified) {
  const payload = {
    title: modified.title.trim(),
    region: modified.location?.region?.trim() ?? '',
    maxGuest: Number.parseInt(modified.maxGuest, 10),
    adultPrice: Number.parseInt(modified.pricing?.adultPrice, 10),
    childPrice: Number.parseInt(modified.pricing?.childPrice, 10),
  };

  const address = modified.location?.address?.trim() ?? '';
  if (address) {
    payload.address = address;
  }

  const description = modified.description?.trim() ?? '';
  if (description) {
    payload.description = description;
  }

  const serviceFee = `${modified.pricing?.serviceFee ?? ''}`.trim();
  if (serviceFee) {
    payload.serviceFee = Number.parseInt(serviceFee, 10);
  }

  const minNights = Number.parseInt(modified.bookingPolicy?.minNights, 10);
  if (Number.isFinite(minNights) && minNights >= 1) {
    payload.minNights = minNights;
  }

  const blockedDates = Array.isArray(modified.bookingPolicy?.blockedDates)
    ? modified.bookingPolicy.blockedDates
    : [];
  if (blockedDates.length > 0) {
    const sanitizedBlockedDates = blockedDates
      .filter(
        (blockedDate) =>
          blockedDate?.startDate &&
          blockedDate?.endDate &&
          blockedDate.startDate <= blockedDate.endDate,
      )
      .map((blockedDate) => ({
        startDate: blockedDate.startDate,
        endDate: blockedDate.endDate,
        reason:
          blockedDate.reason === 'RESERVATION' ? 'RESERVATION' : 'HOST_BLOCK',
      }));
    if (sanitizedBlockedDates.length > 0) {
      payload.blockedDates = sanitizedBlockedDates;
    }
  }

  return payload;
}

function ensurePostcodeScriptLoaded() {
  if (window.kakao?.Postcode || window.daum?.Postcode) {
    return Promise.resolve();
  }

  if (postcodeScriptPromise) {
    return postcodeScriptPromise;
  }

  postcodeScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kakao-postcode]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('kakao postcode load failed')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_POSTCODE_SCRIPT_URL;
    script.async = true;
    script.dataset.kakaoPostcode = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('kakao postcode load failed')),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return postcodeScriptPromise;
}

function getPostcodeConstructor() {
  return window.kakao?.Postcode ?? window.daum?.Postcode ?? null;
}

async function openPostcodePopup(regionInput) {
  try {
    await ensurePostcodeScriptLoaded();
  } catch (error) {
    toast.warn('주소 검색 실패', '카카오 우편번호 스크립트를 불러오지 못했습니다.', 4);
    return;
  }

  const Postcode = getPostcodeConstructor();
  if (!Postcode) {
    toast.warn('주소 검색 실패', '카카오 우편번호를 사용할 수 없습니다.', 4);
    return;
  }

  new Postcode({
    oncomplete(data) {
      const selectedAddress =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      regionInput.value = `${selectedAddress ?? ''}`.trim();
      const detailInput = content.querySelector('#detailAddressInput');
      detailInput?.focus();
    },
  }).open();
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await imageRequest('/admin/accommodations/images', {
    method: 'POST',
    body: formData,
  });
  return data.imageUrl;
}

async function applyThumbnailUpload(requestData, modified) {
  const thumbnailFile = accommodationForm.getThumbnailFile();
  if (thumbnailFile) {
    requestData.thumbnailUrl = await uploadImage(thumbnailFile);
    return;
  }

  const thumbnailUrl = `${modified.thumbnailUrl ?? ''}`.trim();
  if (thumbnailUrl && !thumbnailUrl.startsWith('blob:')) {
    requestData.thumbnailUrl = thumbnailUrl;
  }
}

async function applyImageUploads(requestData, modified) {
  const images = Array.isArray(modified.images) ? modified.images : [];
  if (images.length === 0) {
    return;
  }

  const files = accommodationForm.getImageFiles();
  let fileIndex = 0;
  const uploadedImages = [];

  for (const image of images) {
    const sourceUrl = `${image.url ?? ''}`.trim();
    if (!sourceUrl) {
      continue;
    }

    let finalUrl = sourceUrl;
    if (sourceUrl.startsWith('blob:')) {
      const file = files[fileIndex++];
      if (!file) {
        continue;
      }
      finalUrl = await uploadImage(file);
    }

    uploadedImages.push({
      url: finalUrl,
      title: image.title ?? '',
      description: image.description ?? '',
    });
  }

  if (uploadedImages.length > 0) {
    requestData.images = uploadedImages;
  }
}

async function submitAccommodation(button) {
  const modified = accommodationForm.getModifiedData();
  if (!modified) {
    toast.warn('등록 실패', '숙소 데이터를 불러오지 못했습니다.', 5);
    return;
  }

  const requiredMessages = getRequiredMessages(modified);
  if (requiredMessages.length > 0) {
    toast.warn(
      '필수 값 입력',
      `${requiredMessages.join(', ')} 필드는 필수로 입력해야합니다.`,
      5,
    );
    return;
  }

  button.disabled = true;
  try {
    const requestData = buildRequestPayload(modified);
    await applyThumbnailUpload(requestData, modified);
    await applyImageUploads(requestData, modified);

    const { success, message } = await request('/admin/accommodations', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });

    if (success) {
      toast.success('숙소 추가 성공', message, 2);
      location.replace('/admin/');
    }
  } catch (error) {
    const errorMessage = error?.data?.message ?? error.message;
    toast.warn('숙소 등록 실패', errorMessage, 5);
  } finally {
    button.disabled = false;
  }
}
