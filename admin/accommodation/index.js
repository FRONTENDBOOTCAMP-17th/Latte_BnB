import '../../src/style.css';
import accommodationForm from '../../src/components/accommodationForm.js';
import adminLogo from '../adminLogo.js';

const params = new URLSearchParams(location.search);
const content = document.getElementById('content');

document.body.prepend(adminLogo.build());

const fetchPromise = accommodationForm.fetchAccommodation(params.get('id'));
fetchPromise.then(({ success, message }) => {
  if (success) {
    content.append(accommodationForm.buildViewMode());
  }
});
