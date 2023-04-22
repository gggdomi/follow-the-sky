import { Observer, observer } from 'mobx-react-lite'
import type { Column } from 'react-data-grid'
import DataGrid from 'react-data-grid'
import 'react-data-grid/lib/styles.css'
import {
   Avatar,
   Button,
   ButtonToolbar,
   Checkbox,
   Container,
   Content,
   Footer,
   Form,
   Loader,
   Message,
   Panel,
   Stack,
   useToaster,
} from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import './App.css'
import { Person } from './Person'
import { useSt } from './St.ctx'
import { observableCols } from './grid.utils'

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

               <Stack direction='column' spacing={10}>
                  <h2>2. Upload Friends List</h2>

                  <Stack.Item alignSelf='stretch'>
                     <Panel
                        style={{
                           maxWidth: 600,
                           marginLeft: 'auto',
                           marginRight: 'auto',
                           background: 'var(--rs-message-info-bg)',
                        }}
                        header={<strong>How to download following list from twtdata.com?</strong>}
                        collapsible
                     >
                        TODO
                     </Panel>
                  </Stack.Item>
                  <Message type={st.csvContent == null ? 'info' : 'success'}>
                     <Stack spacing={20}>
                        <Button
                           className='dropzone'
                           appearance='primary'
                           as='div'
                           size='lg'
                           tabIndex={-1}
                           onDrop={(e) => st.onDrop(e)}
                           onClick={() => {}} // 🔶 TODO
                           onDragOver={(e) => e.preventDefault()} // 🔶 this could set/unset a state
                           onDragLeave={(e) => e.preventDefault()}
                        >
                           Drop your following list from twtdata.com here
                        </Button>
                        {st.csvContent != null && (
                           <>
                              <div>✅ CSV content loaded</div>
                              {st.parsedData != null && (
                                 <div>
                                    ✅ found <strong>{st.rowsCount}</strong> followers in file
                                 </div>
                              )}
                              {st.parseError != null && (
                                 <div>
                                    ❌ <strong>{st.parseError}</strong>
                                 </div>
                              )}
                           </>
                        )}
                        {st.csvContent != null && (
                           <Button size='sm' onClick={() => st.clearUpload()} appearance='subtle'>
                              Clear file
                           </Button>
                        )}
                     </Stack>
                  </Message>
               </Stack>

               <Stack direction='column'>
                  <h2>3. Follow</h2>
                  <Stack.Item alignSelf='stretch'>
                     <Panel>
                        <DataGrid
                           style={{ height: 800 }}
                           columns={columns}
                           rows={st.persons}
                           rowKeyGetter={(row) => row.twitterId}
                           className={'rdg-light grid-wrapped grid-var-height'}
                           rowHeight={undefined}
                           enableVirtualization={false}
                        />
                     </Panel>
                  </Stack.Item>
               </Stack>
            </Stack>
         </Content>
         <Footer>Footer</Footer>
      </Container>
   )
})

const columns_: Column<Person>[] = [
   {
      key: 'twitterPfp',
      name: 'Avatar',
      formatter: (val) => <Avatar src={val.row.twitterPfp} alt={val.row.twitterBio} />,
   },
   { key: 'twitterHandle', name: 'Username' },
   { key: 'twitterBio', name: 'Description' },
   {
      key: 'bskyPfp',
      name: 'Avatar',
      formatter: (val) => {
         const pfp = val.row.bskyPfp
         if (val.row.bskyProfile === 'LOADING') return <Loader />
         return <Avatar src={pfp} alt={val.row.bskyHandle} />
      },
   },
   { key: 'bskyHandle', name: 'Username' },
   { key: 'bskyDisplayName', name: 'Display Name' },
   { key: 'bskyBio', name: 'Description' },
   { key: 'actions', name: 'Follow' },
] // satisfies ({ key: keyof Person | 'actions' } & Record<string, unknown>)[] // 🔶

const columns = observableCols(columns_)

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
