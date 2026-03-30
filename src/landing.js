import { RoomCard } from './RoomCard.js';

const roomList = document.getElementById('roomList');

const mockCnt = 10;
const mockData = [];

function fetchRooms() {
  for (let i = 0; i < mockCnt; i++) {
    console.log(i);
    const room = new RoomCard({
      id: i,
      title: `강릉 오션뷰 펜션`,
      location: '강릉',
      rating: 4.5,
      reviewCount: 100,
      audultPricePerNight: 100000,
      period: '3월 30일 ~ 4월 4일',
      hostName: `호스트 이름`,
      tumbnailUrl: '/src/assets/room_thumbnail.webp',
    });
    mockData.push(room);
  }
}

function renderRooms() {
  mockData.forEach((room) => {
    roomList.appendChild(room.getElement());
  });
}

fetchRooms();
renderRooms();
