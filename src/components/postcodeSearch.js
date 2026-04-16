const KAKAO_POSTCODE_SCRIPT_URL =
  'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

let postcodeScriptPromise = null;

function normalizeAddressValue(value) {
  return `${value ?? ''}`.trim().replace(/\s+/g, ' ');
}

function buildRegionFromPostcodeData(data) {
  const sido = normalizeAddressValue(data?.sido);
  const sigungu = normalizeAddressValue(data?.sigungu);
  return [sido, sigungu].filter(Boolean).join(' ').trim();
}

function splitRegionAndDetailAddress(data, selectedAddress) {
  const normalizedAddress = normalizeAddressValue(selectedAddress);
  const region = buildRegionFromPostcodeData(data);

  if (!normalizedAddress) {
    return {
      region,
      detailAddress: '',
    };
  }

  if (!region) {
    return {
      region: '',
      detailAddress: normalizedAddress,
    };
  }

  if (normalizedAddress.startsWith(region)) {
    return {
      region,
      detailAddress: normalizedAddress.slice(region.length).trim(),
    };
  }

  return {
    region,
    detailAddress: normalizedAddress,
  };
}

function ensurePostcodeScriptLoaded() {
  if (window.kakao?.Postcode || window.daum?.Postcode) {
    return Promise.resolve();
  }

  if (postcodeScriptPromise) {
    return postcodeScriptPromise;
  }

  postcodeScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-kakao-postcode]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('kakao postcode load failed')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_POSTCODE_SCRIPT_URL;
    script.async = true;
    script.dataset.kakaoPostcode = 'true';
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener(
      'error',
      () => reject(new Error('kakao postcode load failed')),
      { once: true },
    );
    document.head.appendChild(script);
  });

  return postcodeScriptPromise;
}

function getPostcodeConstructor() {
  return window.kakao?.Postcode ?? window.daum?.Postcode ?? null;
}

export function makeRegionInputSearchable(
  regionInput,
  placeholder = '주소 검색을 위해 클릭하세요',
) {
  if (!(regionInput instanceof HTMLInputElement)) {
    return;
  }

  regionInput.readOnly = true;
  regionInput.placeholder = placeholder;
  regionInput.classList.add('cursor-pointer');
}

export async function openPostcodePopup(regionInput, detailInput = null) {
  if (!(regionInput instanceof HTMLInputElement)) {
    throw new Error('invalid region input');
  }

  await ensurePostcodeScriptLoaded();

  const Postcode = getPostcodeConstructor();
  if (!Postcode) {
    throw new Error('kakao postcode unavailable');
  }

  new Postcode({
    oncomplete(data) {
      const selectedAddress =
        data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
      const { region, detailAddress } = splitRegionAndDetailAddress(
        data,
        selectedAddress,
      );
      regionInput.value = region;
      if (detailInput instanceof HTMLInputElement) {
        detailInput.value = detailAddress;
        detailInput.focus();
      }
    },
  }).open();
}
