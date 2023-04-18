import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { St } from './St'
import { StContext } from './St.ctx'

const st = new St()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
   <React.StrictMode>
      <StContext.Provider value={st}>
         <App />
      </StContext.Provider>
   </React.StrictMode>,
)
