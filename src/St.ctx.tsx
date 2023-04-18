import type { St } from './St'
import { createContext, useContext } from 'react'

export const StContext = createContext<St | undefined>(undefined)

export const useSt = () => {
   const val = useContext(StContext)
   if (val == null) throw new Error('No St found in context')
   return val
}
