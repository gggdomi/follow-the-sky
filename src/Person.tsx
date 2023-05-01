import type { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { makeAutoObservable, runInAction } from 'mobx'
import { St } from './St'
import { Store } from './Store'
import { bang, findHandle, sleep } from './utils'

export class Person {
   ACTIVATE_BUTTONS = true // 🔶 quick way to debug UI without following/unfollowing people for real and spamming their notifications
   constructor(public st: St, private twitterData: TwtDataRow) {
      makeAutoObservable(this)
   }

   get bskyHandle() {
      return (
         findHandle(this.twitterDisplayName) ??
         findHandle(this.twitterBio) ??
         `${this.twitterHandle}.bsky.social`.replaceAll('_', '') // _ is allowed in Twitter but not in Bluesky handles
      )
   }

   private _profile?: ProfileViewDetailed
   ready: boolean = false // ie. profile exists on Bluesky & is loaded
   notFound: boolean = false // ie. we tried to load the profile but it doesn't exist
   loading: boolean = false
   reloading: boolean = false
   get profile(): ProfileViewDetailed | undefined {
      if (this.ready) return this._profile
      if (this.notFound) return undefined
      if (this.loading) return undefined
      if (!this.st.loggedIn) return undefined

      const stored = Store.get(`profile-${this.bskyHandle}`) as ProfileViewDetailed | 'NOT_FOUND' | null
      if (stored != null) {
         runInAction(() => {
            if (stored === 'NOT_FOUND') {
               this._profile = undefined
               this.notFound = true
               this.ready = false
               this.loading = false
            } else {
               this._profile = stored
               this.ready = true
               this.notFound = false
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
            this.notFound = false
            this.loading = false
            if (this.initiallyFollowed == null) this.initiallyFollowed = res.data.viewer?.following != null
            Store.set(`profile-${this.bskyHandle}`, this._profile)
         })
      } catch (e: any) {
         runInAction(() => {
            this._profile = undefined
            this.notFound = true
            this.ready = false
            this.loading = false
            if (e.message === 'Profile not found' && e.status === 400) {
               Store.set(`profile-${this.bskyHandle}`, 'NOT_FOUND')
            }
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
      if (this.ACTIVATE_BUTTONS) await this.st.api.follow(bang(this.did))
      else await sleep(600)
      runInAction(() => (this.followLoading = false))
      await this.reloadProfile()
   }

   async unfollow() {
      await this.reloadProfile()
      if (this.followedUri) {
         runInAction(() => (this.followLoading = true))
         if (this.ACTIVATE_BUTTONS) await this.st.api.deleteFollow(this.followedUri)
         else await sleep(2000)
         await this.reloadProfile()
         runInAction(() => (this.followLoading = false))
      } else {
         console.log('❌ cannot unfollow: not following')
      }
   }

   /// TWITTER
   // get twitterId() { return this.twitterData.id } // prettier-ignore
   get twitterPfp() { return this.twitterData.profile_image_url } // prettier-ignore
   get twitterHandle() { return this.twitterData.username } // prettier-ignore
   get twitterDisplayName() { return this.twitterData.name ?? this.twitterData.username } // prettier-ignore
   get twitterBio() { return this.twitterData.description } // prettier-ignore
}

export type TwtDataRow = {
   username: string
   id?: string
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
