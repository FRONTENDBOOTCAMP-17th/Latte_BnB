import { RoomCard } from './RoomCard.js';
import constants from './constants.js';
import pagination from './components/pagination.js';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortBox = document.getElementById('sort');
const content = document.getElementById('content');
const roomList = document.getElementById('roomList');
let roomData = new Map();
let pageLimit = 20;

async function fetchRooms() {
  const res = await fetch(
    `${constants.API_BASE_URL}/accommodations?pageLimit=${pageLimit}&sort=${sortBox.value}`,
    {
      method: 'GET',
    },
  );

  const { message, data, meta } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return { data, meta };
}

async function fetchPage() {
  const res = await fetch(
    `${constants.API_BASE_URL}/accommodations?page=${pagination.paginationData.page}&pageLimit=${pageLimit}&sort=${sortBox.value}`,
    {
      method: 'GET',
    },
  );

  const { message, data, meta } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return { data, meta };
}

async function fetchSearch(query) {
  const res = await fetch(
    `${constants.API_BASE_URL}/accommodations?pageLimit=${pageLimit}&query=${query}&sort=${sortBox.value}`,
    {
      method: 'GET',
    },
  );

  const { message, data, meta } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return { data, meta };
}

function renderRooms() {
  roomList.replaceChildren();
  for (const value of roomData.values()) {
    roomList.appendChild(value.getElement());
  }
}

function buildRooms(data) {
  roomData.clear();
  data.forEach((room) => {
    roomData.set(room.id, new RoomCard(room));
  });
}

async function changePage() {
  const result = await fetchPage();
  buildRooms(result.data.accommodations);
  renderRooms();
  pagination.setPrevNext(result.meta.pagination);
}

const result = await fetchRooms();
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
    const result = await fetchSearch(searchInput.value);
    pagination.setCurrentPage(result.meta.pagination.page);
    buildRooms(result.data.accommodations);
    renderRooms();
    pagination.setPrevNext(result.meta.pagination);
  }
});

document.addEventListener('change', async (e) => {
  if (e.target.id === 'sort') {
    const result = await fetchRooms();
    pagination.setCurrentPage(result.meta.pagination.page);
    buildRooms(result.data.accommodations);
    renderRooms();
    pagination.setPrevNext(result.meta.pagination);
  }
});
