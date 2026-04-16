import constants from '../constants.js';

export class FormImage {
  #id = '';
  #element = null;
  #title = '';
  #description = '';
  #src;

  constructor(src, mode, title = '', description = '', options = {}) {
    this.#id = options.id ?? crypto.randomUUID();
    this.#src = src;
    this.#title = title;
    this.#description = description;
    this.#element = this.#buildElement(mode, options.checked ?? false);
  }

  #buildElement(mode, checked) {
    const div = document.createElement('div');
    div.dataset.id = this.#id;
    div.className = 'relative';

    const img = document.createElement('img');
    img.src = this.#src;
    img.alt = 'accommodation image';
    img.className = 'max-w-80 min-w-80 aspect-square object-cover rounded-2xl';

    if (mode !== constants.FORM_MODE.VIEW) {
      const button = document.createElement('button');
      button.className =
        'imageDeleteBtn absolute border-2 border-primary-700 bg-primary-500 text-white top-2 right-2 hover:bg-primary-500/80 p-1 rounded-xl';
      button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 pointer-events-none">
        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>`;

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.id = this.#id;
      radio.name = 'image';
      radio.value = this.#id;
      radio.className = 'absolute top-2 left-2 accent-primary-500';
      radio.checked = checked;
      div.append(radio, button);

      img.addEventListener('click', () => {
        radio.click();
      });
    }

    const title = document.createElement('h3');
    title.textContent = this.#title;
    title.className = 'font-semibold text-sm text-shark-700';

    const description = document.createElement('p');
    description.textContent = this.#description;
    description.className = 'text-xs text-shark-500';

    div.append(img, title, description);

    return div;
  }

  getElement() {
    return this.#element;
  }

  getId() {
    return this.#id;
  }

  getTitle() {
    return this.#title;
  }

  getDescription() {
    return this.#description;
  }

  getSrc() {
    return this.#src;
  }

  setTitle(title) {
    this.#title = title;
  }

  setDescription(description) {
    this.#description = description;
  }
}
