import constants from '../src/constants.js';

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

  const res = await fetch(
    `${constants.API_BASE_URL}/admin/accommodations?${params}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('HTTP 에러: ' + res.status);
  }

  const { data, meta } = await res.json();

  return { data, meta };
}

export async function deleteAccommodation(id) {
  const res = await fetch(
    `${constants.API_BASE_URL}/admin/accommodations/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('HTTP 에러: ' + res.status);
  }

  const { success, message } = await res.json();

  return { success, message };
}
