import '../styles/toast.css';

let toastNode = null;
let toastMessageNode = null;
let toastDetailNode = null;
let toastTimer = null;

function buildDefaultToast() {
  toastNode = document.createElement('div');
  toastNode.id = 'toast';
  toastNode.className =
    'absolute top-4/5 left-1/2 -translate-y-full -translate-x-1/2 rounded-2xl p-4 border-1 shadow-md';
  toastNode.appendChild(buildMessageNode());
  toastNode.appendChild(buildDetailNode());
  return toastNode;
}

function buildMessageNode() {
  const messageNode = document.createElement('p');
  messageNode.id = 'toastMessage';
  messageNode.className = 'font-semibold';
  return messageNode;
}

function buildDetailNode() {
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

function show(duration) {
  toastNode.showPopover();
  toastNode.classList.remove('closeToast');

  toastTimer = setTimeout(() => {
    toastNode.classList.add('closeToast');
  }, duration * 1000);
}

function buildMessage(message, details = '') {
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
}

function message(message, details = '', duration = 2) {
  buildMessage(message, details);
  toastNode.classList.remove(
    'bg-negative-300',
    'border-negative-600',
    'text-negative-900',
    'bg-positive-100',
    'border-positive-600',
    'text-positive-900',
  );
  toastNode.classList.add(
    'bg-neutral-100',
    'border-neutral-600',
    'text-shark-700',
  );
  show(duration);
}

function success(message, details = '', duration = 2) {
  buildMessage(message, details);
  toastNode.classList.remove(
    'bg-negative-300',
    'border-negative-600',
    'text-negative-900',
    'bg-neutral-100',
    'border-neutral-600',
    'text-shark-700',
  );
  toastNode.classList.add(
    'bg-positive-100',
    'border-positive-600',
    'text-positive-900',
  );
  show(duration);
}

function warn(message, details = '', duration = 2) {
  buildMessage(message, details);
  toastNode.classList.remove(
    'bg-positive-100',
    'border-positive-600',
    'text-positive-900',
    'bg-neutral-100',
    'border-neutral-600',
    'text-shark-700',
  );
  toastNode.classList.add(
    'bg-negative-300',
    'border-negative-600',
    'text-negative-900',
  );
  show(duration);
}

export default { message, warn, success };
