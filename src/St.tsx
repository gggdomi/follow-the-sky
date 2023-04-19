import { BskyAgent } from '@atproto/api'
import { makeAutoObservable } from 'mobx'
import { Notification } from 'rsuite'

export class St {
   constructor() {
      makeAutoObservable(this)
      this.loadCredentials()
      if (this.wasLoggedIn) void this.login()
   }

   identifier: string = ''
   service: string = 'https://bsky.social'
   agent?: BskyAgent

   /** LOGIN */
   password: string = ''
   loggedIn: boolean = false
   wasLoggedIn: boolean = Boolean(sessionStorage.getItem(`${prefix}loggedIn`))
   loginError?: string
   async login(toaster?: any) {
      this.agent = new BskyAgent({ service: this.service })
      try {
         const identifier = this.identifier // 🔶 remove trailing @
         await this.agent.login({ identifier, password: this.password })

         this.loggedIn = true
         this.loginError = undefined
         if (this.rememberCredentials) this.saveCredentialsLocally()
         sessionStorage.setItem(`${prefix}loggedIn`, 'yes')
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
      sessionStorage.removeItem(`${prefix}loggedIn`)
      this.clearCache()
   }

   get canLogin() {
      return Boolean(this.identifier && this.password && this.service)
   }

   rememberCredentials: boolean = true
   credentialsSaved: boolean = false
   saveCredentialsLocally() {
      sessionStorage.setItem(`${prefix}identifier`, this.identifier)
      sessionStorage.setItem(`${prefix}password`, this.password)
      sessionStorage.setItem(`${prefix}service`, this.service)
      this.credentialsSaved = true
   }

   loadCredentials() {
      this.identifier = sessionStorage.getItem(`${prefix}identifier`) || ''
      this.password = sessionStorage.getItem(`${prefix}password`) || ''
      const storedService = sessionStorage.getItem(`${prefix}service`)
      this.service = storedService || this.service
      this.wasLoggedIn = sessionStorage.getItem(`${prefix}loggedIn`) != null
      this.credentialsSaved = Boolean(this.password || this.identifier || storedService)
   }

   clearCache() {
      sessionStorage.clear()
      this.credentialsSaved = false
   }
}

const prefix = 'itfb-'
