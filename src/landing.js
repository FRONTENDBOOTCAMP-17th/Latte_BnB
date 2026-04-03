import { RoomCard } from './RoomCard.js';
import constants from './constants.js';
import pagination from './components/pagination.js';

const content = document.getElementById('content');
const roomList = document.getElementById('roomList');
let roomData = new Map();

async function fetchRooms() {
  const res = await fetch(`${constants.API_BASE_URL}/accommodations`, {
    method: 'GET',
  });

  const { message, data, meta } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return { data, meta };
}

function renderRooms() {
  for (const value of roomData.values()) {
    roomList.appendChild(value.getElement());
  }
}

function buildRooms(data) {
  data.forEach((room) => {
    roomData.set(room.id, new RoomCard(room));
  });
}

const result = await fetchRooms();
buildRooms(result.data.accommodations);
renderRooms();

console.log(result.meta);
content.appendChild(pagination.buildPagination(result.meta.pagination));
