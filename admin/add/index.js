import '../../src/style.css';
import toast from '../../src/components/toast.js';
import accommodationForm from '../../src/components/accommodationForm.js';
import constants from '../../src/constants.js';
import adminLogo from '../adminLogo.js';
import { checkAdmin } from '../../src/api/auth.js';
import { imageRequest, request } from '../../src/api/client.js';
import {
  makeRegionInputSearchable,
  openPostcodePopup,
} from '../../src/components/postcodeSearch.js';

checkAdmin();

const content = document.getElementById('content');

document.body.prepend(adminLogo.build());
renderAddPage();
bindDelegatedEvents();

function renderAddPage() {
  content.className = 'w-full flex justify-center';
  const formElement = accommodationForm.buildForm(constants.FORM_MODE.ADD);
  formElement.appendChild(buildSubmitButton());
  content.replaceChildren(formElement);

  const regionInput = content.querySelector('#regionInput');
  makeRegionInputSearchable(regionInput);
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
  const submitButton = e.target.closest('#submitAccommodationBtn');
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
