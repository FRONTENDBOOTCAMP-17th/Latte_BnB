import { imageRequest, request } from '../../src/api/client.js';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await imageRequest('/admin/accommodations/images', {
    method: 'POST',
    body: formData,
  });
  return data.imageUrl;
}

export async function addAccommodation(requestData) {
  const { success, message, data } = await request('/admin/accommodations', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });

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
