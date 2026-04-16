export function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

export function formatPrice(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return '';
  }
  return parsed.toLocaleString();
}

export function getTodayString() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export function normalizeAddressValue(value) {
  return `${value ?? ''}`.trim().replace(/\s+/g, ' ');
}

export function combineAddress(region, detailAddress) {
  const normalizedRegion = normalizeAddressValue(region);
  const normalizedDetail = normalizeAddressValue(detailAddress);
  if (!normalizedRegion) {
    return normalizedDetail;
  }
  if (!normalizedDetail) {
    return normalizedRegion;
  }
  if (normalizedDetail.startsWith(normalizedRegion)) {
    return normalizedDetail;
  }
  return `${normalizedRegion} ${normalizedDetail}`;
}

export function splitAddressParts(region, fullAddress) {
  const normalizedRegion = normalizeAddressValue(region);
  const normalizedAddress = normalizeAddressValue(fullAddress);

  if (!normalizedRegion) {
    return {
      region: '',
      detailAddress: normalizedAddress,
    };
  }

  if (normalizedAddress.startsWith(normalizedRegion)) {
    return {
      region: normalizedRegion,
      detailAddress: normalizedAddress.slice(normalizedRegion.length).trim(),
    };
  }

  return {
    region: normalizedRegion,
    detailAddress: normalizedAddress,
  };
}

export function getNumberStep(input) {
  const rawStep = Number.parseFloat(input.step);
  if (!Number.isFinite(rawStep) || rawStep <= 0) {
    return 1;
  }
  return rawStep;
}

export function clampNumberByInput(input, value) {
  let nextValue = value;

  const minValue = Number.parseFloat(input.min);
  const fallbackMin =
    input.id === 'maxGuestInput' || input.id === 'minNightsInput' ? 1 : null;
  if (Number.isFinite(minValue)) {
    nextValue = Math.max(nextValue, minValue);
  } else if (fallbackMin !== null) {
    nextValue = Math.max(nextValue, fallbackMin);
  }

  const maxValue = Number.parseFloat(input.max);
  if (Number.isFinite(maxValue)) {
    nextValue = Math.min(nextValue, maxValue);
  }

  return nextValue;
}

export function parsePositiveInteger(value) {
  const normalized = `${value ?? ''}`.trim();
  if (!/^\d+$/.test(normalized)) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null;
  }

  return parsed;
}
