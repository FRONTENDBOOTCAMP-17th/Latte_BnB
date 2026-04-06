import './style.css';
import header from './components/header.js';
import { buildFooter } from './components/footer.js';
import hamburger from './components/hamburger';
import navigation from './components/navigation';
import constants from './constants.js';

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
  const token = localStorage.getItem('accessToken');

  try {
    const data = await getProfile(token);

    if (data !== null) {
      return { isAuth: true, data };
    }
    return { isAuth: false, data: null };
  } catch (error) {
    return { isAuth: false, data: null };
  }
}

async function getProfile(token) {
  const res = await fetch(`${constants.API_BASE_URL}/me/profile`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const { message, data } = await res.json();

  if (!res.ok) {
    throw new Error(message);
  }

  return data;
}
