import { RoomCard } from '../src/RoomCard.js';
import pagination from '../src/components/pagination.js';
import { buildEmptyState } from '../src/components/emptyState.js';
import { removeToken } from '../src/utils/auth.js';
import { checkWish, getProfile } from '../src/api/auth.js';
import { request } from '../src/api/client.js';

const content = document.getElementById('content');
const authPromise = getProfile();

authPromise
  .then(({ success }) => {
    if (success) {
      content.classList.remove('hidden');
      content.classList.add('flex');
    }
  })
  .catch(() => {
    removeToken();
    location.replace('/login/');
  });

let roomData = new Map();
let pageLimit = 20;

const roomList = document.getElementById('roomList');

async function fetchWishlist({ page } = {}) {
  const params = new URLSearchParams({ pageLimit });

  if (page) {
    params.set('page', page);
  }

  const { data, meta } = await request(`/me/wishlist?${params}`, {
    method: 'GET',
  });

  return { data, meta };
}

async function checkWished() {
  try {
    const { data } = await checkWish([...roomData.keys()]);
    for (let id of data.wishlistedAccommodationIds) {
      roomData.get(id).setWish(true);
    }
  } catch (error) {
    console.log('찜 일괄 체크 실패');
    console.log(error.message);
    return;
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

if (roomData.size !== 0) {
  content.appendChild(pagination.buildPagination(result.meta.pagination));
}

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
