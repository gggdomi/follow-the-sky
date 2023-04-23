import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { makeAutoObservable, runInAction } from 'mobx'
import { St, TwtDataRow } from './St'
import { Store } from './Store'

const ACTIVATE_BUTTONS = false

const findHandle = (s: string | undefined) => {
   if (s == null) return
   const match = s.match(/@?(\S+(?:\.| dot )bsky(?:\.| dot )social)/)
   if (match == null) return
   return match[1].replaceAll(' dot ', '.')
}

export class Person {
   constructor(public st: St, private row: TwtDataRow) {
      makeAutoObservable(this)
   }

   get bskyHandle() {
      return findHandle(this.twitterDisplayName) ?? findHandle(this.twitterBio) ?? `${this.row.username}.bsky.social` // prettier-ignore
   }

   private _profile?: ProfileViewDetailed
   ready: boolean = false // ie. profile exists & is loaded
   loading: boolean = false
   reloading: boolean = false
   failed: boolean = false // ie. we tried to load the profile but it doesn't exist
   get profile(): ProfileViewDetailed | undefined {
      if (this.ready) return this._profile
      if (this.failed) return undefined
      if (this.loading) return undefined

      const stored = Store.get(`profile-${this.bskyHandle}`) as ProfileViewDetailed | 'NOT_FOUND' | null
      if (stored != null) {
         runInAction(() => {
            if (stored === 'NOT_FOUND') {
               this._profile = undefined
               this.failed = true
               this.ready = false
               this.loading = false
            } else {
               this._profile = stored
               this.ready = true
               this.failed = false
               this.loading = false
               this.initiallyFollowed = stored.viewer?.following != null
            }
         })

         return this._profile
      }

      void this.fetchProfile()
   }

   async fetchProfile(): Promise<void> {
      if (this.loading) return
      runInAction(() => (this.loading = true))

      try {
         const res = await this.st.api.getProfile({ actor: this.bskyHandle })
         runInAction(() => {
            this._profile = res.data
            this.ready = true
            this.failed = false
            this.loading = false
            if (this.initiallyFollowed == null) this.initiallyFollowed = res.data.viewer?.following != null
            console.log('🟢 profile:', res.data)
            Store.set(`profile-${this.bskyHandle}`, this._profile)
         })
      } catch (e: any) {
         runInAction(() => {
            this._profile = undefined
            this.failed = true
            this.ready = false
            this.loading = false
            Store.set(`profile-${this.bskyHandle}`, 'NOT_FOUND')
         })
      }
   }

   async reloadProfile() {
      runInAction(() => (this.reloading = true))
      Store.remove(`profile-${this.bskyHandle}`)
      await this.fetchProfile()
      runInAction(() => (this.reloading = false))
   }

   get did() { return this.profile?.did } // prettier-ignore
   get bskyPfp() { return this.profile?.avatar } // prettier-ignore
   get bskyBio() { return this.profile?.description } // prettier-ignore
   get bskyDisplayName() { return this.profile?.displayName ?? this.profile?.handle } // prettier-ignore
   get followedUri() { return this.profile?.viewer?.following } // prettier-ignore
   get isFollowed() { return this.followedUri != null } // prettier-ignore

   followLoading = false
   initiallyFollowed?: boolean
   async follow() {
      runInAction(() => (this.followLoading = true))
      if (ACTIVATE_BUTTONS) {
         const res = await this.st.api.follow(bang(this.did))
         console.log('🟢 follow:', res)
      } else {
         await sleep(2000)
      }
      runInAction(() => (this.followLoading = false))
      await this.reloadProfile()
   }

   async unfollow() {
      await this.reloadProfile()
      if (this.followedUri) {
         runInAction(() => (this.followLoading = true))
         // 🔶 add loading state
         if (ACTIVATE_BUTTONS) {
            const res = await this.st.api.deleteFollow(this.followedUri)
            console.log('🔶 unfollowed:', res)
         }
         await this.reloadProfile()
         runInAction(() => (this.followLoading = false))
      } else {
         console.log('❌ not following')
      }
   }

   /// TWITTER
   get twitterId() { return this.row.id } // prettier-ignore
   get twitterPfp() { return this.row.profile_image_url } // prettier-ignore
   get twitterHandle() { return this.row.username } // prettier-ignore
   get twitterDisplayName() { return this.row.name ?? this.row.username } // prettier-ignore
   get twitterBio() { return this.row.description } // prettier-ignore
}

export const bang = <T extends any>(val?: T | null | undefined): T => {
   if (val == null) throw new Error('value should not be null')
   return val
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
