import { BskyAgent } from '@atproto/api'
import { makeAutoObservable, runInAction } from 'mobx'
import Papa from 'papaparse'
import { Person } from './Person'
import { Store } from './Store'

export class St {
   constructor() {
      makeAutoObservable(this)
      void this.tryToHydrate()
   }

   hydrated: boolean = false
   async tryToHydrate() {
      if (Store.get('loggedIn') !== true) {
         Store.clear()
         this.hydrated = true
         return
      }

      this.identifier = Store.get('identifier') || ''
      this.password = Store.get('password') || ''
      this.service = Store.get('service') || this.service

      await this.login()

      const csvContent = Store.get('csvContent')
      this.loadCsv(csvContent)
      runInAction(() => (this.hydrated = true))
   }

   identifier: string = ''
   service: string = 'https://bsky.social'

   /** LOGIN */
   password: string = ''
   rememberCredentials: boolean = true
   loginError?: string
   async login(): Promise<string | undefined> {
      this._api = new BskyAgent({ service: this.service })
      try {
         const identifier = this.identifier // 🔶 remove trailing @
         await this._api.login({ identifier, password: this.password })
         runInAction(() => (this.loginError = undefined))
         if (this.rememberCredentials) this.saveCredentialsLocally()
      } catch (e: any) {
         this.loginError = e.message
         this.logout()
         return this.loginError
      }
   }

   _api?: BskyAgent
   get api() {
      if (this._api == null) throw new Error("can't access api when not logged in")
      return this._api
   }

   get canLogin() { return Boolean(this.identifier && this.password && this.service) } // prettier-ignore
   get loggedIn() { return this._api != null } // prettier-ignore

   logout() {
      this._api = undefined
      Store.clear()
   }

   saveCredentialsLocally() {
      Store.set('identifier', this.identifier)
      Store.set('password', this.password)
      Store.set('service', this.service)
      Store.set('loggedIn', true)
   }

   /** UPLOAD */
   uploadError?: string
   _persons: Person[] = []
   onDrop = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]!
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
         const csvContent: string | ArrayBuffer | null | undefined = e.target?.result
         if (typeof csvContent !== 'string') throw new Error('invalid file parse result')
         this.loadCsv(csvContent)
      }
      reader.readAsText(file, 'UTF-8')
   }

   loadCsv = (csvContent: string | null) => {
      this.uploadError = undefined
      if (!csvContent?.trim()) return
      try {
         const res = Papa.parse<TwtDataRow>(csvContent.trim(), { header: true, delimiter: ',' })

         // csv from twtdata doesn't completely fill the rows if no pinned tweet 🤷🏻‍♂️
         const importantErrors = res.errors.filter((e) => e.code !== 'TooFewFields')
         if (importantErrors.length > 0) {
            console.log('❌ errors during parsing:', importantErrors)
            this.uploadError = `${importantErrors.length} errors in csv, see console`
         }

         this._persons = res.data.map((d) => new Person(this, d))
         Store.set('csvContent', csvContent)
      } catch (e: any) {
         this.uploadError = e.message
      }
   }

   clearUpload() {
      Store.remove('csvContent')
      this._persons = []
   }

   get csvReady() { return this.rowsCount > 0 } // prettier-ignore
   get rowsCount() { return this._persons.length || 0 } // prettier-ignore

   /** FOLLOW */
   get persons() {
      return this._persons.slice().sort((a, b) => a.order.localeCompare(b.order))
   }
}

export type TwtDataRow = {
   id: string
   name: string
   username: string
   location: string
   url: string
   profile_image_url: string
   description: string
   verified: string
   verified_type: string
   followers_count: string
   following_count: string
   tweet_count: string
}
