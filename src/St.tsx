import { AtpSessionData, BskyAgent } from '@atproto/api'
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
      if (Store.get('session') == null) {
         Store.clear()
         this.hydrated = true
         return
      }

      await this.login()

      const csvContent = Store.get('csvContent')
      this.loadCsv(csvContent)
      runInAction(() => (this.hydrated = true))
   }

   identifier: string = ''
   service: string = 'https://bsky.social'

   /** LOGIN */
   password: string = ''
   loginError?: string
   async login(): Promise<string | undefined> {
      this._api = new BskyAgent({
         service: this.service,
         persistSession: (evt, session) => {
            if (session != null) Store.set('session', session)
         },
      })

      const session: AtpSessionData | null = Store.get('session')
      try {
         if (session != null) {
            await this._api.resumeSession(session)
         } else {
            const identifier = this.identifier.replace(/^@/, '')
            await this._api.login({ identifier, password: this.password })
            runInAction(() => (this.loginError = undefined))
         }
      } catch (e: any) {
         console.log('❌ login/session resume failed:', e.message)
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
      this.clearUpload()
      Store.clear()
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

   loadCsv(csvContent: string | null) {
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

         this._persons = res.data
            .filter((d) => typeof d.id === 'string' && typeof d.username && 'string')
            .map((d) => new Person(this, d))
         Store.set('csvContent', csvContent)
      } catch (e: any) {
         this.uploadError = e.message
      }

      this._persons.map((p) => p.profile) // 🔶 triggers data loading
   }

   clearUpload() {
      Store.remove('csvContent')
      this._persons = []
   }

   get csvReady() { return this.rowsCount > 0 } // prettier-ignore
   get rowsCount() { return this._persons.length || 0 } // prettier-ignore

   /** FOLLOW */
   get persons() {
      console.log('🟢')
      return this._persons.slice().sort((a, b) => a.twitterHandle.localeCompare(b.twitterHandle))
   }

   get initialLoadingCount() {
      return this.persons.filter((p) => p.loading && !p.ready && !p.failed).length
   }

   get found() {
      return this.persons.filter((p) => p.ready && p.initiallyFollowed === false)
   }
   get followed() {
      return this.persons.filter((p) => p.ready && p.initiallyFollowed)
   }
   get notFound() {
      return this.persons.filter((p) => p.failed === true)
   }
}

export type TwtDataRow = {
   id: string
   username: string
   name?: string
   location?: string
   url?: string
   profile_image_url?: string
   description?: string
   verified?: string
   verified_type?: string
   followers_count?: string
   following_count?: string
   tweet_count?: string
}
