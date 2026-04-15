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

content.addEventListener('click', (e) => {
  const deleteButton = e.target.closest('#thumbnailDeleteBtn');
  if (deleteButton) {
    accommodationForm.removeThumbnail();
    return;
  }

  const insertButton = e.target.closest('#thumbnailInsertBtn');
  if (insertButton) {
    const thumbnailURLInput = content.querySelector('#thumbnailURL');
    const url = thumbnailURLInput?.value.trim() ?? '';
    if (!url) {
      return;
    }

    accommodationForm.setThumbnailFromUrl(url);
    return;
  }

  const imageDeleteButton = e.target.closest('.imageDeleteBtn');
  if (imageDeleteButton) {
    const imageElement = imageDeleteButton.closest('[data-id]');
    const imageId = imageElement?.dataset.id;
    if (!imageId) {
      return;
    }

    accommodationForm.removeImage(imageId);
    return;
  }

  const imageInsertButton = e.target.closest('#imageInsertBtn');
  if (imageInsertButton) {
    const imageURLInput = content.querySelector('#imageURL');
    const url = imageURLInput?.value.trim() ?? '';
    if (!url) {
      return;
    }

    accommodationForm.addImageFromUrl(url);
    return;
  }

  const imageTitleApplyButton = e.target.closest('#imageTitleApplyBtn');
  if (imageTitleApplyButton) {
    const imageTitleInput = content.querySelector('#imageTitleInput');
    accommodationForm.updateSelectedImageTitle(imageTitleInput?.value ?? '');
    return;
  }

  const imageDescriptionApplyButton = e.target.closest(
    '#imageDescriptionApplyBtn',
  );
  if (imageDescriptionApplyButton) {
    const imageDescriptionInput = content.querySelector('#imageDescriptionInput');
    accommodationForm.updateSelectedImageDescription(
      imageDescriptionInput?.value ?? '',
    );
    return;
  }

  const titleApplyButton = e.target.closest('#titleApplyBtn');
  if (titleApplyButton) {
    const titleInput = content.querySelector('#titleInput');
    accommodationForm.updateAccommodationTitle(titleInput?.value ?? '');
    return;
  }

  const addressApplyButton = e.target.closest('#addressApplyBtn');
  if (addressApplyButton) {
    const regionInput = content.querySelector('#regionInput');
    const detailAddressInput = content.querySelector('#detailAddressInput');
    accommodationForm.updateAccommodationAddress(
      regionInput?.value ?? '',
      detailAddressInput?.value ?? '',
    );
    return;
  }

  const maxGuestApplyButton = e.target.closest('#maxGuestApplyBtn');
  if (maxGuestApplyButton) {
    const maxGuestInput = content.querySelector('#maxGuestInput');
    accommodationForm.updateAccommodationMaxGuest(maxGuestInput?.value ?? '');
    return;
  }

  const descriptionApplyButton = e.target.closest('#descriptionApplyBtn');
  if (descriptionApplyButton) {
    const descriptionInput = content.querySelector('#descriptionInput');
    accommodationForm.updateAccommodationDescription(
      descriptionInput?.value ?? '',
    );
    return;
  }

  const adultPriceApplyButton = e.target.closest('#adultPriceApplyBtn');
  if (adultPriceApplyButton) {
    const adultPriceInput = content.querySelector('#adultPriceInput');
    accommodationForm.updateAccommodationPrice(
      'adultPrice',
      adultPriceInput?.value ?? '',
    );
    return;
  }

  const childPriceApplyButton = e.target.closest('#childPriceApplyBtn');
  if (childPriceApplyButton) {
    const childPriceInput = content.querySelector('#childPriceInput');
    accommodationForm.updateAccommodationPrice(
      'childPrice',
      childPriceInput?.value ?? '',
    );
    return;
  }

  const serviceFeeApplyButton = e.target.closest('#serviceFeeApplyBtn');
  if (serviceFeeApplyButton) {
    const serviceFeeInput = content.querySelector('#serviceFeeInput');
    accommodationForm.updateAccommodationPrice(
      'serviceFee',
      serviceFeeInput?.value ?? '',
    );
    return;
  }

  const minNightsApplyButton = e.target.closest('#minNightsApplyBtn');
  if (minNightsApplyButton) {
    const minNightsInput = content.querySelector('#minNightsInput');
    accommodationForm.updateAccommodationMinNights(minNightsInput?.value ?? '');
    return;
  }

  const blockedDateAddButton = e.target.closest('#blockedDateAddBtn');
  if (blockedDateAddButton) {
    const startDateInput = content.querySelector('#startDateInput');
    const endDateInput = content.querySelector('#endDateInput');
    const result = accommodationForm.addBlockedDate(
      startDateInput?.value ?? '',
      endDateInput?.value ?? '',
    );
    if (!result.success && result.message) {
      alert(result.message);
    }
    return;
  }

  const blockedDateDeleteButton = e.target.closest('.blockedDateDeleteBtn');
  if (blockedDateDeleteButton) {
    const blockedDateId = blockedDateDeleteButton.dataset.id;
    if (!blockedDateId) {
      return;
    }

    accommodationForm.removeBlockedDate(blockedDateId);
  }
});

content.addEventListener('change', (e) => {
  const fileInput = e.target.closest('#thumbnailFile');
  if (!(fileInput instanceof HTMLInputElement)) {
    return;
  }

  const file = fileInput.files?.[0];
  if (!file) {
    return;
  }

  accommodationForm.setThumbnailFromFile(file);
  return;
});

content.addEventListener('change', (e) => {
  const imageFileInput = e.target.closest('#imageFile');
  if (imageFileInput instanceof HTMLInputElement) {
    const files = Array.from(imageFileInput.files ?? []);
    if (files.length === 0) {
      return;
    }

    accommodationForm.addImagesFromFiles(files);
    return;
  }

  const imageRadio = e.target.closest('input[name="image"]');
  if (imageRadio instanceof HTMLInputElement) {
    accommodationForm.setSelectedImage(imageRadio.value);
  }
});

const fetchPromise = accommodationForm.fetchAccommodation(params.get('id'));
fetchPromise.then(({ success }) => {
  if (success) {
    // content.append(accommodationForm.buildViewMode());
    content.append(accommodationForm.buildForm(constants.FORM_MODE.EDIT));
    content.classList.replace('hidden', 'flex');
  }
});

// content.append(accommodationForm.buildEditMode(accommodationForm.Mode.ADD));
// content.classList.replace('hidden', 'flex');
