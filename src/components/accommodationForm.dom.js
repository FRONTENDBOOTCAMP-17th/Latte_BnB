const HTML_REFERENCE_SELECTORS = {
  thumbnailDisplay: '#thumbnailDisplay',
  thumbnailDeleteBtn: '#thumbnailDeleteBtn',
  title: '#title',
  address: '#address',
  region: '#region',
  maxGuest: '#maxGuest',
  description: '#description',
  imagesContainer: '#imagesContainer',
  adultPrice: '#adultPrice',
  childPrice: '#childPrice',
  serviceFee: '#serviceFee',
  minNights: '#minNights',
  blockedDates: '#blockedDates',
  thumbnailURL: '#thumbnailURL',
  thumbnailFileInput: '#thumbnailFile',
  imageURL: '#imageURL',
  imageFileInput: '#imageFile',
  imageTitleInput: '#imageTitleInput',
  imageDescriptionInput: '#imageDescriptionInput',
  titleInput: '#titleInput',
  regionInput: '#regionInput',
  detailAddressInput: '#detailAddressInput',
  maxGuestInput: '#maxGuestInput',
  descriptionInput: '#descriptionInput',
  adultPriceInput: '#adultPriceInput',
  childPriceInput: '#childPriceInput',
  serviceFeeInput: '#serviceFeeInput',
  minNightsInput: '#minNightsInput',
  startDateInput: '#startDateInput',
  endDateInput: '#endDateInput',
  blockedDateAddBtn: '#blockedDateAddBtn',
};

export function getAccommodationFormHTMLReference(rootElement) {
  if (!(rootElement instanceof Element)) {
    return {};
  }

  const refs = {};
  for (const [key, selector] of Object.entries(HTML_REFERENCE_SELECTORS)) {
    refs[key] = rootElement.querySelector(selector);
  }
  return refs;
}

export function getInputValue(input) {
  return input instanceof HTMLInputElement ||
    input instanceof HTMLTextAreaElement
    ? (input.value ?? '')
    : '';
}
