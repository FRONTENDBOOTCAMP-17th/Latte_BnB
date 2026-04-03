let numberInputs = null;

function render() {
  numberInputs = document.getElementsByClassName('numberInput');
  for (let numberInput of numberInputs) {
    numberInput.appendChild(buildHTML(numberInput));
  }
}

function buildHTML(root) {
  const fragment = document.createDocumentFragment();
  const input = document.createElement('input');
  const minus = document.createElement('button');
  const plus = document.createElement('button');

  input.type = 'number';
  input.name = root.dataset.name;
  input.id = root.dataset.id;
  input.className = 'adminInputNumber rounded-none w-20 text-center';
  input.min = root.dataset.min;
  input.value = root.dataset.min;
  input.defaultValue = root.dataset.min;

  minus.type = 'button';
  minus.className =
    'w-10 aspect-square text-primary-950 border-shark-50 border-1 border-r-0 bg-primary-500 hover:bg-primary-500/70 rounded-tl-[50%] rounded-bl-[50%]';
  minus.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 ml-auto mr-1.5">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />
  </svg>
  `;
  attachNumberInputEvent(minus, () => {
    input.value--;
    if (input.value < input.min) {
      input.value = input.min;
    }
  });

  plus.type = 'button';
  plus.className =
    'w-10 aspect-square text-primary-950 border-shark-50 border-1 border-l-0 bg-primary-500 hover:bg-primary-500/70 rounded-tr-[50%] rounded-br-[50%]';
  plus.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" class="size-6 ml-1.5 mr-auto">
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
  `;
  attachNumberInputEvent(plus, () => {
    input.value++;
  });

  fragment.appendChild(minus);
  fragment.appendChild(input);
  fragment.appendChild(plus);

  return fragment;
}

function attachNumberInputEvent(button, callback) {
  button.addEventListener('click', () => {
    callback();
  });
}

export default { render };
