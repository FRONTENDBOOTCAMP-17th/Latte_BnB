export class RoomCard {
  #id;
  #title;
  #location;
  #thumbnailUrl;
  #rating;
  #reviewCount;
  #audultPricePerNight;
  #period;
  #hostName;
  #element = null;
  #titleNode = null;
  #thumbnailNode = null;
  #priceNode = null;
  #periodNode = null;
  #ratingNode = null;

  constructor({
    id,
    title = '',
    location = '',
    rating = '',
    reviewCount = 0,
    audultPricePerNight = 0,
    period = '',
    hostName = '',
    tumbnailUrl = '',
  }) {
    this.#id = id;
    this.#title = title;
    this.#location = location;
    this.#rating = rating;
    this.#reviewCount = reviewCount;
    this.#audultPricePerNight = audultPricePerNight;
    this.#period = period;
    this.#hostName = hostName;
    this.#thumbnailUrl = tumbnailUrl;
    this.#element = this.#buildElement();
  }

  #buildElement() {
    const li = document.createElement('li');
    li.className = 'accommodationCard';
    li.dataset.id = this.#id;

    li.innerHTML = `
    <div class="min-w-[320px] w-full bg-slate-50 text-shark-800 rounded-xl overflow-clip shadow-lg cursor-pointer">
      <div class="accommodationThumbnail w-full h-46 bg-cover bg-center"></div>
      <div class="p-4 pt-2 grid grid-cols-2 grid-rows-3 gap-1">
        <p class="accommodationTitle text-lg col-satrt-1"></p>
        <p class="accommodationPrice text-xl font-semibold col-start-2 justify-self-end">
        </p>
        <p class="accommodationPeriod text-sm row-start-2 self-end"></p>
        <p class="accommodationRating text-sm row-start-3"></p>
        <div
          class="text-transparent col-start-2 row-start-3 justify-self-end hover:scale-110 transition-[scale] duration-300">
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
    this.#periodNode = li.querySelector('.accommodationPeriod');
    this.#ratingNode = li.querySelector('.accommodationRating');

    this.#syncDOM();

    return li;
  }

  #syncDOM() {
    this.#titleNode.textContent = this.#title;
    this.#thumbnailNode.style.backgroundImage = `url(${this.#thumbnailUrl})`;
    this.#priceNode.textContent = `₩ ${this.#audultPricePerNight} / 1박`;
    this.#periodNode.textContent = this.#period;
    this.#ratingNode.textContent = `★ ${this.#rating}`;
  }

  getElement() {
    return this.#element;
  }

  set({
    id = this.#id,
    title = this.#title,
    location = this.#location,
    rating = this.#rating,
    reviewCount = this.#reviewCount,
    audultPricePerNight = this.#audultPricePerNight,
    period = this.#period,
    hostName = this.#hostName,
    tumbnailUrl = this.#thumbnailUrl,
  } = {}) {
    this.#id = id;
    this.#title = title;
    this.#location = location;
    this.#rating = rating;
    this.#reviewCount = reviewCount;
    this.#audultPricePerNight = audultPricePerNight;
    this.#period = period;
    this.#hostName = hostName;
    this.#thumbnailUrl = tumbnailUrl;
    this.#syncDOM();
  }
}
