import { RoomCard } from './RoomCard.js';
import constants from './constants.js';

const roomList = document.getElementById('roomList');
let roomData = new Map();

async function fetchRooms() {
  const res = await fetch(`${constants.API_BASE_URL}/accommodations`, {
    method: 'GET',
  });

  const { message, data } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return data.accommodations;
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
console.log(result);
buildRooms(result);
renderRooms();
