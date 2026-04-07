async function loadReservation() {
  const rsvList = document.getElementById('reservation-list');
  const result = document.getElementById('result');
  const token = localStorage.getItem('token');

  try {
    if (!token) {
      result.textContent = '로그인이 필요합니다.';
      result.style.color = 'red';
      return;
    }

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
      throw new Error('HTTP 오류: ' + res.status);
    }

    const rsvData = await res.json();
    const rsv = rsvData.data.reservations;

    const activeReservations = rsv.filter(
      (reservation) => reservation.status !== 'CANCELLED',
    );

    if (activeReservations.length === 0) {
      const div = document.createElement('div');
      div.className =
        'w-full min-h-140 col-span-3 flex gap-20 items-center justify-center text-lg font-semibold text-shark-600 pr-8';
      div.innerHTML = '예약 목록이 <span></span> 비어있습니다.';

      const highlight = div.querySelector('span');
      highlight.className =
        'inline-block text-[10rem] font-extrabold text-primary-500 align-text-top';
      highlight.textContent = '텅...';

      result.appendChild(div);

      return;
    }

    rsvList.textContent = '';

    for (let i = 0; i < rsv.length; i++) {
      if (rsv[i].status === 'CANCELLED') continue;

      const amd = rsv[i].accommodation;
      const sch = rsv[i].schedule;

      const [, inmonth, inday] = sch.checkInDate.split('-');
      const [, outmonth, outday] = sch.checkOutDate.split('-');

      const resDiv = document.createElement('li');
      resDiv.className = 'w-full pr-8 max-w-[600px] mx-auto';

      resDiv.innerHTML = `
          <img class="w-full h-40 object-cover rounded-md" src="${amd.thumbnailUrl}" alt="${amd.title}">
          <p class="mt-2 font-bold">${amd.title}</p>
          <p class="text-sm text-gray-500">${inmonth}월 ${inday}일 ~ ${outmonth}월 ${outday}일</p>
      `;

      resDiv.addEventListener('click', () => {
        localStorage.setItem('reservationId', rsv[i].id);
        location.href = `../reservations-detail/`;
      });

      rsvList.appendChild(resDiv);
    }
  } catch (e) {
    result.textContent = '에러 발생: ' + e.message;
    result.style.color = 'red';
  }
}

loadReservation();
