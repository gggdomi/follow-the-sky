import { observer } from 'mobx-react-lite'
import { Button, ButtonToolbar, Form, Panel, Stack, Tooltip, Whisper, useToaster } from 'rsuite'
import { useSt } from './St.ctx'
import ExitIcon from '@rsuite/icons/Exit'

export const Login = observer(function LoginForm_(p: {}) {
   const st = useSt()
   const toaster = useToaster()

   if (st.loggedIn)
      return (
         <Panel>
            <Stack spacing={10} direction='column'>
               <div>
                  ✅ Logged in as <strong>{st._api?.session?.handle}</strong>
               </div>
               <Button size='sm' onClick={() => st.logout()}>
                  <ExitIcon style={{ marginRight: 10 }} /> log out (& clear local cache)
               </Button>
            </Stack>
         </Panel>
      )

   return (
      <Panel bordered>
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
               <Form.HelpText>
                  <Whisper
                     placement='right'
                     trigger='hover'
                     enterable
                     speaker={
                        <Tooltip style={{ padding: 10 }}>
                           I like to avoid to put my password on random websites. You shouldn't either.
                           <br />
                           <br />
                           However, as of now, this is the only way to authenticate to Bluesky services.
                           <br />
                           <br />
                           <strong>This is as safe as possible </strong>(if you trust me): passwords are sent
                           to no server except the service you choose below (ie. Bluesky itself), not stored
                           in any back-end, cookies or even front-end.
                           <br />
                           <br />
                           To be even more certain, please{' '}
                           <a
                              href='https://github.com/gggdomi/import-twitter-following-bluesky'
                              target='__blank'
                           >
                              check the source code
                           </a>{' '}
                           (or even run the code locally)
                        </Tooltip>
                     }
                  >
                     <span>😨 Is this secure?</span>
                  </Whisper>
               </Form.HelpText>
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
                  <Button
                     appearance='primary'
                     onClick={() => st.login(toaster)}
                     disabled={!st.canLogin}
                     type='submit'
                     block
                  >
                     Login
                  </Button>
               </ButtonToolbar>
            </Form.Group>
            {st.loginError && <span style={{ color: 'red' }}>❌ {st.loginError}</span>}
         </Form>
      </Panel>
   )
})
