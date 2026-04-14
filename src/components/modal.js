let openCount = 0;

export function openModal(element) {
  if (!element) return;
  element.classList.remove('hidden');
  element.classList.add('flex');
  openCount++;
  document.body.classList.add('overflow-hidden');
}

export function closeModal(element) {
  if (!element) return;
  element.classList.remove('flex');
  element.classList.add('hidden');
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.body.classList.remove('overflow-hidden');
  }
}
