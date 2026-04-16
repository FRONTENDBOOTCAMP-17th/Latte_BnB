function canNavigateBackWithinOrigin() {
  if (history.length <= 1 || !document.referrer) {
    return false;
  }

  try {
    return new URL(document.referrer).origin === location.origin;
  } catch {
    return false;
  }
}

export function buildHistoryBackButton(fallbackHref = '/') {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', 'Go back');
  button.className =
    'fixed top-4 left-4 z-100 rounded-full bg-primary-500 hover:bg-primary-500/80 text-white p-2';
  button.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.8" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M10.75 19.25 3.5 12m0 0 7.25-7.25M3.5 12h17" />
  </svg>
  `;

  button.addEventListener('click', () => {
    if (canNavigateBackWithinOrigin()) {
      history.back();
      return;
    }

    location.href = fallbackHref;
  });

  return button;
}
