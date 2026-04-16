import '../src/style.css';
import adminLogo from './adminLogo';
import { deleteAccommodation, fetchAccommodationList } from './adminLanding';
import pagination from '../src/components/pagination';
import toast from '../src/components/toast';
import { getProfile } from '../src/api/auth';

let searchInput = null;
let searchBtn = null;

const content = document.getElementById('content');
const accommodationList = document.getElementById('accommodationList');
const adminControls = document.getElementById('adminControls');
const accommodationData = new Map();

content.prepend(adminLogo.build());
renderAdminControls();
content.classList.replace('grid', 'hidden');

const profilePromise = getProfile();

profilePromise
  .then(({ data }) => {
    if (data.user.role !== 'ADMIN') {
      throw new Error();
    }
    content.classList.replace('hidden', 'grid');
  })
  .catch(() => {
    location.replace('/admin/login/');
  });

function render() {
  accommodationList.replaceChildren();
  for (const value of accommodationData.values()) {
    accommodationList.appendChild(value.element);
  }
}

function renderAdminControls() {
  if (!adminControls) {
    return;
  }

  const controls = document.createElement('div');
  controls.className =
    'flex max-w-xl w-full relative justify-self-center px-2 pr-12';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'searchInput';
  input.className =
    'w-full h-10 bg-white text-shark-800 px-4 py-2 rounded-3xl shadow-md placeholder:text-shark-600 placeholder:font-medium placeholder:text-center placeholder:bg-[url(/src/assets/search.svg)] placeholder:bg-no-repeat placeholder:bg-position-[calc(50%-6rem)_75%] placeholder:bg-size-[16px_16px]';
  input.placeholder = '숙소 검색: 숙소명 지역';

  const searchButton = document.createElement('button');
  searchButton.id = 'searchBtn';
  searchButton.type = 'button';
  searchButton.className =
    'bg-primary-500 hover:bg-primary-500/85 text-white absolute p-2 right-13 top-1/2 -translate-y-1/2 rounded-[50%]';
  searchButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 pointer-events-none">
      <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  `;

  const addLink = document.createElement('a');
  addLink.href = '/admin/add/';
  addLink.className =
    'absolute right-2 top-1/2 -translate-y-1/2 text-white rounded-[50%] bg-primary-500 hover:bg-primary-500/80 p-1';
  addLink.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  `;

  controls.append(input, searchButton, addLink);
  adminControls.replaceChildren(controls);
}

function build(data) {
  accommodationData.clear();
  data.forEach((accommodation) => {
    const a = document.createElement('a');
    a.href = `/admin/accommodation/?id=${accommodation.id}`;
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
    li.append(buildModifyBtn(accommodation.id), buildDeleteBtn(accommodation.id));
    li.querySelector('.admin-title').textContent = accommodation.title;
    li.querySelector('.admin-location').textContent = accommodation.location;
    li.querySelector('.admin-maxGuest').textContent =
      '최대 ' + accommodation.maxGuest + '명';
    li.querySelector('.admin-adultPrice').textContent =
      '어른: ' + accommodation.pricing.adultPrice + '원';
    li.querySelector('.admin-childPrice').textContent =
      '어린이: ' + accommodation.pricing.childPrice + '원';
    a.appendChild(li);
    accommodationData.set(accommodation.id, { accommodation, element: a });
  });
}

function buildModifyBtn(id) {
  const btn = document.createElement('button');
  btn.className =
    'modifyAccommodationBtn absolute bg-primary-500 text-white top-2 right-11 hover:bg-primary-500/75 p-1 rounded-xl';
  btn.dataset.id = String(id);
  btn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-6 pointer-events-none">
    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 3.487 1.65-1.65a1.875 1.875 0 1 1 2.652 2.652L8.582 17.07a4.5 4.5 0 0 1-1.897 1.13L3 19l.8-3.685a4.5 4.5 0 0 1 1.13-1.897L16.862 3.487ZM16.862 3.487 19.5 6.125" />
  </svg>
  `;
  return btn;
}

function buildDeleteBtn(id) {
  const btn = document.createElement('button');
  btn.className =
    'deleteAccommodationBtn absolute bg-primary-500 text-white top-2 right-2 hover:bg-primary-500/75 p-1 rounded-xl';
  btn.dataset.id = String(id);
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

  const modifyButton = e.target.closest('.modifyAccommodationBtn');
  if (modifyButton) {
    e.preventDefault();
    e.stopPropagation();
    const id = Number.parseInt(
      modifyButton.dataset.id ??
        modifyButton.closest('.accommodationItem')?.dataset.id,
      10,
    );
    if (Number.isFinite(id)) {
      location.href = `/admin/modify/?id=${id}`;
    }
    return;
  }

  const deleteButton = e.target.closest('.deleteAccommodationBtn');
  if (deleteButton) {
    e.preventDefault();
    e.stopPropagation();
    const id = Number.parseInt(
      deleteButton.dataset.id ??
        deleteButton.closest('.accommodationItem')?.dataset.id,
      10,
    );
    if (!Number.isFinite(id)) {
      return;
    }
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
