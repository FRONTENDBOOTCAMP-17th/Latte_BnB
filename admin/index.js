import '../src/style.css';
import constants from '../src/constants';
import adminLogo from './adminLogo';
import { fetchAccommodationList } from './adminLanding';
import pagination from '../src/components/pagination';
import toast from '../src/components/toast';

let searchInput = null;
let searchBtn = null;

const content = document.getElementById('content');
const accommodationList = document.getElementById('accommodationList');
const accommodationData = new Map();

content.prepend(adminLogo.build());
content.classList.remove('grid');
content.classList.add('hidden');

if (localStorage.getItem('admin_token')) {
  const res = await fetch(`${constants.API_BASE_URL}/me/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
    },
  });

  if (!res.ok) {
    if (localStorage.getItem('admin_token')) {
      localStorage.removeItem('admin_token');
    }
    if (localStorage.getItem('admin_Info')) {
      localStorage.removeItem('admin_info');
    }
    location.replace('/admin/login/');
  }

  const { success } = await res.json();
  if (success) {
    console.log('유효한 토큰입니다.');
    content.classList.add('grid');
    content.classList.remove('hidden');
  }
} else {
  if (localStorage.getItem('admin_token')) {
    localStorage.removeItem('admin_token');
  }
  if (localStorage.getItem('admin_Info')) {
    localStorage.removeItem('admin_info');
  }
  location.replace('/admin/login/');
}

function render() {
  accommodationList.replaceChildren();
  for (const value of accommodationData.values()) {
    accommodationList.appendChild(value.element);
  }
}

async function build(data) {
  accommodationData.clear();
  data.forEach((accommodation) => {
    const li = document.createElement('li');
    li.className =
      'rounded-2xl bg-primary-50 p-4 my-2 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_30px_rgba(0,0,0,0.08)]';
    li.dataset.id = accommodation.id;
    li.innerHTML = `
    <strong class="admin-title font-extrabold text-xl text-shark-800"></strong>
    <p class="admin-location text-sm my-4 text-shark-800"></p>
    <div class="admin-pricing w-full flex gap-5 text-xs text-shark-500">
      <span class="admin-maxGuest"></span>
      <span class="admin-adultPrice ml-auto"></span>
      <span class="admin-childPrice"></span>
    </div>
    `;
    li.querySelector('.admin-title').textContent = accommodation.title;
    li.querySelector('.admin-location').textContent = accommodation.location;
    li.querySelector('.admin-maxGuest').textContent =
      '최대 ' + accommodation.maxGuest + '명';
    li.querySelector('.admin-adultPrice').textContent =
      '어른: ' + accommodation.pricing.adultPrice + '원';
    li.querySelector('.admin-childPrice').textContent =
      '어린이: ' + accommodation.pricing.childPrice + '원';
    accommodationData.set(accommodation.id, { accommodation, element: li });
  });
}

async function changePage() {
  try {
    const result = await fetchAccommodationList({
      page: pagination.paginationData.page,
    });
    build(result.data.accommodations);
    render();
    pagination.setPrevNext(result.meta.pagination);
  } catch (error) {
    toast.warn('[admin/pagination]: 데이터 로딩 실패', error.message, 3);
  }
}

try {
  const result = await fetchAccommodationList();
  build(result.data.accommodations);
  render();
  content.appendChild(pagination.buildPagination(result.meta.pagination));
} catch (error) {
  toast.warn('[admin/landing]: 데이터 로딩 실패', error.message, 3);
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
    await changePage();
  }

  if (e.target.id === 'nextButton') {
    pagination.setCurrentPage(pagination.paginationData.page + 1);
    await changePage();
  }

  if (e.target.id === 'searchBtn') {
    if (searchInput === null) {
      searchInput = document.getElementById('searchInput');
    }
    try {
      const result = await fetchAccommodationList({ query: searchInput.value });
      pagination.setCurrentPage(result.meta.pagination.page);
      build(result.data.accommodations);
      render();
      pagination.setPrevNext(result.meta.pagination);
    } catch (error) {
      toast.warn('[search]: 데이터 로딩 실패', error.message, 5);
    }
  }
});
