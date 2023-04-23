import { AtpSessionData, BskyAgent } from '@atproto/api'
import { makeAutoObservable, runInAction } from 'mobx'
import Papa from 'papaparse'
import { Person, TwtDataRow } from './Person'
import { Store } from './Store'
import { Notification } from 'rsuite'

export class St {
   constructor() {
      makeAutoObservable(this)
      void this.tryToHydrate()
   }

   hydrated: boolean = false
   async tryToHydrate() {
      if (Store.get('session') == null) {
         Store.clear()
         runInAction(() => (this.hydrated = true))
         return
      }

      await this.login()

      const csvContent = Store.get('csvContent')
      this.loadCsv(csvContent)
      runInAction(() => (this.hydrated = true))
   }

   /** LOGIN */
   identifier: string = ''
   password: string = ''
   service: string = 'https://bsky.social'
   loginError?: string
   async login(toaster?: any) {
      const api = new BskyAgent({
         service: this.service,
         persistSession: (evt, session) => {
            if (session != null) Store.set('session', session)
         },
      })

      const session: AtpSessionData | null = Store.get('session')
      try {
         if (session) await api.resumeSession(session)
         else await api.login({ identifier: this.identifier.replace(/^@/, ''), password: this.password })
         runInAction(() => (this.loginError = undefined))
      } catch (e: any) {
         console.log('❌ login/session resume failed:', e.message)
         runInAction(() => (this.loginError = e.message))
         this.logout()
         void toaster?.push(<Notification type='error' header='error' closable children={e.message} />, { placement: 'bottomCenter', }) // prettier-ignore
      }
      this._api = api
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
   private _persons?: Person[]
   onDrop = (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]!
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
         const csvContent: string | ArrayBuffer | null | undefined = e.target?.result
         if (typeof csvContent !== 'string') {
            this.uploadError = '❌ cannot read file properly'
            return
         }
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

         this._persons = res.data //
            .filter((d) => typeof d.username === 'string' && d.username.trim()) // 🔶 this is the only required field, exclude invalid rows to prevent crash downstream
            .map((d) => new Person(this, d))
         const invalidRows = res.data.length - this._persons.length
         if (invalidRows > 0) this.uploadError = `${invalidRows} invalid rows (ie. no twitter username found)`
         Store.set('csvContent', csvContent)
         this._persons.map((p) => p.profile) // 🔶 triggers data loading
      } catch (e: any) {
         this.uploadError = e.message
         this._persons = undefined
         Store.remove('csvContent')
      }
   }

   clearUpload() {
      Store.remove('csvContent')
      this._persons = undefined
      this.uploadError = undefined
   }

   get csvReady()     { return this._persons != null } // prettier-ignore
   get persons()      { return this._persons?.slice().sort((a, b) => a.twitterHandle.localeCompare(b.twitterHandle)) ?? [] } // prettier-ignore
   get loading()      { return this.persons.filter((p) => p.loading) } // prettier-ignore
   get found()        { return this.persons.filter((p) => p.ready && p.initiallyFollowed === false) } // prettier-ignore
   get followed()     { return this.persons.filter((p) => p.ready && p.initiallyFollowed) } // prettier-ignore
   get notFound()     { return this.persons.filter((p) => p.notFound === true) } // prettier-ignore
}
