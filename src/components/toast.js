import '../styles/toast.css';

let toastNode = null;
let toastMessageNode = null;
let toastDetailNode = null;
let toastTimer = null;

function buildDefaultToast() {
  toastNode = document.createElement('div');
  toastNode.id = 'toast';
  toastNode.className =
    'absolute top-4/5 left-1/2 -translate-y-full -translate-x-1/2 rounded-2xl p-4 border-1 border-negative-600 bg-negative-300 text-shark-700 shadow-md';
  toastNode.appendChild(buildMessage());
  toastNode.appendChild(buildDetail());
  return toastNode;
}

function buildMessage() {
  const messageNode = document.createElement('p');
  messageNode.id = 'toastMessage';
  messageNode.className = 'font-semibold';
  return messageNode;
}

function buildDetail() {
  const detailNode = document.createElement('p');
  detailNode.id = 'toastDetail';
  detailNode.className = 'text-sm';
  return detailNode;
}

function attachTransitionEndEvent() {
  toastNode.addEventListener('transitionend', (e) => {
    if (
      !toastNode.classList.contains('closeToast') ||
      !toastNode.matches(':popover-open') ||
      e.propertyName !== 'opacity'
    ) {
      return;
    }
    toastNode.classList.remove('closeToast');
    toastNode.hidePopover();
  });
}

function show(message, details = '', duration = 2) {
  clearTimeout(toastTimer);
  if (!toastNode) {
    toastNode = document.getElementById('toast') || buildDefaultToast();
    toastNode.popover = 'manual';
    attachTransitionEndEvent();
    if (!toastNode.isConnected) {
      document.body.appendChild(toastNode);
    }
  }

  toastMessageNode = document.querySelector('#toastMessage');
  if (toastMessageNode === null) {
    toastMessageNode = buildMessage();
    toastNode.appendChild(toastMessageNode);
  }

  toastDetailNode = document.querySelector('#toastDetail');
  if (toastDetailNode === null && details) {
    toastDetailNode = buildDetail();
    toastNode.appendChild(toastDetailNode);
  }

  toastMessageNode.textContent = message;
  if (toastDetailNode) {
    if (details) {
      toastDetailNode.textContent = details;
      toastDetailNode.hidden = false;
    } else {
      toastDetailNode.textContent = '';
      toastDetailNode.hidden = true;
    }
  }

  toastNode.showPopover();
  toastNode.classList.remove('closeToast');

  toastTimer = setTimeout(() => {
    toastNode.classList.add('closeToast');
  }, duration * 1000);
}

export default { show };
