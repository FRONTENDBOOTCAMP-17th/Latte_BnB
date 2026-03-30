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
  <input type="text" id="searchInput" class="lg:ml-auto max-w-xl w-full h-10 lg:h-15 bg-white text-shark-800 px-4 py-2 rounded-3xl lg:rounded-4xl shadow-md placeholder:text-shark-600 placeholder:font-medium placeholder:text-center placeholder:bg-[url(./src/assets/search.svg)] placeholder:bg-no-repeat placeholder:bg-[calc(50%-6rem)_0%]" placeholder="특별한 공간 탐색하기" />
  <div class="hidden lg:flex lg:items-center lg:justify-center lg:w-10 lg:aspect-square lg:bg-negative-500 lg:text-white lg:rounded-[50%] lg:ml-auto lg:mr-4">
    <span>A</span>
  </div>
  <div class="hidden lg:flex lg:w-10 lg:aspect-square lg:bg-shark-200 lg:text-shark-700 lg:rounded-[50%] lg:items-center lg:justify-center lg:cursor-pointer">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-6">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  </div>`;

  return header;
}
