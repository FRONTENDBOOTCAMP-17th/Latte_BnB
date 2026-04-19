import '../../src/style.css';
import toast from '../../src/components/toast.js';
import accommodationForm from '../../src/components/accommodationForm.js';
import constants from '../../src/constants.js';
import {
  buildAccommodationSnapshot,
  buildCreateAccommodationPayload,
  getAccommodationRequiredMessages,
  initializeAccommodationEditorLayout,
  mountAccommodationEditor,
  resolveAccommodationMediaData,
  submitAccommodationRequest,
} from '../accommodationEditorPage.js';

const content = document.getElementById('content');

initializeAccommodationEditorLayout();
mountAccommodationEditor({
  content,
  formMode: constants.FORM_MODE.ADD,
  submitButtonId: 'submitAccommodationBtn',
  submitButtonText: '등록하기',
  onSubmit: submitAccommodation,
});

async function submitAccommodation(button) {
  await submitAccommodationRequest(button, {
    missingData: {
      title: '등록 실패',
      message: '숙소 데이터를 불러오지 못했습니다.',
    },
    collectFormState() {
      const modified = accommodationForm.getModifiedData();
      if (!modified) {
        return null;
      }

      return { modified };
    },
    validate({ modified }) {
      const requiredMessages = getAccommodationRequiredMessages(modified);
      if (requiredMessages.length === 0) {
        return true;
      }

      toast.warn(
        '필수 값 입력',
        `${requiredMessages.join(', ')} 필드는 필수로 입력해야 합니다.`,
        5,
      );
      return false;
    },
    async prepareRequest({ modified }) {
      const resolvedModified = await resolveAccommodationMediaData(modified);
      const snapshot = buildAccommodationSnapshot(resolvedModified);

      return {
        endpoint: '/admin/accommodations',
        method: 'POST',
        requestData: buildCreateAccommodationPayload(snapshot),
      };
    },
    successToastTitle: '숙소 추가 성공',
    errorToastTitle: '숙소 등록 실패',
    onSuccess() {
      location.replace('/admin/');
    },
  });
}
