import '../../src/style.css';
import accommodationForm from '../../src/components/accommodationForm.js';
import adminLogo from '../adminLogo.js';
import toast from '../../src/components/toast.js';
import { deleteAccommodation } from '../adminLanding.js';
import { getProfile } from '../../src/api/auth.js';
import { buildHistoryBackButton } from '../../src/components/historyBackButton.js';

const params = new URLSearchParams(location.search);
const content = document.getElementById('content');
const btnContainer = document.getElementById('btnContainer');

document.body.prepend(adminLogo.build());
document.body.prepend(buildHistoryBackButton('/admin/'));
content.classList.replace('flex', 'hidden');

const profilePromise = getProfile();

profilePromise
  .then(({ data }) => {
    if (data.user.role !== 'ADMIN') {
      throw new Error();
    }
  })
  .catch(() => {
    location.replace('/admin/login/');
  });

const fetchPromise = accommodationForm.fetchAccommodation(params.get('id'));
fetchPromise.then(({ success }) => {
  if (success) {
    content.append(accommodationForm.buildViewMode());
    content.classList.replace('hidden', 'flex');
  }
});

btnContainer.appendChild(buildModifyBtn());
btnContainer.appendChild(buildDeleteBtn());

document.addEventListener('click', async (e) => {
  const deleteButton = e.target.closest('.deleteAccommodationBtn');
  if (deleteButton) {
    try {
      const result = await deleteAccommodation(params.get('id'));
      if (result.success) {
        location.replace('/admin/');
      }
    } catch (error) {
      toast.warn('숙소 삭제', error.message, 3);
    }
  }
  const modifyButton = e.target.closest('.modifyAccommodationBtn');
  if (modifyButton) {
    const id = modifyButton.dataset.id;
    if (id) {
      location.href = `/admin/modify/?id=${id}`;
    }
  }
});

function buildDeleteBtn() {
  const btn = document.createElement('button');
  btn.className =
    'deleteAccommodationBtn bg-primary-500 text-white hover:bg-primary-500/75 p-1 rounded-xl w-8 h-8';
  btn.dataset.id = params.get('id') ?? '';
  btn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pointer-events-none">
    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
  `;
  return btn;
}

function buildModifyBtn() {
  const btn = document.createElement('button');
  btn.className =
    'modifyAccommodationBtn bg-primary-500 text-white hover:bg-primary-500/75 p-1 rounded-xl w-8 h-8';
  btn.dataset.id = params.get('id') ?? '';
  btn.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-6 pointer-events-none">
    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 3.487 1.65-1.65a1.875 1.875 0 1 1 2.652 2.652L8.582 17.07a4.5 4.5 0 0 1-1.897 1.13L3 19l.8-3.685a4.5 4.5 0 0 1 1.13-1.897L16.862 3.487ZM16.862 3.487 19.5 6.125" />
  </svg>
  `;
  return btn;
}

