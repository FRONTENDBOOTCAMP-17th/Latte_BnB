import '../../src/style.css';
import { checkAdmin } from '../../src/api/auth';
import adminLogo from '../adminLogo';
import accommodationForm from '../../src/components/accommodationForm';
import constants from '../../src/constants';

const params = new URLSearchParams(location.search);
const content = document.getElementById('content');

document.body.prepend(adminLogo.build());
content.classList.replace('flex', 'hidden');

checkAdmin();

const fetchPromise = accommodationForm.fetchAccommodation(params.get('id'));
fetchPromise.then(({ success }) => {
  if (success) {
    // content.append(accommodationForm.buildViewMode());
    content.append(accommodationForm.buildForm(constants.FORM_MODE.VIEW));
    content.classList.replace('hidden', 'flex');
  }
});

// content.append(accommodationForm.buildEditMode(accommodationForm.Mode.ADD));
// content.classList.replace('hidden', 'flex');
