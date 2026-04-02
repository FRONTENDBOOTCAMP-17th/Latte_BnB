import constants from '../../src/constants.js';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    `${constants.API_BASE_URL}/admin/accommodations/images`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
      body: formData,
    },
  );

  if (!res.ok) {
    throw new Error('이미지 업로드 실패');
  }

  const { data } = await res.json();
  return data.imageUrl;
}

export async function addAccommodation(requestData) {
  const res = await fetch(`${constants.API_BASE_URL}/admin/accommodations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!res.ok) {
    throw new Error('숙소 추가 실패');
  }

  const { success, message, data } = await res.json();

  return { success, message, data };
}

export function buildRequestFormData(form) {
  let requestForm = {};
  requestForm.title = form.title.value;
  requestForm.region = form.region.value;
  requestForm.maxGuest = Number.parseInt(form.maxGuest.value);
  requestForm.adultPrice = Number.parseInt(form.adultPrice.value);
  requestForm.childPrice = Number.parseInt(form.childPrice.value);

  if (form.address.value.length > 0) {
    requestForm.address = form.address.value;
  }

  if (form.description.value.length > 0) {
    requestForm.description = form.description.value;
  }

  if (form.serviceFee.value) {
    requestForm.serviceFee = Number.parseInt(form.serviceFee.value);
  }

  if (Number.parseInt(form.minNights.value) > 1) {
    requestForm.minNights = Number.parseInt(form.minNights.value);
  }

  return requestForm;
}
