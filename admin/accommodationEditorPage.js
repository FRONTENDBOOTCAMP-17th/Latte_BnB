import toast from '../src/components/toast.js';
import accommodationForm from '../src/components/accommodationForm.js';
import { checkAdmin } from '../src/api/auth.js';
import { imageRequest, request } from '../src/api/client.js';
import { buildHistoryBackButton } from '../src/components/historyBackButton.js';
import {
  makeRegionInputSearchable,
  openPostcodePopup,
} from '../src/components/postcodeSearch.js';
import adminLogo from './adminLogo.js';

const CONTENT_CLASS_NAME = 'w-full flex justify-center';
const BOUND_DATASET_KEY = 'accommodationEditorBound';
const SUBMIT_BUTTON_CLASS_NAME =
  'w-3/4 max-w-lg place-self-center font-semibold text-2xl text-white bg-primary-500 hover:bg-primary-500/80 m-5 p-4 rounded-3xl';

export function initializeAccommodationEditorLayout({ backHref } = {}) {
  checkAdmin();

  document.body.prepend(adminLogo.build());
  if (backHref) {
    document.body.prepend(buildHistoryBackButton(backHref));
  }
}

export function mountAccommodationEditor({
  content,
  formMode,
  submitButtonId,
  submitButtonText,
  onSubmit,
}) {
  if (!content) {
    return;
  }

  content.className = CONTENT_CLASS_NAME;

  const formElement = accommodationForm.buildForm(formMode);
  formElement.appendChild(
    buildSubmitButton({
      id: submitButtonId,
      text: submitButtonText,
    }),
  );
  content.replaceChildren(formElement);

  const regionInput = content.querySelector('#regionInput');
  if (regionInput) {
    makeRegionInputSearchable(regionInput);
  }

  bindAccommodationEditorEvents({ content, submitButtonId, onSubmit });
}

function buildSubmitButton({ id, text }) {
  const button = document.createElement('button');
  button.id = id;
  button.type = 'button';
  button.className = SUBMIT_BUTTON_CLASS_NAME;
  button.textContent = text;
  return button;
}

function bindAccommodationEditorEvents({ content, submitButtonId, onSubmit }) {
  if (content.dataset[BOUND_DATASET_KEY] === 'true') {
    return;
  }

  content.dataset[BOUND_DATASET_KEY] = 'true';

  content.addEventListener('click', async (e) => {
    const submitButton = e.target.closest(`#${submitButtonId}`);
    if (submitButton) {
      await onSubmit(submitButton);
      return;
    }

    const { handled, result } = await accommodationForm.handleDelegatedClick(
      e.target,
      {
        onRegionInputClick: (regionInput) =>
          handleRegionInputClick(content, regionInput),
      },
    );

    if (!handled) {
      return;
    }

    if (result?.success === false && result.message) {
      toast.warn('예약 불가 날짜 추가 실패', result.message, 4);
    }
  });

  content.addEventListener('change', (e) => {
    accommodationForm.handleDelegatedChange(e.target);
  });
}

async function handleRegionInputClick(content, regionInput) {
  const detailInput = content.querySelector('#detailAddressInput');

  try {
    await openPostcodePopup(regionInput, detailInput);
  } catch {
    toast.warn(
      '주소 검색 실패',
      '카카오 우편번호 서비스를 불러오지 못했습니다.',
      4,
    );
  }
}

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return `${value ?? ''}`.trim();
}

function normalizeRequiredNumber(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeOptionalNumber(value) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeMediaUrl(url, useBlobPlaceholder = false) {
  const trimmed = normalizeText(url);
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('blob:')) {
    return useBlobPlaceholder ? '__blob__' : '';
  }

  return trimmed;
}

function normalizeBlockedDates(blockedDates) {
  const safeBlockedDates = Array.isArray(blockedDates) ? blockedDates : [];

  return safeBlockedDates
    .filter(
      (blockedDate) =>
        blockedDate?.startDate &&
        blockedDate?.endDate &&
        blockedDate.startDate <= blockedDate.endDate,
    )
    .map((blockedDate) => ({
      startDate: blockedDate.startDate,
      endDate: blockedDate.endDate,
      reason: blockedDate.reason === 'RESERVATION' ? 'RESERVATION' : 'HOST_BLOCK',
    }));
}

function normalizeImages(images, { useBlobPlaceholder = false } = {}) {
  const safeImages = Array.isArray(images) ? images : [];

  return safeImages
    .map((image) => ({
      url: normalizeMediaUrl(image?.url, useBlobPlaceholder),
      title: normalizeText(image?.title),
      description: normalizeText(image?.description),
    }))
    .filter((image) => image.url);
}

export function buildAccommodationSnapshot(data, options = {}) {
  return {
    title: normalizeText(data?.title),
    region: normalizeText(data?.location?.region),
    address: normalizeText(data?.location?.address),
    maxGuest: normalizeRequiredNumber(data?.maxGuest),
    description: normalizeText(data?.description),
    adultPrice: normalizeRequiredNumber(data?.pricing?.adultPrice),
    childPrice: normalizeRequiredNumber(data?.pricing?.childPrice),
    serviceFee: normalizeOptionalNumber(data?.pricing?.serviceFee),
    minNights: normalizeOptionalNumber(data?.bookingPolicy?.minNights),
    thumbnailUrl: normalizeMediaUrl(data?.thumbnailUrl, options.useBlobPlaceholder),
    blockedDates: normalizeBlockedDates(data?.bookingPolicy?.blockedDates),
    images: normalizeImages(data?.images, options),
  };
}

export function getAccommodationRequiredMessages(modified) {
  const snapshot = buildAccommodationSnapshot(modified);
  const messages = [];

  if (!snapshot.title) {
    messages.push('숙소 이름');
  }
  if (!snapshot.region) {
    messages.push('지역');
  }
  if (!Number.isFinite(snapshot.maxGuest) || snapshot.maxGuest < 1) {
    messages.push('최대 수용 인원');
  }
  if (!Number.isFinite(snapshot.adultPrice) || snapshot.adultPrice < 0) {
    messages.push('성인 1박당 요금');
  }
  if (!Number.isFinite(snapshot.childPrice) || snapshot.childPrice < 0) {
    messages.push('어린이 1박당 요금');
  }

  return messages;
}

export function buildCreateAccommodationPayload(snapshot) {
  const payload = {
    title: snapshot.title,
    region: snapshot.region,
    maxGuest: snapshot.maxGuest,
    adultPrice: snapshot.adultPrice,
    childPrice: snapshot.childPrice,
  };

  if (snapshot.address) {
    payload.address = snapshot.address;
  }
  if (snapshot.description) {
    payload.description = snapshot.description;
  }
  if (snapshot.serviceFee !== null) {
    payload.serviceFee = snapshot.serviceFee;
  }
  if (snapshot.minNights !== null && snapshot.minNights >= 1) {
    payload.minNights = snapshot.minNights;
  }
  if (snapshot.thumbnailUrl) {
    payload.thumbnailUrl = snapshot.thumbnailUrl;
  }
  if (snapshot.blockedDates.length > 0) {
    payload.blockedDates = snapshot.blockedDates;
  }
  if (snapshot.images.length > 0) {
    payload.images = snapshot.images;
  }

  return payload;
}

export function buildUpdateAccommodationPayload(snapshot) {
  return {
    title: snapshot.title,
    region: snapshot.region,
    address: snapshot.address,
    maxGuest: snapshot.maxGuest,
    description: snapshot.description,
    adultPrice: snapshot.adultPrice,
    childPrice: snapshot.childPrice,
    serviceFee: snapshot.serviceFee,
    minNights: snapshot.minNights,
    thumbnailUrl: snapshot.thumbnailUrl,
    blockedDates: snapshot.blockedDates,
    images: snapshot.images,
  };
}

export function hasAccommodationChanged(origin, modified) {
  const originSnapshot = buildAccommodationSnapshot(origin);
  const modifiedSnapshot = buildAccommodationSnapshot(modified, {
    useBlobPlaceholder: true,
  });

  return JSON.stringify(originSnapshot) !== JSON.stringify(modifiedSnapshot);
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

async function resolveThumbnailUrl(modified) {
  const thumbnailFile = accommodationForm.getThumbnailFile();
  if (thumbnailFile) {
    return uploadImage(thumbnailFile);
  }

  return normalizeMediaUrl(modified?.thumbnailUrl);
}

async function resolveImages(modified) {
  const sourceImages = Array.isArray(modified?.images) ? modified.images : [];
  if (sourceImages.length === 0) {
    return [];
  }

  const files = accommodationForm.getImageFiles();
  let fileIndex = 0;
  const uploadedImages = [];

  for (const image of sourceImages) {
    const sourceUrl = normalizeText(image?.url);
    if (!sourceUrl) {
      continue;
    }

    let finalUrl = sourceUrl;
    if (sourceUrl.startsWith('blob:')) {
      const file = files[fileIndex++];
      if (!(file instanceof File)) {
        continue;
      }

      finalUrl = await uploadImage(file);
    }

    uploadedImages.push({
      url: finalUrl,
      title: normalizeText(image?.title),
      description: normalizeText(image?.description),
    });
  }

  return uploadedImages;
}

export async function resolveAccommodationMediaData(modified) {
  const resolved = cloneData(modified);
  resolved.thumbnailUrl = await resolveThumbnailUrl(modified);
  resolved.images = await resolveImages(modified);
  return resolved;
}

export async function submitAccommodationRequest(
  button,
  {
    missingData,
    collectFormState,
    validate,
    prepareRequest,
    successToastTitle,
    errorToastTitle,
    onSuccess,
  },
) {
  const formState = collectFormState();
  if (!formState) {
    toast.warn(
      missingData.title,
      missingData.message,
      missingData.duration ?? 5,
    );
    return;
  }

  const isValid = (await validate?.(formState)) ?? true;
  if (!isValid) {
    return;
  }

  button.disabled = true;

  try {
    const { endpoint, method, requestData } = await prepareRequest(formState);
    const { success, message } = await request(endpoint, {
      method,
      body: JSON.stringify(requestData),
    });

    if (success) {
      toast.success(successToastTitle, message, 2);
      onSuccess?.(formState);
    }
  } catch (error) {
    const errorMessage = error?.data?.message ?? error.message;
    toast.warn(errorToastTitle, errorMessage, 5);
  } finally {
    button.disabled = false;
  }
}
