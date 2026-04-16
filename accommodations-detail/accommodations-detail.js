import { buildFooter } from '../src/components/footer.js';
import { openModal, closeModal } from '../src/components/modal.js';
import { request } from '../src/api/client.js';
import toast from '../src/components/toast.js';

const params = new URLSearchParams(location.search);
const accommodationId = params.get('id');

async function fetchAccommodation() {
  try {
    const json = await request(`/accommodations/${accommodationId}`, {
      method: 'GET',
    });
    const data = json.data;

  const thumbImg = document.querySelector('.accommodation-thumb-img');
  if (data.thumbnailUrl) {
    thumbImg.src = data.thumbnailUrl;
    thumbImg.alt = data.title || '숙소 이미지';
  }

  const gallery = document.getElementById('place-gallery');
  const placeList = document.getElementById('place-list');
  if (data.images && data.images.length > 0) {
    data.images.forEach((img) => {
      const figure = document.createElement('figure');

      figure.className = 'min-w-50 w-50 snap-start m-0 cursor-pointer';
      figure.innerHTML =
        `<img src="${img.url}" alt="${img.title || '숙소 이미지'}" class="w-full h-36 object-cover rounded-lg" />` +
        `<figcaption class="flex flex-col mt-1.5">` +
        `<span class="text-sm font-semibold text-shark-800">${img.title || ''}</span>` +
        `<span class="text-[13px] text-shark-500">${img.description || ''}</span>` +
        `</figcaption>`;
      gallery.appendChild(figure);

      const card = document.createElement('figure');

      card.className = 'm-0 flex flex-col items-center';
      card.innerHTML =
        `<img src="${img.url}" alt="${img.title || '숙소 이미지'}" class="w-full md:w-1/2 rounded-lg object-cover" />` +
        `<figcaption class="flex flex-col mt-1.5 w-full md:w-1/2">` +
        `<span class="text-sm font-semibold text-shark-800">${img.title || ''}</span>` +
        `<span class="text-[13px] text-shark-500">${img.description || ''}</span>` +
        `</figcaption>`;
      placeList.appendChild(card);
    });

    gallery.addEventListener('click', () => {
      openModal(document.getElementById('modal-place'));
    });
  }

  document.getElementById('title').textContent = data.title;

  document.getElementById('address').textContent = data.location.address;

  document.getElementById('details').textContent =
    `${data.location.region} · 최대 인원 ${data.maxGuest}명`;

  const shortDesc =
    data.description.length > 100
      ? data.description.slice(0, 100) + '...'
      : data.description;
  document.getElementById('description').textContent = shortDesc;

  document.getElementById('description-full').textContent = data.description;

  const btn = document.getElementById('btn-reservation');
  btn.dataset.adultPrice = data.pricing.adultPrice;
  btn.dataset.childPrice = data.pricing.childPrice;
  btn.dataset.serviceFee = data.pricing.serviceFee;

  document.getElementById('reservation-price').innerHTML =
    `<span class="text-lg font-bold text-shark-800">₩${data.pricing.adultPrice.toLocaleString()}</span> / 1박`;
  } catch (error) {
    console.error('숙소 정보 조회 실패:', error);
    toast.error('숙소 정보를 불러올 수 없습니다.');
  }
}

fetchAccommodation();


const modalDesc = document.getElementById('modal-desc');
document.getElementById('btn-desc-more').addEventListener('click', () => {
  openModal(modalDesc);
});
document.getElementById('btn-desc-back').addEventListener('click', () => {
  closeModal(modalDesc);
});

const modalPlace = document.getElementById('modal-place');
document.getElementById('btn-place-back').addEventListener('click', () => {
  closeModal(modalPlace);
});

const modalReview = document.getElementById('modal-review');
document.getElementById('btn-review-more').addEventListener('click', () => {
  openModal(modalReview);
});
document.getElementById('btn-review-back').addEventListener('click', () => {
  closeModal(modalReview);
});

document.getElementById('btn-reservation').addEventListener('click', () => {
  location.href = `/reservation-request/?id=${accommodationId}`;
});

document.querySelectorAll('.scroll-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const amount = target.clientWidth * 0.7;
    target.scrollBy({
      left: btn.dataset.dir === 'left' ? -amount : amount,
    });
  });
});

document.body.append(buildFooter());
