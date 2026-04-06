// https://nonmajor-be-developer.tistory.com/entry/47%EC%9D%BC%EC%B0%A8-3-%ED%8C%80%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%EB%B0%94%EB%8B%90%EB%9D%BC%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%EB%8B%AC%EB%A0%A5

let checkin = null;
let checkout = null;
let blockedDates = [];
let currentMonth = new Date();
let onCalendarChange = null;

const today = new Date();
today.setHours(0, 0, 0, 0);

function getCheckinDate() {
  if (!checkin || !checkout) return null;
  return checkin < checkout ? checkin : checkout;
}

function getCheckoutDate() {
  if (!checkin || !checkout) return null;
  return checkin < checkout ? checkout : checkin;
}

function isBlocked(date) {
  return blockedDates.some((range) => {
    const start = new Date(range.startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(range.endDate);
    end.setHours(0, 0, 0, 0);

    return date >= start && date <= end;
  });
}

function setDefaultDates() {
  const reservationOkDay = new Date(today);

  reservationOkDay.setDate(reservationOkDay.getDate() + 1);

  while (isBlocked(reservationOkDay)) {
    reservationOkDay.setDate(reservationOkDay.getDate() + 1);
  }

  checkin = new Date(reservationOkDay);

  const nextDay = new Date(reservationOkDay);
  nextDay.setDate(nextDay.getDate() + 1);
  checkout = isBlocked(nextDay) ? null : nextDay;

  currentMonth = new Date(checkin.getFullYear(), checkin.getMonth(), 1);
  buildCalendar();

  if (onCalendarChange) {
    onCalendarChange();
  }
}

function buildCalendar() {
  const firstDate = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  );

  const lastDate = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  );

  document.getElementById('cal-label').textContent =
    `${currentMonth.getFullYear()}년 ${currentMonth.getMonth() + 1}월`;

  const tbody = document.getElementById('cal-tbody');
  tbody.innerHTML = '';
  let row = tbody.insertRow();

  for (let i = 0; i < firstDate.getDay(); i++) {
    row.insertCell();
  }

  const currentDate = new Date(firstDate);
  while (currentDate <= lastDate) {
    const cell = row.insertCell();
    const date = new Date(currentDate);
    date.setHours(0, 0, 0, 0);

    cell.textContent = currentDate.getDate();

    if (checkin && date.getTime() === checkin.getTime())
      cell.classList.add('cal-date-selected');
    if (checkout && date.getTime() === checkout.getTime())
      cell.classList.add('cal-date-selected');

    if (checkin && checkout) {
      const rangeStart = checkin < checkout ? checkin : checkout;
      const rangeEnd = checkin < checkout ? checkout : checkin;

      if (date > rangeStart && date < rangeEnd)
        cell.classList.add('cal-date-range');
    }

    if (date < today) {
      cell.classList.add('cal-date-past');
    } else if (isBlocked(date)) {
      cell.classList.add('cal-date-blocked');
    } else {
      cell.onclick = () => {
        const isCheckin = checkin && date.getTime() === checkin.getTime();
        const isCheckout = checkout && date.getTime() === checkout.getTime();

        if (isCheckin || isCheckout) {
          checkin = null;
          checkout = null;
        } else if (!checkin || checkout) {
          checkin = date;
          checkout = null;
        } else {
          const rangeStart = checkin < date ? checkin : date;
          const rangeEnd = checkin < date ? date : checkin;

          const hasBlocked = blockedDates.some((range) => {
            const blockStart = new Date(range.startDate);
            blockStart.setHours(0, 0, 0, 0);
            const blockEnd = new Date(range.endDate);
            blockEnd.setHours(0, 0, 0, 0);
            return blockStart <= rangeEnd && blockEnd >= rangeStart;
          });

          if (hasBlocked) {
            alert('예약 불가한 날짜가 포함되어 있습니다.');
            checkin = null;
            checkout = null;
          } else {
            checkout = date;
          }
        }

        buildCalendar();
        if (onCalendarChange) {
          onCalendarChange();
        }
      };
    }

    if (currentDate.getDay() === 6) {
      row = tbody.insertRow();
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }
}

document.getElementById('cal-btn-pre').onclick = () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() - 1,
    1,
  );

  buildCalendar();
};
document.getElementById('cal-btn-next').onclick = () => {
  currentMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    1,
  );
  buildCalendar();
};

buildCalendar();
