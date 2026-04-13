import { authRequest } from './client';

export async function showReservations({ page, pageLimit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (pageLimit) params.set('pageLimit', pageLimit);

  return authRequest(`/me/reservations?${params}`);
}

export async function getReservationDetail(reservationId) {
  return authRequest(`/reservations/${reservationId}`);
}

export async function removeReservation(reservationId) {
  return authRequest(`/reservations/${reservationId}/cancel`, {
    method: 'PATCH',
  });
}

export async function createReservation(data) {
  return authRequest('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getReservationContext(accommodationId) {
  return authRequest(`/accommodations/${accommodationId}/reservation-context`, {
    method: 'GET',
  });
}
