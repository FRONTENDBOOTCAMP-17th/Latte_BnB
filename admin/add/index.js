import '../../src/style.css';
import numberInput from '../../src/components/numberInput';
import toast from '../../src/components/toast.js';
import { PreviewImage } from '../../src/components/previewImage.js';

let uploadThumbnailBtn = null;
let deleteThumbnailBtn = null;
let thumbnailInput = null;
let thumbnailPreview = null;
let preview = null;
let uploadImagesBtn = null;
let imagesInput = null;
let imagesPreview = null;
let imageMap = new Map();
let thumbnailFile = null;
let modal = null;
let imageTitle = null;
let imageDescription = null;
let selectedImage = null;
let addForm = null;

function handleThumbnail(e) {
  if (e.target.files && e.target.files[0]) {
    preview.src = URL.createObjectURL(e.target.files[0]);
    preview.classList.remove('hidden');
    deleteThumbnailBtn.classList.remove('hidden');
    uploadThumbnailBtn.className = 'adminThumbnailModify';
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    deleteThumbnailBtn.classList.add('hidden');
    uploadThumbnailBtn.className = 'adminThumbnailUpload';
  }
}

function closeModal() {
  modal.classList.add('hidden');
  imageTitle.value = '';
  imageDescription.value = '';
}

document.addEventListener('DOMContentLoaded', () => {
  numberInput.render();
  document.querySelectorAll('input[type=date]').forEach((el) => {
    el.setAttribute('min', new Date().toISOString().split('T')[0]);
  });

  uploadThumbnailBtn = document.getElementById('uploadThumbnail');
  deleteThumbnailBtn = document.getElementById('deleteThumbnail');
  thumbnailInput = document.getElementById('thumbnail');
  thumbnailPreview = document.getElementById('thumbnailPreview');
  preview = document.getElementById('preview');
  uploadImagesBtn = document.getElementById('uploadImagesBtn');
  imagesInput = document.getElementById('images');
  imagesPreview = document.getElementById('imagesPreview');
  modal = document.getElementById('modal');
  imageTitle = document.getElementById('imageTitle');
  imageDescription = document.getElementById('imageDescription');
  selectedImage = document.getElementById('selectedImage');
  addForm = document.getElementById('addForm');

  uploadThumbnailBtn.addEventListener('click', () => {
    thumbnailInput.click();
  });

  deleteThumbnailBtn.addEventListener('click', () => {
    thumbnailInput.value = '';
    thumbnailFile = null;
    thumbnailInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  thumbnailInput.addEventListener('change', (e) => {
    handleThumbnail(e);
  });

  uploadImagesBtn.addEventListener('click', () => {
    imagesInput.click();
  });

  imagesInput.addEventListener('change', (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file) => {
        const previewImage = new PreviewImage(
          crypto.randomUUID(),
          URL.createObjectURL(file),
        );
        imageMap.set(previewImage.getId(), {
          file: file,
          object: previewImage,
        });
        imagesPreview.insertBefore(previewImage.getElement(), uploadImagesBtn);
      });
    }
  });

  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let showMessage = false;
    let message = [];

    if (addForm.title.value.length === 0) {
      showMessage = true;
      message.push('숙소 이름');
    }

    if (addForm.region.value.length === 0) {
      showMessage = true;
      message.push('지역');
    }

    if (addForm.maxGuest.value === 0) {
      showMessage = true;
      message.push('최대 수용 인원');
    }

    if (addForm.adultPrice.value.length === 0) {
      showMessage = true;
      message.push('성인 1박 요금');
    }

    if (addForm.childPrice.value.length === 0) {
      showMessage = true;
      message.push('어린이 1박 요금');
    }

    if (showMessage) {
      toast.warn(
        '필수 값 입력',
        `${message.join(', ')} 필드는 필수로 입력해야합니다.`,
        5,
      );
      return;
    }
  });

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('deleteImageBtn')) {
      const target = e.target.closest('div');
      imageMap.delete(target.dataset.id);
      target.remove();
    }

    if (e.target.hasAttribute('data-image')) {
      const target = e.target.closest('div');
      const previewImage = imageMap.get(target.dataset.id).object;
      selectedImage.src = previewImage.getSrc();
      selectedImage.dataset.id = target.dataset.id;
      imageTitle.value = previewImage.getTitle();
      imageDescription.value = previewImage.getDescription();
      modal.classList.remove('hidden');
    }

    if (e.target.id === 'apply') {
      const previewImage = imageMap.get(selectedImage.dataset.id).object;
      previewImage.setTitle(imageTitle.value);
      previewImage.setDescription(imageDescription.value);
      closeModal();
    }

    if (e.target.id === 'modal') {
      closeModal();
    }
  });
});
