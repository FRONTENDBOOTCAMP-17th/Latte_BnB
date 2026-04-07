import '../src/style.css';
import constants from '../src/constants';
import adminLogo from './adminLogo';
import { deleteAccommodation, fetchAccommodationList } from './adminLanding';
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

function build(data) {
  accommodationData.clear();
  data.forEach((accommodation) => {
    const li = document.createElement('li');
    li.className =
      'accommodationItem rounded-2xl bg-primary-50 p-4 my-2 shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_30px_rgba(0,0,0,0.08)] relative';
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
    li.appendChild(buildDeleteBtn());
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

function buildDeleteBtn() {
  const btn = document.createElement('button');
  btn.className =
    'deleteAccommodationBtn absolute bg-primary-500 text-white top-2 right-2 hover:bg-primary-500/75 p-1 rounded-xl';
  btn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pointer-events-none">
    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
  `;
  return btn;
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

  if (e.target.classList.contains('deleteAccommodationBtn')) {
    const id = Number.parseInt(
      e.target.closest('.accommodationItem').dataset.id,
    );
    try {
      const result = await deleteAccommodation(id);
      if (result.success) {
        accommodationData.get(id).element.remove();
        accommodationData.delete(id);
        toast.success('숙소 삭제', result.message, 3);
      }
    } catch (error) {
      toast.warn('숙소 삭제', error.message, 3);
    }
  }
});
