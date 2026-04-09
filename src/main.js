import './style.css';
import header from './components/header.js';
import { buildFooter } from './components/footer.js';
import hamburger from './components/hamburger';
import navigation from './components/navigation';
import { getProfile } from '../src/api/auth.js';

let result = null;

if (document.body.dataset.header === 'true') {
  document.body.prepend(header.buildHeader());

  document.querySelector('header').appendChild(hamburger.buildHamburger());

  result = await checkAuth();

  document.querySelector('.hamburger').appendChild(hamburger.buildMenu(result));
  hamburger.attachEvent();
}

if (document.body.dataset.search === 'true') {
  document
    .querySelector('header')
    .insertBefore(
      header.buildSearchBar(),
      document.querySelector('.hamburger'),
    );
}

if (document.body.dataset.nav === 'true') {
  if (result === null) {
    result = await checkAuth();
  }
  document.body.appendChild(navigation.buildNavigation());
  navigation.buildMenu(result);
}

if (document.body.dataset.footer === 'true') {
  document.body.append(buildFooter());
}

async function checkAuth() {
  try {
    const data = await getProfile();

    if (data) {
      return { isAuth: true, data };
    }
    return { isAuth: false, data: null };
  } catch (error) {
    console.log(error.message + '\n프로필 조회 실패');
    return { isAuth: false, data: null };
  }
}
