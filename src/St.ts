import { makeAutoObservable } from 'mobx'

export class St {
   constructor() {
      makeAutoObservable(this)
   }

   count = 0
   incr() {
      this.count++
   }
}
