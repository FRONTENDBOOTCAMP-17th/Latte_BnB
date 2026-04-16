export function buildFooter() {
  const footer = document.createElement('footer');
  footer.className =
    'min-w-100 px-[clamp(20px,4vw,80px)] bg-shark-100 hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-5 py-5';
  footer.innerHTML = `
  <div id="brand" class="col-start-1 -col-end-1 -ml-2">
    <span class="text-primary-400 flex items-center justify-start">
      <svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" role="img" aria-label="latte bnb 로고">
        <path fill="currentColor" d="M128 12 C78 12 38 52 38 102 C38 170 93 220 121 248 C125 252 131 252 135 248 C163 220 218 170 218 102 C218 52 178 12 128 12Z" />
        <path fill="#FFFFFF" d="M127 70 L80 105 C77 108 78 114 82 114 L88 114 L88 150 C88 154 91 157 95 157 L161 157 C165 157 168 154 168 150 L168 114 L175 114 C180 114 181 108 178 106 L160 94 L160 74 C160 71 158 69 155 69 L145 69 C142 69 140 71 140 74 L140 79 L133 73 C130 70 126 70 123 73Z" />
        <rect x="110" y="108" width="14" height="14" rx="2" fill="currentColor" />
        <rect x="132" y="108" width="14" height="14" rx="2" fill="currentColor" />
        <rect x="110" y="130" width="14" height="14" rx="2" fill="currentColor" />
        <rect x="132" y="130" width="14" height="14" rx="2" fill="currentColor" />
      </svg>
      <span class="font-semibold text-xl">lattebnb</span>
    </span>
    <p class="text-sm text-shark-600 ml-2 font-medium">
      감성 숙소를 쉽고 편하게 찾는 예약 서비스
    </p>
  </div>
  <ul class="text-shark-700">
    <li>
      <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">서비스</h3>
    </li>
    <li><a href="/profile/" class="text-sm">프로필</a></li>
    <li><a href="/" class="text-sm">숙소 둘러보기</a></li>
    <li><a href="/reservations-check/" class="text-sm">예약 조회</a></li>
    <li><a href="/wishlist/" class="text-sm">위시리스트</a></li>
  </ul>
  <ul class="text-shark-700">
    <li>
      <h3 class="scroll-m-20 text-xl font-semibold tracking-tight">
        고객센터
      </h3>
    </li>
    <li>
      <p class="text-sm">help@lattebnb.com</p>
    </li>
    <li>
      <p class="text-sm">09:00 - 18:00</p>
    </li>
  </ul>
  <ul
    class="col-start-1 -col-end-1 self-end justify-self-center text-xs text-shark-600">
    <li><p>© 2026 Latte BnB. All rights reserved.</p></li>
    <li><p>본 페이지는 학습용 클론 코딩 프로젝트입니다.</p></li>
  </ul>
  `;

  return footer;
}
