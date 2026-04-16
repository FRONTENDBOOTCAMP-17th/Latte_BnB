import hero0 from '../assets/hero0.jpg';
import hero1 from '../assets/hero1.jpg';
import hero2 from '../assets/hero2.jpg';
import hero3 from '../assets/hero3.jpg';
import hero4 from '../assets/hero4.jpg';
import hero5 from '../assets/hero5.jpg';

const images = [hero0, hero1, hero2, hero3, hero4, hero5];

let page = 0;
let timer = null;
let slider = null;

function showSlide(index) {
  const slides = slider.querySelectorAll('.slide');

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.opacity = '0';
  }

  slides[index].style.opacity = '1';
}

function nextSlide() {
  page++;

  if (page >= images.length) {
    page = 0;
  }

  showSlide(page);
}

function prevSlide() {
  page--;

  if (page < 0) {
    page = images.length - 1;
  }

  showSlide(page);
}

function buildSlider() {
  slider = document.createElement('section');

  slider.className =
    'relative w-full h-[40vh] lg:h-[70vh] min-h-60 lg:min-h-80 max-h-[700px] overflow-hidden';

  let slidesHTML = '';

  for (let i = 0; i < images.length; i++) {
    slidesHTML += `
      <div class="slide absolute inset-0 transition-opacity duration-500"
        style="opacity: ${i === 0 ? '1' : '0'}">
        <img src="${images[i]}" class="w-full h-full object-cover" />
      </div>
    `;
  }

  slider.innerHTML = `
    <div class="relative w-full h-full">
      ${slidesHTML}
    </div>

    <div class="absolute inset-0 bg-black/30"></div>

    <h1 class="absolute bottom-[20%] left-[clamp(1.25rem,4vw,5rem)] text-white text-[clamp(1.25rem,4vw,2.25rem)] font-bold drop-shadow-lg">
      lattebnb에서 <br />특별한 추억을 남길 수 있는 공간을 찾아보세요.
    </h1>

    <button id="prevBtn"
      class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white text-xl">
      ‹
    </button>

    <button id="nextBtn"
      class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/30 hover:bg-white/50 text-white text-xl">
      ›
    </button>
  `;

  const prevBtn = slider.querySelector('#prevBtn');
  const nextBtn = slider.querySelector('#nextBtn');

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetTimer();
  });

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetTimer();
  });

  startTimer();

  return slider;
}

function startTimer() {
  timer = setInterval(() => {
    nextSlide();
  }, 3000);
}

function resetTimer() {
  clearInterval(timer);
  startTimer();
}

export default { buildSlider };
