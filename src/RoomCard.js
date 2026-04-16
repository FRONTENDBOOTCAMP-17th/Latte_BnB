import constants from './constants.js';
import toast from './components/toast.js';
import { toggleWishList } from '../src/api/auth.js';

export class RoomCard {
  #id;
  #title;
  #location;
  #thumbnailUrl;
  #pricing;
  #maxGuest;
  #isWish = false;
  #element = null;
  #titleNode = null;
  #thumbnailNode = null;
  #priceNode = null;
  #maxGuestNode = null;
  #locationNode = null;
  #wishNode = null;

  constructor({
    id,
    title = '',
    location = '',
    maxGuest = 1,
    pricing = { adultPrice: 0, childPrice: 0, currency: 'KRW' },
    thumbnailUrl = '',
  }) {
    this.#id = id;
    this.#title = title;
    this.#location = location;
    this.#maxGuest = maxGuest;
    this.#pricing = pricing;
    this.#thumbnailUrl = thumbnailUrl;
    this.#element = this.#buildElement();
  }

  #buildElement() {
    const li = document.createElement('li');
    li.className = 'accommodationCard';
    li.dataset.id = this.#id;

    li.innerHTML = `
      <div class="min-w-[320px] w-full h-full relative bg-white text-shark-800 rounded-2xl overflow-clip shadow-[0_1px_6px_rgba(0,0,0,0.08)] cursor-pointer hover:scale-[1.02] transition-transform duration-200">
        <a href="/accommodations-detail/?id=${this.#id}" class="focus:outline-none">
          <div class="relative overflow-hidden">
            <img src='${this.#thumbnailUrl}' alt='대표 이미지' class="accommodationThumbnail w-full aspect-2/1 object-cover"/>
          </div>
          <div class="p-4 flex flex-col gap-2">
            <p class="accommodationTitle text-base font-semibold line-clamp-1"></p>
            <p class="accommodationLocation text-sm text-shark-400"></p>
            <div class="flex items-center justify-between mt-1">
              <p class="accommodationPrice text-lg font-bold text-shark-900 break-keep"></p>
              <p class="accommodationMaxGuest text-xs text-shark-400"></p>
            </div>
          </div>
        </a>
        <div class="wishHeart absolute text-transparent right-3 top-3 hover:scale-110 transition-[scale] duration-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="white"
            class="size-6 pointer-events-none">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
      </div>`;

    this.#titleNode = li.querySelector('.accommodationTitle');
    this.#thumbnailNode = li.querySelector('.accommodationThumbnail');
    this.#priceNode = li.querySelector('.accommodationPrice');
    this.#locationNode = li.querySelector('.accommodationLocation');
    this.#maxGuestNode = li.querySelector('.accommodationMaxGuest');
    this.#wishNode = li.querySelector('.wishHeart');
    this.#wishNode.addEventListener('click', async (e) => {
      const result = await toggleWishList(this.#id, !this.#isWish);

      if (!result || !result.success) {
        toast.warn('실패', '위시리스트에 추가하려면 로그인해야합니다.', 3);
        return;
      }

      this.setWish(result.data.isWishlisted);
      toast.success('성공', result.message, 3);
    });

    this.#syncDOM();

    return li;
  }

  #syncDOM() {
    this.#titleNode.textContent = this.#title;
    this.#priceNode.textContent = `₩ ${this.#pricing.adultPrice.toLocaleString()} / 1박`;
    this.#maxGuestNode.textContent = `최대 ${this.#maxGuest}명`;
    this.#locationNode.textContent = `${this.#location}`;
  }

  getElement() {
    return this.#element;
  }

  set({
    id = this.#id,
    title = this.#title,
    location = this.#location,
    maxGuest = this.#maxGuest,
    pricing = this.#pricing,
    thumbnailUrl = this.#thumbnailUrl,
  } = {}) {
    this.#id = id;
    this.#title = title;
    this.#location = location;
    this.#maxGuest = maxGuest;
    this.#pricing = pricing;
    this.#thumbnailUrl = thumbnailUrl;
    this.#syncDOM();
  }

  setWish(isWish) {
    this.#isWish = isWish;

    if (this.#isWish) {
      this.#wishNode.classList.remove('text-transparent');
      this.#wishNode.classList.add('text-primary-400');
    } else {
      this.#wishNode.classList.add('text-transparent');
      this.#wishNode.classList.remove('text-primary-400');
    }
  }
}
