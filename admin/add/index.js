import '../../src/style.css';
import numberInput from '../../src/components/numberInput';

let uploadThumbnailBtn = null;
let deleteThumbnailBtn = null;
let thumbnailInput = null;
let thumbnailPreview = null;
let preview = null;

function handleThumbnail(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove('hidden');
      deleteThumbnailBtn.classList.remove('hidden');
      uploadThumbnailBtn.className = 'adminThumbnailModify';
    };
    reader.readAsDataURL(thumbnailInput.files[0]);
  } else {
    preview.src = '';
    preview.classList.add('hidden');
    deleteThumbnailBtn.classList.add('hidden');
    uploadThumbnailBtn.className = 'adminThumbnailUpload';
  }
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

  uploadThumbnailBtn.addEventListener('click', () => {
    thumbnailInput.click();
  });

  deleteThumbnailBtn.addEventListener('click', () => {
    thumbnailInput.value = '';
    thumbnailInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  thumbnailInput.addEventListener('change', (e) => {
    handleThumbnail(e);
  });
});
