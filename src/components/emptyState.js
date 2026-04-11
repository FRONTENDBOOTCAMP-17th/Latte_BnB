export function buildEmptyState(message) {
  const div = document.createElement('div');
  div.className =
    'w-full min-h-140 col-span-3 flex gap-20 items-center justify-center text-lg font-semibold text-shark-600';

  const text = document.createTextNode(`${message} `);
  const highlight = document.createElement('span');
  highlight.className =
    'inline-block text-[10rem] font-extrabold text-primary-500 align-text-top';
  highlight.textContent = `텅...`;
  const empty = document.createTextNode(` 비어있습니다.`);

  div.append(text, highlight, empty);
  return div;
}
