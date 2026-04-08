import '../../src/style.css';
import accommodationForm from '../../src/components/accommodationForm.js';

const params = new URLSearchParams(location.search);

const fetchPromise = accommodationForm.fetchAccommodation(params.get('id'));
fetchPromise.then(({ success, message }) => {
  if (success) {
    document.body.append(accommodationForm.buildViewMode());
  }
});
