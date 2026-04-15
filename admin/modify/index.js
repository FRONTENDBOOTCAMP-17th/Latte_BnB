import '../../src/style.css';
import toast from '../../src/components/toast.js';
import accommodationForm from '../../src/components/accommodationForm.js';
import constants from '../../src/constants.js';
import adminLogo from '../adminLogo.js';
import { checkAdmin } from '../../src/api/auth.js';
import { imageRequest, request } from '../../src/api/client.js';

checkAdmin();

const params = new URLSearchParams(location.search);
const accommodationId = Number.parseInt(params.get('id') ?? '', 10);
const content = document.getElementById('content');
const backHref = Number.isFinite(accommodationId)
  ? `/admin/accommodation/?id=${accommodationId}`
  : '/admin/';

document.body.prepend(adminLogo.build());
document.body.prepend(buildHistoryBackButton(backHref));

if (!Number.isFinite(accommodationId)) {
  location.replace('/admin/');
} else {
  bindDelegatedEvents();
  loadAccommodationForEdit();
}

function canNavigateBack() {
  if (history.length <= 1 || !document.referrer) {
    return false;
  }

  try {
    return new URL(document.referrer).origin === location.origin;
  } catch {
    return false;
  }
}

function buildHistoryBackButton(fallbackHref) {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', '뒤로가기');
  button.className =
    'fixed top-4 left-4 z-100 rounded-full bg-primary-500 hover:bg-primary-500/80 text-white p-2';
  button.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.75 19.25 3.5 12m0 0 7.25-7.25M3.5 12h17" />
  </svg>
  `;
  button.addEventListener('click', () => {
    if (canNavigateBack()) {
      history.back();
      return;
    }
    location.href = fallbackHref;
  });
  return button;
}

async function loadAccommodationForEdit() {
  try {
    const { success, message } = await accommodationForm.fetchAccommodation(
      String(accommodationId),
    );
    if (!success) {
      toast.warn('숙소 조회 실패', message, 4);
      setTimeout(() => {
        location.replace('/admin/');
      }, 1200);
      return;
    }

    renderEditPage();
  } catch (error) {
    const errorMessage = error?.data?.message ?? error.message;
    toast.warn('숙소 조회 실패', errorMessage, 4);
    setTimeout(() => {
      location.replace('/admin/');
    }, 1200);
  }
}

function renderEditPage() {
  content.className = 'w-full flex justify-center';
  const formElement = accommodationForm.buildForm(constants.FORM_MODE.EDIT);
  formElement.appendChild(buildSubmitButton());
  content.replaceChildren(formElement);
}

function buildSubmitButton() {
  const button = document.createElement('button');
  button.id = 'submitAccommodationEditBtn';
  button.type = 'button';
  button.className =
    'w-3/4 max-w-lg place-self-center font-semibold text-2xl text-white bg-primary-500 hover:bg-primary-500/80 m-5 p-4 rounded-3xl';
  button.textContent = '수정하기';
  return button;
}

function bindDelegatedEvents() {
  content.addEventListener('click', handleClick);
  content.addEventListener('change', handleChange);
}

async function handleClick(e) {
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
    const imageDescriptionInput = content.querySelector(
      '#imageDescriptionInput',
    );
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

  const submitButton = e.target.closest('#submitAccommodationEditBtn');
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

function buildRequestPayload(data) {
  const payload = {
    title: data.title.trim(),
    region: data.location?.region?.trim() ?? '',
    maxGuest: Number.parseInt(data.maxGuest, 10),
    adultPrice: Number.parseInt(data.pricing?.adultPrice, 10),
    childPrice: Number.parseInt(data.pricing?.childPrice, 10),
  };

  const address = data.location?.address?.trim() ?? '';
  if (address) {
    payload.address = address;
  }

  const description = data.description?.trim() ?? '';
  if (description) {
    payload.description = description;
  }

  const serviceFee = `${data.pricing?.serviceFee ?? ''}`.trim();
  if (serviceFee) {
    payload.serviceFee = Number.parseInt(serviceFee, 10);
  }

  const minNights = Number.parseInt(data.bookingPolicy?.minNights, 10);
  if (Number.isFinite(minNights) && minNights >= 1) {
    payload.minNights = minNights;
  }

  const blockedDates = Array.isArray(data.bookingPolicy?.blockedDates)
    ? data.bookingPolicy.blockedDates
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getSafeArray(value) {
  return Array.isArray(value) ? value : [];
}

function mergeAccommodationData(origin, modified) {
  const originImages = getSafeArray(origin?.images);
  const modifiedImages = getSafeArray(modified?.images);
  const originBlockedDates = getSafeArray(origin?.bookingPolicy?.blockedDates);
  const modifiedBlockedDates = getSafeArray(
    modified?.bookingPolicy?.blockedDates,
  );

  return {
    ...clone(origin ?? {}),
    ...clone(modified ?? {}),
    thumbnailUrl: `${modified?.thumbnailUrl ?? origin?.thumbnailUrl ?? ''}`,
    location: {
      ...(origin?.location ?? {}),
      ...(modified?.location ?? {}),
    },
    pricing: {
      ...(origin?.pricing ?? {}),
      ...(modified?.pricing ?? {}),
    },
    bookingPolicy: {
      ...(origin?.bookingPolicy ?? {}),
      ...(modified?.bookingPolicy ?? {}),
      blockedDates:
        modifiedBlockedDates.length > 0 || originBlockedDates.length === 0
          ? modifiedBlockedDates
          : originBlockedDates,
    },
    images:
      modifiedImages.length > 0 || originImages.length === 0
        ? modifiedImages
        : originImages,
  };
}

function normalizeMediaUrl(url) {
  const trimmed = `${url ?? ''}`.trim();
  if (!trimmed) {
    return '';
  }
  if (trimmed.startsWith('blob:')) {
    return '__blob__';
  }
  return trimmed;
}

function buildComparablePayload(data) {
  const payload = buildRequestPayload(data);
  payload.thumbnailUrl = normalizeMediaUrl(data.thumbnailUrl);

  const images = Array.isArray(data.images) ? data.images : [];
  payload.images = images
    .map((image) => ({
      url: normalizeMediaUrl(image?.url),
      title: image?.title ?? '',
      description: image?.description ?? '',
    }))
    .filter((image) => image.url);

  return payload;
}

function hasAccommodationChanged(origin, modified) {
  const originComparable = buildComparablePayload(origin);
  const modifiedComparable = buildComparablePayload(modified);
  return (
    JSON.stringify(originComparable) !== JSON.stringify(modifiedComparable)
  );
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

  requestData.images = uploadedImages;
}

async function submitAccommodation(button) {
  const origin = accommodationForm.getOriginData();
  const modified = accommodationForm.getModifiedData();
  if (!origin || !modified) {
    toast.warn('수정 실패', '숙소 데이터를 불러오지 못했습니다.', 5);
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

  if (!hasAccommodationChanged(origin, modified)) {
    toast.message(
      '변경 사항 없음',
      '수정된 내용이 없어 저장 요청을 생략했습니다.',
      3,
    );
    return;
  }

  button.disabled = true;
  try {
    const merged = mergeAccommodationData(origin, modified);
    const requestData = buildRequestPayload(merged);
    await applyThumbnailUpload(requestData, merged);
    await applyImageUploads(requestData, merged);

    const { success, message } = await request(
      `/admin/accommodations/${accommodationId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(requestData),
      },
    );

    if (success) {
      toast.success('숙소 수정 성공', message, 2);
      location.replace(`/admin/accommodation/?id=${accommodationId}`);
    }
  } catch (error) {
    const errorMessage = error?.data?.message ?? error.message;
    toast.warn('숙소 수정 실패', errorMessage, 5);
  } finally {
    button.disabled = false;
  }
}
