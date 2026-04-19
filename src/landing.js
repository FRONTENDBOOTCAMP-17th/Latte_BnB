import { RoomCard } from './RoomCard.js';
import pagination from './components/pagination.js';
import toast from './components/toast.js';
import heroSlider from './components/heroSlider.js';
import { checkWish } from './api/auth.js';
import { request } from './api/client.js';

let searchInput = null;
let searchBtn = null;
const sortBox = document.getElementById('sort');
const content = document.getElementById('content');
const roomList = document.getElementById('roomList');
const topBtn = document.getElementById('btn-top');
let cardFadeDone = false;
let lineCount = getCardsPerLine();

content.prepend(heroSlider.buildSlider());

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

  const { data, meta } = await request(`/accommodations?${params}`, {
    method: 'GET',
  });

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

  lineCount = getCardsPerLine();
  setCardFade();
  checkCardFade();
}

function getCardsPerLine() {
  if (window.innerWidth >= 1536) {
    return 4;
  }

  if (window.innerWidth >= 1024) {
    return 3;
  }

  if (window.innerWidth >= 768) {
    return 2;
  }

  return 1;
}

function showCardLine(start) {
  const cards = roomList.querySelectorAll('.accommodationCard');
  const cardsPerLine = getCardsPerLine();

  for (let i = start; i < start + cardsPerLine; i++) {
    if (!cards[i]) {
      return;
    }

    cards[i].classList.remove('opacity-0', 'translate-y-8');
  }
}

function setCardFade() {
  const cards = roomList.querySelectorAll('.accommodationCard');
  cardFadeDone = false;

  cards.forEach((card) => {
    card.classList.add(
      'opacity-0',
      'translate-y-8',
      'transition-all',
      'duration-700',
      'ease-out',
    );
  });
}

function showAllCards() {
  const cards = roomList.querySelectorAll('.accommodationCard');

  cards.forEach((card) => {
    card.classList.remove('opacity-0', 'translate-y-8');
  });

  cardFadeDone = true;
}

function checkCardFade() {
  const cards = roomList.querySelectorAll('.accommodationCard');
  const cardsPerLine = getCardsPerLine();
  const viewBottom = window.scrollY + window.innerHeight - 40;
  let hiddenCount = 0;

  for (let i = 0; i < cards.length; i += cardsPerLine) {
    const card = cards[i];

    if (!card) {
      break;
    }

    if (!card.classList.contains('opacity-0')) {
      continue;
    }

    hiddenCount++;

    if (viewBottom > card.offsetTop) {
      showCardLine(i);
    }
  }

  if (hiddenCount === 0) {
    cardFadeDone = true;
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

window.addEventListener('scroll', () => {
  if (!cardFadeDone) {
    checkCardFade();
  }
});

window.addEventListener('resize', () => {
  if (roomList.children.length === 0) {
    return;
  }

  const newLineCount = getCardsPerLine();

  if (lineCount !== newLineCount) {
    lineCount = newLineCount;
    showAllCards();
    return;
  }

  checkCardFade();
});

topBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});
