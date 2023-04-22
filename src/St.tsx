import { BskyAgent } from '@atproto/api'
import { makeAutoObservable, runInAction } from 'mobx'
import { Notification } from 'rsuite'
import Papa from 'papaparse'
import { Person } from './Person'
import { Store } from './Store'

export class St {
   constructor() {
      makeAutoObservable(this)
      this.loadCredentials()
      if (this.wasLoggedIn) void this.login()
      this.loadCsv()
   }

   identifier: string = ''
   service: string = 'https://bsky.social'
   agent?: BskyAgent

   /** LOGIN */
   password: string = ''
   loggedIn: boolean = false
   wasLoggedIn: boolean = Boolean(Store.get('loggedIn'))
   loginError?: string
   async login(toaster?: any) {
      this.agent = new BskyAgent({ service: this.service })
      try {
         const identifier = this.identifier // 🔶 remove trailing @
         await this.agent.login({ identifier, password: this.password })

         this.loggedIn = true
         this.loginError = undefined
         if (this.rememberCredentials) this.saveCredentialsLocally()
         Store.set('loggedIn', true)
      } catch (e: any) {
         this.loginError = e.message
         this.logout()
         toaster.push(
            <Notification type='error' header='error' closable>
               {this.loginError}
            </Notification>,
            { placement: 'bottomCenter' },
         )
      }
   }

   logout() {
      this.loggedIn = false
      this.agent = undefined
      Store.remove('loggedIn')
      this.clearCache()
   }

   get canLogin() {
      return Boolean(this.identifier && this.password && this.service)
   }

   rememberCredentials: boolean = true
   credentialsSaved: boolean = false
   saveCredentialsLocally() {
      Store.set('identifier', this.identifier)
      Store.set('password', this.password)
      Store.set('service', this.service)
      this.credentialsSaved = true
   }

   loadCredentials() {
      this.identifier = Store.get('identifier') || ''
      this.password = Store.get('password') || ''
      const storedService = Store.get('service')
      this.service = storedService || this.service
      this.wasLoggedIn = Store.get('loggedIn') != null
      this.credentialsSaved = Boolean(this.password || this.identifier || storedService)
   }

   clearCache() {
      sessionStorage.clear()
      this.credentialsSaved = false
   }

   /** UPLOAD */
   uploadError?: string
   uploadSaved: boolean = false
   csvContent?: string
   onDrop = (e: React.DragEvent<HTMLElement>) => {
      // this.uploadState = 'file dropped'
      // this.uploadPending = true
      e.preventDefault()
      const file = e.dataTransfer.files[0]!
      const encoding = 'UTF-8'
      const reader = new FileReader()
      reader.onload = (e: ProgressEvent<FileReader>) => {
         try {
            runInAction(() => {
               const csvContent: string | ArrayBuffer | null | undefined = e.target?.result
               if (typeof csvContent !== 'string') throw new Error('invalid file parse result')
               this.csvContent = csvContent
               Store.set('csvContent', csvContent)
               this.uploadSaved = true
               this.uploadError = undefined
            })
         } catch (e: any) {
            this.uploadError = e.message
         }
         this.parseCsv()
      }
      reader.readAsText(file, encoding)
   }

   loadCsv() {
      const csvContent = Store.get('csvContent')
      if (csvContent) {
         this.csvContent = csvContent
         this.uploadSaved = true
         this.parseCsv()
      }
   }

   parseError?: string
   parsed: boolean = false
   parsedData?: TwtDataRow[]
   parseCsv() {
      if (!this.csvContent) {
         this.parseError = 'no csv content'
         return
      }

      try {
         const res = Papa.parse<TwtDataRow>(this.csvContent.trim(), { header: true, delimiter: ',' })
         const importantErrors = res.errors.filter((e) => e.code !== 'TooFewFields') // csv from twtdata doesn't completely fill the rows if no pinned tweet 🤷🏻‍♂️
         if (importantErrors.length > 0) {
            this.parseError = `${importantErrors.length} errors in csv, see console`
            console.log('❌ errors during parsing:', importantErrors)
         } else this.parseError = undefined
         this.parsed = true
         this.parsedData = res.data
      } catch (e: any) {
         this.parseError = e.message
         this.parsed = false
         this.parsedData = []
      }
   }

   get rowsCount() {
      return this.parsedData?.length || 0
   }

   clearUpload() {
      Store.remove('csvContent')
      this.csvContent = undefined
      this.uploadSaved = false
      this.parseError = undefined
      this.parsed = false
      this.parsedData = undefined
   }

   /** FOLLOW */
   get persons() {
      const unsorted = this.parsedData?.map((d) => new Person(this, d)) || []
      return unsorted.slice().sort((a, b) => a.order.localeCompare(b.order))
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
