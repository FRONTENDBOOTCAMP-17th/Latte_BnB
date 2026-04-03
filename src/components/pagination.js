let prevButton = null;
let nextButton = null;
let currentPage = null;

function buildPagination({ page, hasNext, hasPrev }) {
  const pagination = document.createElement('div');
  pagination.id = 'pagination';
  pagination.className =
    'flex gap-4 flex-nowrap p-2 mt-20 items-center justify-center';

  currentPage = document.createElement('div');
  currentPage.id = 'currentPage';
  currentPage.textContent = page;

  prevButton = document.createElement('button');
  prevButton.type = 'button';
  prevButton.id = 'prevButton';
  prevButton.className =
    'aspect-square p-1 flex items-center justify-center not-disabled:cursor-pointer text-shark-700 hover:not-disabled:text-shark-700/80 disabled:text-shark-300';
  prevButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
  `;
  if (hasPrev === false) {
    prevButton.disabled = !hasPrev;
  }

  nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.id = 'nextButton';
  nextButton.className =
    'aspect-square p-1 flex items-center justify-center cursor-pointer text-shark-700 hover:text-shark-700/70';
  nextButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
    <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
  `;
  if (hasNext === false) {
    nextButton.disabled = !hasNext;
  }

  pagination.append(prevButton, currentPage, nextButton);
  return pagination;
}

export default { buildPagination };
