export class Store {
   static get(key: StorageKeys) {
      const val = localStorage.getItem(`${prefix}${key}`)
      if (val == null) return null
      return JSON.parse(val)
   }

   static set(key: StorageKeys, value: string) {
      localStorage.setItem(`${prefix}${key}`, JSON.stringify(value))
   }

   static remove(key: StorageKeys) {
      localStorage.removeItem(`${prefix}${key}`)
   }

   static clear() {
      localStorage.clear()
   }
}

export type StorageKeys = 'loggedIn' | 'identifier' | 'password' | 'service' | 'csvContent'
const prefix = 'itfb-'
