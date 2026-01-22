// デバイスIDの生成・取得（ログイン不要な保存用）

const DEVICE_ID_KEY = 'chukosei_device_id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    // UUID v4を生成
    deviceId =
      'device_' +
      crypto
        .getRandomValues(new Uint8Array(16))
        .reduce((s, b) => s + b.toString(16).padStart(2, '0'), '');
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

export function clearDeviceId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(DEVICE_ID_KEY);
  }
}
