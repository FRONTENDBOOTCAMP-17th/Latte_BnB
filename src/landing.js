import { RoomCard } from './RoomCard.js';
import constants from './constants.js';
import pagination from './components/pagination.js';
import toast from './components/toast.js';
import { checkWish } from './api/auth.js';

let searchInput = null;
let searchBtn = null;
const sortBox = document.getElementById('sort');
const content = document.getElementById('content');
const roomList = document.getElementById('roomList');

let roomData = new Map();
let pageLimit = 20;

async function fetchAccommodations({ page, query } = {}) {
  const params = new URLSearchParams({
    pageLimit,
    sort: sortBox.value,
  });

  if (page) {
    params.set('page', page);
  }

  if (query) {
    params.set('query', query);
  }

  const res = await fetch(
    `${constants.API_BASE_URL}/accommodations?${params}`,
    {
      method: 'GET',
    },
  );

  if (!res.ok) {
    throw new Error('HTTP 에러: ' + res.status);
  }

  const { data, meta } = await res.json();

  return { data, meta };
}

async function checkWished() {
  const res = await checkWish([...roomData.keys()]);
  if (!res) return;

  for (let id of res.data.wishlistedAccommodationIds) {
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
  try {
    await checkWished();
  } catch (error) {
    console.log(
      error.message + '\n로그인하지 않아 찜 목록 체크가 불가능합니다.',
    );
  }
}

async function changePage() {
  try {
    const result = await fetchAccommodations({
      page: pagination.paginationData.page,
    });
    buildRooms(result.data.accommodations);
    renderRooms();
    pagination.setPrevNext(result.meta.pagination);
  } catch (error) {
    toast.warn('[pagination]: 데이터 로딩 실패', error.message, 5);
  }
}

try {
  const result = await fetchAccommodations();
  buildRooms(result.data.accommodations);
  renderRooms();
  content.appendChild(pagination.buildPagination(result.meta.pagination));
} catch (error) {
  toast.warn('[landing]데이터 로딩 실패', error.message, 5);
}

document.addEventListener('keyup', (e) => {
  if (e.target.id === 'searchInput' && e.key === 'Enter') {
    if (searchBtn === null) {
      searchBtn = document.getElementById('searchBtn');
    }
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
    if (searchInput === null) {
      searchInput = document.getElementById('searchInput');
    }
    try {
      const result = await fetchAccommodations({ query: searchInput.value });
      pagination.setCurrentPage(result.meta.pagination.page);
      buildRooms(result.data.accommodations);
      renderRooms();
      pagination.setPrevNext(result.meta.pagination);
    } catch (error) {
      toast.warn('[search]: 데이터 로딩 실패', error.message, 5);
    }
  }
});

document.addEventListener('change', async (e) => {
  if (e.target.id === 'sort') {
    try {
      const result = await fetchAccommodations();
      pagination.setCurrentPage(result.meta.pagination.page);
      buildRooms(result.data.accommodations);
      renderRooms();
      pagination.setPrevNext(result.meta.pagination);
    } catch (error) {
      toast.warn('[sort]: 데이터 로딩 실패', error.message, 5);
    }
  }
});
