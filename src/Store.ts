export class Store {
   static get(key: StorageKeys) {
      const val = localStorage.getItem(`${prefix}${key}`)
      if (val == null) return null
      return JSON.parse(val)
   }

   static set(key: StorageKeys, value: string | boolean | number | object) {
      localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
   }

   static remove(key: StorageKeys) {
      localStorage.removeItem(`${prefix}${key}`)
   }

   static clear() {
      localStorage.clear()
   }
}

export type StorageKeys = 'session' | 'csvContent' | `profile-${string}`
const prefix = 'itfb-'
