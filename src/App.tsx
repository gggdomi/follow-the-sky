import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Container, Header, Content, Footer, Col, Row } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'

function App() {
   const [count, setCount] = useState(0)

   return (
      <Container>
         <Header>Header</Header>
         <Content>
            <Row className='show-grid'>
               <Col xs={24} lg={6}>
                  x
               </Col>
               <Col xs={24} lg={12}>
                  <div>
                     <a href='https://vitejs.dev' target='_blank'>
                        <img src={viteLogo} className='logo' alt='Vite logo' />
                     </a>
                     <a href='https://reactjs.org' target='_blank'>
                        <img src={reactLogo} className='logo react' alt='React logo' />
                     </a>
                  </div>
                  <h1>Vite + React</h1>
                  <div className='card'>
                     <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                     <p>
                        Edit <code>src/App.tsx</code> and save to test HMR
                     </p>
                  </div>
                  <p className='read-the-docs'>Click on the Vite and React logos to learn more</p>
               </Col>
               <Col xs={24} lg={6}>
                  y
               </Col>
            </Row>
         </Content>
         <Footer>Footer</Footer>
      </Container>
   )
}

export default App