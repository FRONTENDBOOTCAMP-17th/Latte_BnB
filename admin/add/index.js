import '../../src/style.css';
import numberInput from '../../src/components/numberInput';

document.addEventListener('DOMContentLoaded', () => {
  numberInput.render();
  document.querySelectorAll('input[type=date]').forEach((el) => {
    el.setAttribute('min', new Date().toISOString().split('T')[0]);
  });
});
