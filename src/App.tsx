import { observer } from 'mobx-react-lite'
import 'react-data-grid/lib/styles.css'
import { Container, Content, FlexboxGrid, Grid, Footer, Header, Loader, Stack, Col, Row, Panel } from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import './App.css'
import { useSt } from './St.ctx'
import { Login } from './LoginForm'
import { Upload } from './Upload'
import { Follow } from './Follow'

export const App = observer(function App_(p: {}) {
   const st = useSt()

   if (st.hydrated == false) return <Loader />
   return (
      <Container>
         <Header style={{ margin: '20px 0', textAlign: 'center' }}>
            <h1>Twitter ➡️ Bluesky</h1>
            <h4>Find again in Bluesky people you follow on Twitter</h4>
         </Header>
         <Content>
            <Stack direction='column' spacing={30} alignItems='stretch'>
               <Grid fluid>
                  <Row>
                     <Col lg={9} xs={24}>
                        <Panel>
                           <Stack direction='column' spacing={10}>
                              <h3>1. Log in to Bluesky</h3>
                              <Login />
                           </Stack>
                        </Panel>
                     </Col>
                     <Col lg={15} xs={24}>
                        <Panel>
                           <Stack direction='column' spacing={10}>
                              <h3>2. Upload your Twitter following list</h3>
                              <Upload />
                           </Stack>
                        </Panel>
                     </Col>
                  </Row>
               </Grid>

               <Stack direction='column'>
                  <h3>3. Check who has joined Bluesky and re-follow them</h3>
                  <Follow />
               </Stack>
            </Stack>
         </Content>
         <Footer style={{ height: 20, marginBottom: 20 }}>
            <Stack justifyContent='center'>Footer</Stack>
         </Footer>
      </Container>
   )
})
