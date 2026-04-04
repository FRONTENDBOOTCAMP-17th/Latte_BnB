import { buildHeader } from '../src/components/header.js';
import { buildFooter } from '../src/components/footer.js';

document.body.prepend(buildHeader());
document.body.append(buildFooter());

const rsvList = document.getElementById('reservation-list');
const result = document.getElementById('result');
const token = localStorage.getItem('accessToken');

async function loadReservation() {
  try {
    const res = await fetch(
      'https://api.fullstackfamily.com/api/lattebnb/v1/me/reservations',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (!res.ok) {
      throw new Error('HTTP 오류: ' + res.stauts);
    }

    const rsvData = await res.json();
    const rsv = rsvData.data.reservations;
    const amdData = rsv.accommodation;
    const schData = rsv.schedule;

    if (rsv.length === 0) {
      result.textContent = '예약 내역이 없습니다.';
      return;
    }

    rsvList.textContent = '';

    for (let i = 0; i < rsv.length; i++) {
      const amd = amdData[i];
      const sch = schData[i];

      const resDiv = document.createElement('div');
      const cardDiv = document.createElement('div');
      cardDiv.className = 'reservation-card';
      const cardImg = document.createElement('img');
      cardImg.className = 'img';
      const cardName = document.createElement('p');
      cardName.className = 'name';
      const cardPeriod = document.createElement('p');

      cardImg.src = amd.thumbnailUrl;
      cardName.textContent = amd.title;
      cardPeriod.textContent = sch.checkInDate + '~' + sch.checkOutDate;

      cardDiv.appendChild(cardImg);
      cardDiv.appendChild(cardName);
      cardDiv.appendChild(cardPeriod);
      resDiv.appendChild(cardDiv);
      rsvList.appendChild(resDiv);

      localStorage.setItem(rsv.status);
      console.log(rsv.status);
    }
  } catch (e) {
    result.textContent = '에러 발생: ' + e.message;
    result.sytle.color = 'red';
  }
}

loadReservation();

const search = document.getElementById('search');
const wish = document.getElementById('wish');
const rsv = document.getElementById('rsv');
const profile = document.getElementById('profile');

search.addEventListener('click', () => {
  location.href = `../index.html`;
});

wish.addEventListener('click', () => {
  location.href = `../index.html`;
});

rsv.addEventListener('click', () => {
  location.href = `./`;
});

profile.addEventListener('click', () => {
  location.href = `../profile/index.html`;
});
