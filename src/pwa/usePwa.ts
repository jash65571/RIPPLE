import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';
import { PRODUCT } from '../config/product';

const OFFLINE_NOTICE_KEY = `${PRODUCT.productId}.offline-notice-dismissed`;

export interface PwaState {
  readonly offlineReady: boolean;
  readonly updateReady: boolean;
  readonly update: () => Promise<void>;
  readonly dismissOffline: () => void;
}

export const usePwa = (): PwaState => {
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);
  const [updateServiceWorker, setUpdateServiceWorker] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onOfflineReady: () => setOfflineReady(sessionStorage.getItem(OFFLINE_NOTICE_KEY) !== '1'),
      onNeedRefresh: () => setUpdateReady(true),
      onRegisterError: () => setOfflineReady(false),
    });
    setUpdateServiceWorker(() => update);
  }, []);

  return {
    offlineReady,
    updateReady,
    update: async () => {
      if (updateServiceWorker !== null) await updateServiceWorker(true);
    },
    dismissOffline: () => { sessionStorage.setItem(OFFLINE_NOTICE_KEY, '1'); setOfflineReady(false); },
  };
};
