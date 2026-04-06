import hamburger from './hamburger';

export function buildHeader() {
  const header = document.createElement('header');

  header.className =
    'min-w-100 bg-shark-100/55 flex flex-col lg:flex-row items-center lg:justify-between px-[clamp(20px,4vw,80px)] pb-5 pt-2 lg:pt-4 border-b-2 border-shark-200';

  header.innerHTML = `
  <a href="/" id="logo" class="w-fit h-15 text-primary-400 flex items-center justify-start">
    <svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" role="img" aria-label="latte bnb 로고">
      <path fill="currentColor"
        d="M128 12 C78 12 38 52 38 102 C38 170 93 220 121 248 C125 252 131 252 135 248 C163 220 218 170 218 102 C218 52 178 12 128 12Z" />
      <path fill="#FFFFFF"
        d="M127 70 L80 105 C77 108 78 114 82 114 L88 114 L88 150 C88 154 91 157 95 157 L161 157 C165 157 168 154 168 150 L168 114 L175 114 C180 114 181 108 178 106 L160 94 L160 74 C160 71 158 69 155 69 L145 69 C142 69 140 71 140 74 L140 79 L133 73 C130 70 126 70 123 73Z" />
      <rect
        x="110" y="108" width="14" height="14" rx="2" fill="currentColor" />
      <rect x="132" y="108" width="14" height="14" rx="2" fill="currentColor" />
      <rect x="110" y="130" width="14" height="14" rx="2" fill="currentColor" />
      <rect x="132" y="130" width="14" height="14" rx="2" fill="currentColor" />
    </svg>
    <p class="font-semibold text-2xl">lattebnb</p>
  </a>
  <div class="lg:ml-auto max-w-xl w-full relative">
    <input type="text" id="searchInput" class="w-full h-10 lg:h-15 bg-white text-shark-800 px-4 py-2 rounded-3xl lg:rounded-4xl shadow-md placeholder:text-shark-600 placeholder:font-medium placeholder:text-center placeholder:bg-[url(./src/assets/search.svg)] placeholder:bg-no-repeat placeholder:bg-[calc(50%-6rem)_75%] placeholder:bg-size-[16px_16px]" placeholder="특별한 공간 탐색하기" />
    <button id="searchBtn" type="button" class="bg-primary-500 hover:bg-primary-500/85 text-white absolute p-2 right-1 lg:right-2 top-1/2 -translate-y-1/2 rounded-[50%]">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4 lg:size-6 pointer-events-none">
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </button>
  </div>`;

  header.appendChild(hamburger.buildHamburger());

  const profilePromise = hamburger.checkAuth();

  profilePromise.then((result) => {
    header
      .getElementsByClassName('hamburger')[0]
      .appendChild(hamburger.buildMenu(result));
    hamburger.attachEvent();
  });

  return header;
}
