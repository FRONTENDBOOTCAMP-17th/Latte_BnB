const result = document.getElementById('result');
const cancel = document.getElementById('cancel');
const token = localStorage.getItem('token');
const reservationId = localStorage.getItem('reservationId');

async function loadDetail() {
  try {
    const res = await fetch(
      `https://api.fullstackfamily.com/api/lattebnb/v1/reservations/${reservationId}`,
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

    const detailData = await res.json();

    const amdDetail = detailData.data.accommodation;
    const gueDetail = detailData.data.guestCount;
    const priDetail = detailData.data.pricing;
    const schDetail = detailData.data.schedule;
    const [, inmonth, inday] = schDetail.checkInDate.split('-');
    const [, outmonth, outday] = schDetail.checkOutDate.split('-');

    const container = document.createElement('div');
    container.id = 'container';

    container.innerHTML = `
                        <div
            id="roomInfo"
            class="mx-4 border-b-2 border-shark-300 p-4 md:mx-auto md:w-lg lg:w-170.5 lg:flex lg:items-start lg:gap-4"
            >
            <img
                src="${amdDetail.thumbnailUrl}"
                alt="${amdDetail.title}"
                class="block w-full h-55 object-cover rounded-md lg:h-55 lg:w-70 lg:shrink-0"
            />

            <div id="room" class="mt-4 lg:mt-0 lg:min-w-0 lg:flex-1">
                <p id="name" class="text-2xl font-bold break-keep">
                ${amdDetail.title}
                </p>
                <p id="location" class="mt-4 text-base font-semibold text-shark-500">
                ${amdDetail.location}
                </p>
                <p id="host"></p>
            </div>
            </div>

            <div id="schedule" class="mx-4 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 p-4 md:w-lg md:justify-self-center lg:w-170.5">
              <p id="check" class="text-2xl font-bold">예약 일정</p>
              <p></p>
              <p id="checkIn" class="text-base font-semibold text-shark-500">체크인</p>
              <p id="checkOut" class="text-base font-semibold text-shark-500">체크아웃</p>
              <p id="inDay" class="text-xl font-bold">${inmonth}월 ${inday}일 ${schDetail.checkInTime}</p>
              <p id="outDay" class="text-xl font-bold">${outmonth}월 ${outday}일 ${schDetail.checkOutTime}</p>
            </div>

            <div id="guestInfo" class="mx-4 border-b-2 border-shark-300 p-4 md:w-lg md:justify-self-center lg:w-170.5">
              <p id="guest" class="text-2xl font-bold">게스트</p>
              <p id="people" class="mt-4 text-base font-semibold text-shark-500">성인 ${gueDetail.adults}명, 어린이 ${gueDetail.children}명</p>
            </div>

            <div id="priceInfo" class="mx-4 grid grid-cols-2 gap-y-4 border-b-2 border-shark-300 p-4  md:w-lg md:justify-self-center lg:w-170.5">
              <p id="price" class="text-2xl font-bold">결제 정보</p>
              <p></p>
              <p id="totalPrice" class="self-center text-base font-semibold text-shark-500">총 결제 금액</p>
              <p id="total" class="text-right text-2xl font-extrabold">${priDetail.totalPrice}원</p>
            </div>
          `;

    document.body.insertBefore(container, cancel);
  } catch (e) {
    result.textContent = '상세 정보를 불러올 수 없습니다.';
    result.style.color = 'red';
  }
}

loadDetail();

cancel.addEventListener('click', async () => {
  const isConfirm = confirm(`예약을 취소하시겠습니까?`);
  if (!isConfirm) return;

  try {
    const res = await fetch(
      `https://api.fullstackfamily.com/api/lattebnb/v1/reservations/${reservationId}/cancel`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      },
    );

    if (!res.ok) {
      throw new Error('HTTP 오류: ' + res.status);
    } else {
      alert(`취소가 완료되었습니다.`);
      localStorage.removeItem('reservationId');
      location.href = `../reservations-check/index.html`;
    }
  } catch (e) {
    alert('예약을 취소하지 못했습니다.\n' + e.message);
  }
});
