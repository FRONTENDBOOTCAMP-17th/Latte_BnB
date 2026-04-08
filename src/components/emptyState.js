export function buildEmptyState(message) {
  const div = document.createElement('div');
  div.className =
    'w-full min-h-140 col-span-3 flex gap-20 items-center justify-center text-lg font-semibold text-shark-600';
  div.innerHTML = `${message} <span></span> 비어있습니다.`;

  const highlight = div.querySelector('span');
  highlight.className =
    'inline-block text-[10rem] font-extrabold text-primary-500 align-text-top';
  highlight.textContent = '텅...';

  return div;
}
