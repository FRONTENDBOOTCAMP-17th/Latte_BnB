let hamburgerBtn = null;
let hamburgerMenu = null;

function buildHamburger() {
  const div = document.createElement('div');
  div.className = 'hamburger relative lg:ml-auto';

  div.innerHTML = `
  <button type="button" class="hidden lg:bg-primary-500 lg:hover:bg-primary-500/85 text-white w-12 aspect-square lg:flex lg:items-center lg:justify-center lg:rounded-[50%] cursor-pointer transition-colors">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  </button>
  `;
  hamburgerBtn = div;
  return div;
}

function buildMenu(result) {
  const div = document.createElement('div');
  div.className =
    'hidden absolute mt-2 right-0 bg-white flex-col items-center shadow-[0_0_0_1px_rgba(0,0,0,0.04),0_12px_30px_rgba(0,0,0,0.08)] gap-2 py-4 rounded-xl z-100';

  if (result.isAuth) {
    div.classList.add('w-60');
    div.innerHTML = `
    <div class="w-full grid grid-cols-[0.5fr_1.5fr] grid-rows-2 gap-2 m-2">
      <img class="col-start-1 row-span-2 w-10 aspect-square rounded-[50%] place-self-center" src="/src/assets/avatar1.jpg" alt="user avatar"/>
      <strong class="hamburgerUsername col-start-2 row-start-1 text-shark-800"></strong>
      <span class="col-start-2 row-start-2 text-shark-600 text-sm">방문을 환영합니다.</span>
    </div>
    <hr class="w-[90%] self-center border-t-2 border-shark-200" />
    <a href="/" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/home.svg" alt="홈 svg 이미지" class="w-6 m-2" />홈
    </a>
    <a href="/profile/" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/profile.svg" alt="프로필 svg 이미지" class="w-6 m-2" />프로필
    </a>
    <a href="/wishlist/" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/wish.svg" alt="위시리스트 svg 이미지" class="w-6 m-2" />위시 리스트
    </a>
    <a href="/reservations-check/" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/reservation.svg" alt="예약목록 svg 이미지" class="w-6 m-2" />내 예약 확인
    </a>
    <hr class="w-[90%] self-center border-t-2 border-shark-200" />
    <button type="button" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/logout.svg" alt="로그아웃 svg 이미지" class="w-6 m-2" />로그아웃
    </button>
    `;
    div.getElementsByTagName('strong')[0].textContent =
      `${result.data.name} 님`;
    hamburgerMenu = div;
    return div;
  } else {
    div.classList.add('w-80');
    div.innerHTML = `
    <p class="text-lg font-bold text-center">
      Latte BnB에 오신 걸 환영합니다.
    </p>
    <hr class="w-[90%] self-center border-t-2 border-shark-200" />
    <a href="/" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/home.svg" alt="홈 svg 이미지" class="w-6 m-2" />홈
    </a>
    <a href="/login/" class="w-full h-10 font-semibold flex items-center text-shark-700 hover:bg-shark-500/10 px-4">
      <img src="/src/assets/login.svg" alt="로그인 svg 이미지" class="w-6 m-2" />로그인
    </a>
    `;
    hamburgerMenu = div;
    return div;
  }
}

function attachEvent() {
  hamburgerBtn.addEventListener('click', (e) => {
    hamburgerMenu.classList.toggle('hidden');
    hamburgerMenu.classList.toggle('flex');
  });

  const logoutBtn = hamburgerMenu?.querySelector('button');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      const { logout } = await import('../api/auth.js');
      const { removeToken } = await import('../utils/auth.js');
      try {
        await logout();
        removeToken();
        location.href = '/';
      } catch (error) {
        console.error('로그아웃 실패:', error);
      }
    });
  }
}

export default { buildHamburger, buildMenu, attachEvent };
