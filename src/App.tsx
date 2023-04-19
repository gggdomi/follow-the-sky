import {
   Container,
   Header,
   Content,
   Footer,
   Col,
   Row,
   Button,
   ButtonToolbar,
   Form,
   Panel,
   Checkbox,
   Message,
   useToaster,
   Stack,
   Grid,
   Placeholder,
} from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import { observer } from 'mobx-react-lite'
import { useSt } from './St.ctx'

export const App = observer(function App_(p: {}) {
   const st = useSt()

   return (
      <Container>
         <Content>
            <Stack direction='column' spacing={30} alignItems='stretch'>
               <Stack direction='column'>
                  <h2>1. Login</h2>
                  <LoginForm />
               </Stack>
            </Stack>
         </Content>
         <Footer>Footer</Footer>
      </Container>
   )
})

export const LoginForm = observer(function LoginForm_(p: {}) {
   const st = useSt()
   const toaster = useToaster()

   if (st.loggedIn)
      return (
         <Stack direction='column' alignItems='flex-end'>
            <Message type='success'>
               <Stack spacing={5}>
                  <div>
                     Logged in as <strong>{st.identifier}</strong>
                  </div>
                  <Button size='sm' onClick={() => st.logout()}>
                     logout (& clear local cache)
                  </Button>
               </Stack>
            </Message>
         </Stack>
      )

   return (
      <Panel shaded>
         <Form>
            <Form.Group controlId='identifier'>
               <Form.ControlLabel>Identifier</Form.ControlLabel>
               <Form.Control
                  name='identifier'
                  value={st.identifier}
                  onChange={(v) => (st.identifier = v)}
                  placeholder='yolo.bsky.social'
               />
            </Form.Group>
            <Form.Group controlId='password'>
               <Form.ControlLabel>Password</Form.ControlLabel>
               <Form.Control
                  name='password'
                  value={st.password}
                  onChange={(v) => (st.password = v)}
                  type='password'
                  autoComplete='off'
               />
            </Form.Group>
            <Form.Group controlId='service'>
               <Form.ControlLabel>Service</Form.ControlLabel>
               <Form.Control name='service' value={st.service} onChange={(v) => (st.service = v)} />
               <Form.HelpText>
                  The default value `https://bsky.social` is probably what you want
               </Form.HelpText>
            </Form.Group>
            <Form.Group>
               <ButtonToolbar>
                  <Button appearance='primary' onClick={() => st.login(toaster)} disabled={!st.canLogin}>
                     Login
                  </Button>
                  <Checkbox
                     checked={st.rememberCredentials}
                     onChange={(x, v) => (st.rememberCredentials = v)}
                  >
                     Remember
                  </Checkbox>
               </ButtonToolbar>
            </Form.Group>
            {st.loginError && <span style={{ color: 'red' }}>❌ {st.loginError}</span>}
         </Form>
      </Panel>
   )
})
