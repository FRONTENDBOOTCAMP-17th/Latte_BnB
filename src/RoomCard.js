export class RoomCard {
  #id;
  #title;
  #location;
  #thumbnailUrl;
  #pricing;
  #maxGuest;
  #element = null;
  #titleNode = null;
  #thumbnailNode = null;
  #priceNode = null;
  #maxGuestNode = null;
  #locationNode = null;

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
    <div class="min-w-[320px] w-full h-full bg-slate-50 text-shark-800 rounded-xl overflow-clip shadow-lg cursor-pointer ">
      <img src='${this.#thumbnailUrl}' alt='대표 이미지' class="accommodationThumbnail w-full h-46 object-cover"/>
      <div class="p-4 pt-2 grid grid-cols-2 grid-rows-[repeat(3,minmax(56px,1fr))] gap-1">
        <p class="accommodationTitle text-lg col-satrt-1"></p>
        <p class="accommodationPrice text-xl font-semibold col-start-2 justify-self-end">
        </p>
        <p class="accommodationMaxGuest text-sm row-start-3 col-start-1 self-start"></p>
        <p class="accommodationLocation text-sm row-start-3 col-start-1 self-end"></p>
        <div
          class="text-transparent col-start-2 row-start-3 place-self-end hover:scale-110 transition-[scale] duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke-width="1"
            stroke="black"
            class="size-6">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
      </div>
    </div>`;

    this.#titleNode = li.querySelector('.accommodationTitle');
    this.#thumbnailNode = li.querySelector('.accommodationThumbnail');
    this.#priceNode = li.querySelector('.accommodationPrice');
    this.#locationNode = li.querySelector('.accommodationLocation');
    this.#maxGuestNode = li.querySelector('.accommodationMaxGuest');

    this.#syncDOM();

    return li;
  }

  #syncDOM() {
    this.#titleNode.textContent = this.#title;
    this.#priceNode.textContent = `₩ ${this.#pricing.adultPrice} / 1박`;
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
    tumbnailUrl = this.#thumbnailUrl,
  } = {}) {
    this.#id = id;
    this.#title = title;
    this.#location = location;
    this.#maxGuest = maxGuest;
    this.#pricing = pricing;
    this.#thumbnailUrl = tumbnailUrl;
    this.#syncDOM();
  }
}
