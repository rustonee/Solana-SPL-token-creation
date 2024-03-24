const LocalStorage = {
  set(key: string, value: string | boolean | number | undefined | null) {
    if (value === undefined) return;
    const stringify = JSON.stringify(value);
    localStorage.setItem(key, stringify);
  },
  get(key: string, defaultValue: boolean | string | undefined) {
    const stringify =
      typeof window !== 'undefined' ? localStorage.getItem(key) : '';
    if (stringify === null || stringify === '') return defaultValue;
    return JSON.parse(stringify);
  },
  clear() {
    localStorage.clear();
  },
  remove(key: string) {
    localStorage.removeItem(key);
  },
};

export const ACCESS_TOKEN = 'access-token';
export const USER_ID = 'copytrader-user-id';

export default LocalStorage;
