import '../../src/style.css';
import toast from '../../src/components/toast.js';
import accommodationForm from '../../src/components/accommodationForm.js';
import constants from '../../src/constants.js';
import adminLogo from '../adminLogo.js';
import { checkAdmin } from '../../src/api/auth.js';
import { imageRequest, request } from '../../src/api/client.js';
import { buildHistoryBackButton } from '../../src/components/historyBackButton.js';
import {
  makeRegionInputSearchable,
  openPostcodePopup,
} from '../../src/components/postcodeSearch.js';

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
  applyRegionSearchInputUI();
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
  const submitButton = e.target.closest('#submitAccommodationEditBtn');
  if (submitButton) {
    await submitAccommodation(submitButton);
    return;
  }

  const { handled, result } = await accommodationForm.handleDelegatedClick(
    e.target,
    {
      onRegionInputClick: handleRegionInputClick,
    },
  );
  if (!handled) {
    return;
  }

  if (result?.success === false && result.message) {
    toast.warn('예약 불가 날짜 추가 실패', result.message, 4);
  }
}

function handleChange(e) {
  accommodationForm.handleDelegatedChange(e.target);
}

function applyRegionSearchInputUI() {
  const regionInput = content.querySelector('#regionInput');
  makeRegionInputSearchable(regionInput);
}

async function handleRegionInputClick(regionInput) {
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

function getRequiredMessages(modified) {
  const messages = [];
  const title = normalizeText(modified.title);
  const region = normalizeText(modified.location?.region);
  const maxGuest = normalizeRequiredNumber(modified.maxGuest);
  const adultPrice = normalizeRequiredNumber(modified.pricing?.adultPrice);
  const childPrice = normalizeRequiredNumber(modified.pricing?.childPrice);

  if (!title) {
    messages.push('숙소 이름');
  }
  if (!region) {
    messages.push('지역');
  }
  if (!Number.isFinite(maxGuest) || maxGuest < 1) {
    messages.push('최대 허용 인원');
  }
  if (!Number.isFinite(adultPrice) || adultPrice < 0) {
    messages.push('성인 1박당 요금');
  }
  if (!Number.isFinite(childPrice) || childPrice < 0) {
    messages.push('어린이 1박당 요금');
  }

  return messages;
}

function clone(value) {
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

function buildNormalizedSnapshot(data, options = {}) {
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

function isSameValue(origin, modified) {
  return JSON.stringify(origin) === JSON.stringify(modified);
}

function buildRequestPayload(snapshot) {
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

function hasAccommodationChanged(origin, modified) {
  const originSnapshot = buildNormalizedSnapshot(origin);
  const modifiedSnapshot = buildNormalizedSnapshot(modified, {
    useBlobPlaceholder: true,
  });

  return !isSameValue(originSnapshot, modifiedSnapshot);
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

async function buildResolvedModifiedData(modified) {
  const resolved = clone(modified);
  resolved.thumbnailUrl = await resolveThumbnailUrl(modified);
  resolved.images = await resolveImages(modified);
  return resolved;
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
      `${requiredMessages.join(', ')} 필드는 필수로 입력해야 합니다.`,
      5,
    );
    return;
  }

  if (!hasAccommodationChanged(origin, modified)) {
    toast.message(
      '변경 사항 없음',
      '수정할 내용이 없어 저장 요청을 생략했습니다.',
      3,
    );
    return;
  }

  button.disabled = true;
  try {
    const resolvedModified = await buildResolvedModifiedData(modified);
    const modifiedSnapshot = buildNormalizedSnapshot(resolvedModified);
    const requestData = buildRequestPayload(modifiedSnapshot);

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
