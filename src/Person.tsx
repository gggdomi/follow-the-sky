import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { makeAutoObservable } from 'mobx'
import type { St, TwtDataRow } from './St'
import { Store } from './Store'

export class Person {
   constructor(private st: St, private row: TwtDataRow) {
      makeAutoObservable(this)
   }

   get bskyHandle() {
      // 🔶 TODO: extract from bio
      return `${this.row.username}.bsky.social`
   }

   _profile?: MaybeProfile
   get bskyProfile(): MaybeProfile {
      if (this._profile != null) return this._profile

      this._profile = Store.get(`profile-${this.bskyHandle}`) as MaybeProfile
      if (this._profile != null) return this._profile

      if (!this.st.loggedIn) return 'NOT_LOGGED_IN'

      this._profile = 'LOADING'
      void this.fetchProfile()

      return this._profile
   }

   async fetchProfile(): Promise<void> {
      if (!this.st.loggedIn) return
      if (this.st.agent == null) return

      if (this._profile && this._profile !== 'LOADING') return

      this._profile = 'LOADING'
      try {
         const res = await this.st.agent.getProfile({ actor: this.bskyHandle })
         this._profile = res.data
      } catch (e: any) {
         this._profile = 'NOT_FOUND'
      }

      Store.set(`profile-${this.bskyHandle}`, bang(this._profile))
   }

   get loading() {
      return this.bskyProfile === 'LOADING'
   }

   get bskyPfp() {
      if (!hasProfile(this.bskyProfile)) return
      return this.bskyProfile.avatar
   }

   get bskyBio() {
      if (!hasProfile(this.bskyProfile)) return
      return this.bskyProfile.description
   }

   get bskyDisplayName() {
      if (!hasProfile(this.bskyProfile)) return
      return this.bskyProfile.displayName ?? this.bskyProfile.handle
   }

   get orderBit() {
      if (this.bskyProfile === 'LOADING') return 'b'
      if (this.bskyProfile === 'NOT_LOGGED_IN') return 'c'
      if (this.bskyProfile === 'NOT_FOUND') return 'd'
      return 'a'
   }

   get order() {
      return this.orderBit + this.bskyHandle
   }

   /// TWITTER
   get twitterId() { return this.row.id } // prettier-ignore
   get twitterPfp() { return this.row.profile_image_url } // prettier-ignore
   get twitterHandle() { return this.row.username } // prettier-ignore
   get twitterBio() { return this.row.description } // prettier-ignore
}

type MaybeProfile = 'NOT_FOUND' | 'LOADING' | 'NOT_LOGGED_IN' | ProfileViewDetailed

export const bang = <T extends any>(val?: T | null | undefined): T => {
   if (val == null) throw new Error('value should not be null')
   return val
}

export function hasProfile(profile: MaybeProfile): profile is ProfileViewDetailed {
   return profile !== 'NOT_FOUND' && profile !== 'LOADING' && profile !== 'NOT_LOGGED_IN'
}
