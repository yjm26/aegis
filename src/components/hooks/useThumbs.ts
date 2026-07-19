import { useRef, useState, useCallback } from 'react';
import type { FileMetadata } from '../../scripts/types';
import { openThumb } from '../../scripts/vault';
import { fileToShareItemAsync } from '../../scripts/share';
import { isImageMime } from '../../scripts/preview';

export function useThumbs(wallet: { address: string; publicKey: string } | null) {
  const thumbs = useRef(new Map<string, string>());
  const [, setThumbTick] = useState(0);

  const loadThumb = useCallback(async (file: FileMetadata) => {
    if (!wallet || thumbs.current.has(file.id)) return;

    if (file.thumbDataUrl) {
      try {
        const url = await openThumb(file.thumbDataUrl, wallet);
        if (url) {
          thumbs.current.set(file.id, url);
          setThumbTick((x) => x + 1);
          return;
        }
      } catch {}
    }

    if (!isImageMime(file.mimeType, file.originalName)) return;

    try {
      const item = await fileToShareItemAsync(file, wallet);
      if (item?.dataUrl) {
        thumbs.current.set(file.id, item.dataUrl);
        setThumbTick((x) => x + 1);
      }
    } catch {}
  }, [wallet]);

  return { thumbs, loadThumb, setThumbTick };
}
