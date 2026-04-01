function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// 숙소 설명 모달
const modalDesc = document.getElementById('modal-desc');
document.getElementById('btn-desc-more').addEventListener('click', () => {
  openModal(modalDesc);
});
document.getElementById('btn-desc-back').addEventListener('click', () => {
  closeModal(modalDesc);
});

// 숙소 리뷰 모달
const modalReview = document.getElementById('modal-review');
document.getElementById('btn-review-more').addEventListener('click', () => {
  openModal(modalReview);
});
document.getElementById('btn-review-back').addEventListener('click', () => {
  closeModal(modalReview);
});

document.getElementById('btn-booking').addEventListener('click', () => {
  alert(
    '예약하기 화면으로 넘어갈 예정!!\n\n숙소 ID, 체크인/체크아웃 날짜, 게스트 수 데이터를 API에 전달 예정입니당 ~',
  );
});
