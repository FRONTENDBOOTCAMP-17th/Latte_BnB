export function passwordToggle(toggleBtnId, inputPassword) {
  const toggleBtn = document.getElementById(toggleBtnId);
  if (!toggleBtn || !inputPassword) return;

  const iconEye = toggleBtn.querySelector('.iconEye');
  const iconEyeSlash = toggleBtn.querySelector('.iconEyeSlash');

  toggleBtn.addEventListener('click', () => {
    const isPassword = inputPassword.type === 'password';
    inputPassword.type = isPassword ? 'text' : 'password';

    iconEye.classList.toggle('hidden');
    iconEyeSlash.classList.toggle('hidden');
  });
}
