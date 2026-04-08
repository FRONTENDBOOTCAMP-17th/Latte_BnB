import { RoomCard } from '../src/RoomCard.js';
import constants from '../src/constants.js';
import pagination from '../src/components/pagination.js';
import { buildEmptyState } from '../src/components/emptyState.js';

const content = document.getElementById('content');

const token = localStorage.getItem('accessToken');
if (token) {
  const res = await fetch(`${constants.API_BASE_URL}/me/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    localStorage.removeItem('accessToken');
    location.replace('/login/');
  }

  const { success } = await res.json();
  if (success) {
    console.log('유효한 토큰입니다.');
    content.classList.remove('hidden');
    content.classList.add('flex');
  }
} else {
  location.replace('/login/');
}

let roomData = new Map();
let pageLimit = 20;

const roomList = document.getElementById('roomList');

async function fetchWishlist({ page } = {}) {
  const params = new URLSearchParams({ pageLimit });
  if (page) {
    params.set('page', page);
  }

  const res = await fetch(`${constants.API_BASE_URL}/me/wishlist?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { message, data, meta } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return { data, meta };
}

async function checkWished() {
  const accommodationIds = [...roomData.keys()];
  const res = await fetch(`${constants.API_BASE_URL}/me/wishlist/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ accommodationIds: accommodationIds }),
  });

  const { success, message, data } = await res.json();

  if (!success) {
    console.log('찜 일괄 체크 실패');
    console.log(message);
    return;
  }

  for (let id of data.wishlistedAccommodationIds) {
    roomData.get(id).setWish(true);
  }
}

function renderRooms() {
  roomList.replaceChildren();
  if (roomData.size === 0) {
    renderEmpty();
  } else {
    for (const value of roomData.values()) {
      roomList.appendChild(value.getElement());
    }
  }
}

function renderEmpty() {
  const emptyState = buildEmptyState('위시리스트가');
  roomList.appendChild(emptyState);
}

async function buildRooms(data) {
  roomData.clear();
  data.forEach((room) => {
    roomData.set(room.id, new RoomCard(room));
  });
  await checkWished();
}

async function changePage() {
  const result = await fetchWishlist(pagination.paginationData.page);
  buildRooms(result.data.accommodations);
  renderRooms();
  pagination.setPrevNext(result.meta.pagination);
}

const result = await fetchWishlist();
buildRooms(result.data.accommodations);
renderRooms();

content.appendChild(pagination.buildPagination(result.meta.pagination));

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('wishHeart')) {
    const id = Number.parseInt(
      e.target.closest('.accommodationCard').dataset.id,
    );
    const target = roomData.get(id);
    target.getElement().remove();
    roomData.delete(id);

    if (roomData.size === 0) {
      renderEmpty();
    }
  }

  if (e.target.id === 'prevButton') {
    pagination.setCurrentPage(pagination.paginationData.page - 1);
    changePage();
  }

  if (e.target.id === 'nextButton') {
    pagination.setCurrentPage(pagination.paginationData.page + 1);
    changePage();
  }
});
