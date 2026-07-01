export function getVendorSession(): { booth: string; password: string } | null {
  if (typeof window === "undefined") return null;
  const booth = localStorage.getItem("flea_booth");
  const password = localStorage.getItem("flea_vendor_password");
  if (!booth || !password) return null;
  return { booth, password };
}

export function setVendorSession(booth: string, password: string) {
  localStorage.setItem("flea_role", "vendor");
  localStorage.setItem("flea_booth", booth);
  localStorage.setItem("flea_vendor_password", password);
}

export function getAdminSession(): { id: string; password: string } | null {
  if (typeof window === "undefined") return null;
  const id = localStorage.getItem("flea_admin_id");
  const password = localStorage.getItem("flea_admin_password");
  if (!id || !password) return null;
  return { id, password };
}

export function setAdminSession(id: string, password: string) {
  localStorage.setItem("flea_role", "admin");
  localStorage.setItem("flea_admin_id", id);
  localStorage.setItem("flea_admin_password", password);
}

export function clearSession() {
  localStorage.removeItem("flea_role");
  localStorage.removeItem("flea_booth");
  localStorage.removeItem("flea_vendor_password");
  localStorage.removeItem("flea_admin_id");
  localStorage.removeItem("flea_admin_password");
}

// crypto.randomUUID() はHTTPS(またはlocalhost)でしか使えないため、
// スマホをWi-Fi経由のhttp://で開いた場合に備えてフォールバックを用意する
export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("flea_device_id");
  if (!id) {
    id = generateId();
    localStorage.setItem("flea_device_id", id);
  }
  return id;
}
