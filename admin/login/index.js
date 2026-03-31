import '../../src/style.css';

const adminLoginForm = document.getElementById('adminLoginForm');
const warnning = document.getElementById('warnning');
const blankInputMessage = document.querySelector('.blankInputMessage');
let popoverTimer = null;

warnning.addEventListener('transitionend', (e) => {
  if (
    !warnning.classList.contains('closePopover') ||
    !warnning.matches(':popover-open') ||
    e.propertyName !== 'opacity'
  ) {
    return;
  }
  warnning.classList.remove('closePopover');
  warnning.hidePopover();
});

adminLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let message = [];
  let showMessage = false;

  clearTimeout(popoverTimer);

  if (!e.target.adminId.value.trim()) {
    message.push('아이디');
    showMessage = true;
  }
  if (!e.target.adminPassword.value.trim()) {
    message.push('비밀번호');
    showMessage = true;
  }

  if (showMessage) {
    blankInputMessage.textContent = message.join(', ');
    warnning.showPopover();
    warnning.classList.remove('closePopover');

    popoverTimer = setTimeout(() => {
      warnning.classList.add('closePopover');
    }, 2000);
  }
});
