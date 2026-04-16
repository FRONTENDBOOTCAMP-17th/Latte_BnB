export async function handleAccommodationDelegatedClick(
  target,
  options = {},
  context,
) {
  const { element, getHTMLReference, getInputValue } = context;
  if (!(target instanceof Element) || !element) {
    return { handled: false };
  }

  const { onRegionInputClick = null } = options;
  if (typeof onRegionInputClick === 'function') {
    const regionInput = target.closest('#regionInput');
    if (regionInput instanceof HTMLInputElement) {
      await onRegionInputClick(regionInput);
      return { handled: true };
    }
  }

  const html = getHTMLReference();
  const clickActions = [
    {
      selector: '#thumbnailDeleteBtn',
      handler: () => {
        context.removeThumbnail();
      },
    },
    {
      selector: '#thumbnailInsertBtn',
      handler: () => {
        const thumbnailUrl = getInputValue(html.thumbnailURL).trim();
        if (!thumbnailUrl) {
          return;
        }
        context.setThumbnailFromUrl(thumbnailUrl);
      },
    },
    {
      selector: '.imageDeleteBtn',
      handler: (trigger) => {
        const imageId = trigger.closest('[data-id]')?.dataset.id;
        if (!imageId) {
          return;
        }
        context.removeImage(imageId);
      },
    },
    {
      selector: '#imageInsertBtn',
      handler: () => {
        const imageUrl = getInputValue(html.imageURL).trim();
        if (!imageUrl) {
          return;
        }
        context.addImageFromUrl(imageUrl);
      },
    },
    {
      selector: '#imageTitleApplyBtn',
      handler: () => {
        context.updateSelectedImageTitle(getInputValue(html.imageTitleInput));
      },
    },
    {
      selector: '#imageDescriptionApplyBtn',
      handler: () => {
        context.updateSelectedImageDescription(
          getInputValue(html.imageDescriptionInput),
        );
      },
    },
    {
      selector: '#titleApplyBtn',
      handler: () => {
        context.updateAccommodationTitle(getInputValue(html.titleInput));
      },
    },
    {
      selector: '#addressApplyBtn',
      handler: () => {
        context.updateAccommodationAddress(
          getInputValue(html.regionInput),
          getInputValue(html.detailAddressInput),
        );
      },
    },
    {
      selector: '#maxGuestApplyBtn',
      handler: () =>
        context.tryApplyPositiveIntegerField(
          html.maxGuestInput,
          context.updateAccommodationMaxGuest,
        ),
    },
    {
      selector: '#descriptionApplyBtn',
      handler: () => {
        context.updateAccommodationDescription(
          getInputValue(html.descriptionInput),
        );
      },
    },
    {
      selector: '#adultPriceApplyBtn',
      handler: () => {
        context.updateAccommodationPrice(
          'adultPrice',
          getInputValue(html.adultPriceInput),
        );
      },
    },
    {
      selector: '#childPriceApplyBtn',
      handler: () => {
        context.updateAccommodationPrice(
          'childPrice',
          getInputValue(html.childPriceInput),
        );
      },
    },
    {
      selector: '#serviceFeeApplyBtn',
      handler: () => {
        context.updateAccommodationPrice(
          'serviceFee',
          getInputValue(html.serviceFeeInput),
        );
      },
    },
    {
      selector: '#minNightsApplyBtn',
      handler: () =>
        context.tryApplyPositiveIntegerField(
          html.minNightsInput,
          context.updateAccommodationMinNights,
        ),
    },
    {
      selector: '#blockedDateAddBtn',
      handler: () =>
        context.addBlockedDate(
          getInputValue(html.startDateInput),
          getInputValue(html.endDateInput),
        ),
    },
    {
      selector: '.blockedDateDeleteBtn',
      handler: (trigger) => {
        const blockedDateId = trigger.dataset.id;
        if (!blockedDateId) {
          return;
        }
        context.removeBlockedDate(blockedDateId);
      },
    },
  ];

  for (const action of clickActions) {
    const trigger = target.closest(action.selector);
    if (!trigger) {
      continue;
    }
    const result = action.handler(trigger);
    return { handled: true, result };
  }

  return { handled: false };
}

export function handleAccommodationDelegatedChange(target, context) {
  const { element } = context;
  if (!(target instanceof Element) || !element) {
    return { handled: false };
  }

  const changeActions = [
    {
      selector: '#thumbnailFile',
      handler: (trigger) => {
        if (!(trigger instanceof HTMLInputElement)) {
          return;
        }
        const file = trigger.files?.[0];
        if (!file) {
          return;
        }
        context.setThumbnailFromFile(file);
      },
    },
    {
      selector: '#imageFile',
      handler: (trigger) => {
        if (!(trigger instanceof HTMLInputElement)) {
          return;
        }
        const files = Array.from(trigger.files ?? []);
        if (files.length === 0) {
          return;
        }
        context.addImagesFromFiles(files);
      },
    },
    {
      selector: 'input[name="image"]',
      handler: (trigger) => {
        if (!(trigger instanceof HTMLInputElement)) {
          return;
        }
        context.setSelectedImage(trigger.value);
      },
    },
  ];

  for (const action of changeActions) {
    const trigger = target.closest(action.selector);
    if (!trigger) {
      continue;
    }
    action.handler(trigger);
    return { handled: true };
  }

  return { handled: false };
}
