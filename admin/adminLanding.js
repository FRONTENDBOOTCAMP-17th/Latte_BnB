import { request } from '../src/api/client.js';

export async function fetchAccommodationList({
  page,
  query,
  pageLimit = 20,
} = {}) {
  const params = new URLSearchParams({
    pageLimit,
  });

  if (page) {
    params.set('page', page);
  }

  if (query) {
    params.set('query', query);
  }

  const { data, meta } = await request(`/admin/accommodations?${params}`, {
    method: 'GET',
  });

  return { data, meta };
}

export async function deleteAccommodation(id) {
  const { success, message } = await request(`/admin/accommodations/${id}`, {
    method: 'DELETE',
  });

  return { success, message };
}
