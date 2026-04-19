import '../../src/style.css';
import toast from '../../src/components/toast.js';
import accommodationForm from '../../src/components/accommodationForm.js';
import constants from '../../src/constants.js';
import {
  buildAccommodationSnapshot,
  buildUpdateAccommodationPayload,
  getAccommodationRequiredMessages,
  hasAccommodationChanged,
  initializeAccommodationEditorLayout,
  mountAccommodationEditor,
  resolveAccommodationMediaData,
  submitAccommodationRequest,
} from '../accommodationEditorPage.js';

const params = new URLSearchParams(location.search);
const accommodationId = Number.parseInt(params.get('id') ?? '', 10);
const content = document.getElementById('content');
const backHref = Number.isFinite(accommodationId)
  ? `/admin/accommodation/?id=${accommodationId}`
  : '/admin/';

initializeAccommodationEditorLayout({ backHref });

if (!Number.isFinite(accommodationId)) {
  location.replace('/admin/');
} else {
  loadAccommodationForEdit();
}

async function loadAccommodationForEdit() {
  try {
    const { success, message } = await accommodationForm.fetchAccommodation(
      String(accommodationId),
    );

    if (!success) {
      handleLoadFailure(message);
      return;
    }

    mountAccommodationEditor({
      content,
      formMode: constants.FORM_MODE.EDIT,
      submitButtonId: 'submitAccommodationEditBtn',
      submitButtonText: '수정하기',
      onSubmit: submitAccommodation,
    });
  } catch (error) {
    handleLoadFailure(error?.data?.message ?? error.message);
  }
}

function handleLoadFailure(message) {
  toast.warn('숙소 조회 실패', message, 4);
  setTimeout(() => {
    location.replace('/admin/');
  }, 1200);
}

async function submitAccommodation(button) {
  await submitAccommodationRequest(button, {
    missingData: {
      title: '수정 실패',
      message: '숙소 데이터를 불러오지 못했습니다.',
    },
    collectFormState() {
      const origin = accommodationForm.getOriginData();
      const modified = accommodationForm.getModifiedData();
      if (!origin || !modified) {
        return null;
      }

      return { origin, modified };
    },
    validate({ origin, modified }) {
      const requiredMessages = getAccommodationRequiredMessages(modified);
      if (requiredMessages.length > 0) {
        toast.warn(
          '필수 값 입력',
          `${requiredMessages.join(', ')} 필드는 필수로 입력해야 합니다.`,
          5,
        );
        return false;
      }

      if (hasAccommodationChanged(origin, modified)) {
        return true;
      }

      toast.message(
        '변경 사항 없음',
        '수정된 내용이 없어 업데이트 요청을 생략했습니다.',
        3,
      );
      return false;
    },
    async prepareRequest({ modified }) {
      const resolvedModified = await resolveAccommodationMediaData(modified);
      const snapshot = buildAccommodationSnapshot(resolvedModified);

      return {
        endpoint: `/admin/accommodations/${accommodationId}`,
        method: 'PATCH',
        requestData: buildUpdateAccommodationPayload(snapshot),
      };
    },
    successToastTitle: '숙소 수정 성공',
    errorToastTitle: '숙소 수정 실패',
    onSuccess() {
      location.replace(`/admin/accommodation/?id=${accommodationId}`);
    },
  });
}
