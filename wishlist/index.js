import { RoomCard } from '../src/RoomCard.js';
import constants from '../src/constants.js';
import pagination from '../src/components/pagination.js';

let roomData = new Map();
let pageLimit = 20;

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

async function fetchWishlist({ page } = {}) {
  const params = new URLSearchParams({ pageLimit });
  if (page) {
    params.set('page', page);
  }

  const res = await fetch(`${constants.API_BASE_URL}/me/wishlist?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
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
  for (const value of roomData.values()) {
    roomList.appendChild(value.getElement());
  }
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
  buildRooms(result.data.wishlist);
  renderRooms();
  pagination.setPrevNext(result.meta.pagination);
}

const result = await fetchWishlist();
buildRooms(result.data.accommodations);
renderRooms();

content.appendChild(pagination.buildPagination(result.meta.pagination));

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});

document.addEventListener('click', async (e) => {
  if (e.target.id === 'prevButton') {
    pagination.setCurrentPage(pagination.paginationData.page - 1);
    changePage();
  }

  if (e.target.id === 'nextButton') {
    pagination.setCurrentPage(pagination.paginationData.page + 1);
    changePage();
  }

  if (e.target.id === 'searchBtn') {
  }
});
