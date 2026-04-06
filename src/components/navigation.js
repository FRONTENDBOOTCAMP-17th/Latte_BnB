let navigation = null;

function buildNavigation() {
  const div = document.createElement('div');
  div.className =
    'flex lg:hidden justify-between px-[clamp(1.25rem,4vw,5rem)] pt-2 pb-1 border-t-2 border-shark-300 bg-shark-100 min-w-100 w-full fixed bottom-0';

  navigation = div;
  return div;
}

function buildMenu(result) {
  if (result.isAuth) {
    navigation.innerHTML = `
    <a href="/" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/search.svg" alt="nav search svg" class="w-6" />검색
    </a>
    <a href="" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/wish.svg" alt="nav wish svg" class="w-6" />위시리스트
    </a>
    <a href="" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/reservation.svg" alt="nav reservation svg" class="w-6" />내 예약
    </a>
    <a href="/profile/" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/profile.svg" alt="nav profile svg" class="w-6" />프로필
    </a>
    `;
  } else {
    navigation.innerHTML = `
    <a href="/" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/search.svg" alt="nav search svg" class="w-6" />검색
    </a>
    <a href="/login" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/wish.svg" alt="nav wish svg" class="w-6" />위시리스트
    </a>
    <a href="/login/" class="flex flex-col items-center justify-center text-sm">
      <img src="./src/assets/profile.svg" alt="nav profile svg" class="w-6" />로그인
    </a>
    `;
  }
}

export default { buildNavigation, buildMenu };
