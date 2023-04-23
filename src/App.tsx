import { Observer, observer } from 'mobx-react-lite'
import type { Column } from 'react-data-grid'
import DataGrid from 'react-data-grid'
import 'react-data-grid/lib/styles.css'
import { Icon } from '@rsuite/icons'
import {
   Avatar,
   Button,
   ButtonToolbar,
   Container,
   Content,
   Divider,
   FlexboxGrid,
   Footer,
   Form,
   Header,
   List,
   Loader,
   Message,
   Notification,
   Panel,
   Stack,
   Tooltip,
   Whisper,
   useToaster,
} from 'rsuite'
import 'rsuite/dist/rsuite.min.css'
import './App.css'
import bskyIcon from './assets/bluesky.jpg'
import { Person } from './Person'
import { useSt } from './St.ctx'
import { observableCols } from './grid.utils'
import * as faTwitter from '@fortawesome/free-brands-svg-icons/faTwitter'

const FaSvgIcon = ({ faIcon, ...rest }: any) => {
   const { width, height, svgPathData } = faIcon
   return (
      <svg {...rest} viewBox={`0 0 ${width} ${height}`} width='2em' height='2em' fill='currentColor'>
         <path d={svgPathData}></path>
      </svg>
   )
}

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
               <FlexboxGrid>
                  <FlexboxGrid.Item colspan={12}>
                     <Stack direction='column' spacing={10}>
                        <h3>1. Login to Bluesky</h3>
                        <LoginForm />
                     </Stack>
                  </FlexboxGrid.Item>
                  <FlexboxGrid.Item colspan={12}>
                     <Stack direction='column' spacing={10}>
                        <h3>2. Upload your Twitter following list</h3>

                        <Panel shaded>
                           <Stack direction='column' spacing={10}>
                              <Stack.Item alignSelf='stretch'>
                                 <Panel
                                    style={{
                                       maxWidth: 600,
                                       marginLeft: 'auto',
                                       marginRight: 'auto',
                                       // background: 'var(--rs-message-info-bg)',
                                    }}
                                    header={<strong>How to download following list from twtdata.com?</strong>}
                                    collapsible
                                    bordered
                                 >
                                    TODO
                                 </Panel>
                              </Stack.Item>
                              <Message type={st.uploadError ? 'error' : st.csvReady ? 'success' : 'info'}>
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
                                    {st.csvReady && (
                                       <>
                                          <div>✅ CSV content loaded</div>
                                          <div>
                                             ✅ found <strong>{st.rowsCount}</strong> followers in file
                                          </div>
                                          {st.uploadError != null && (
                                             <div>
                                                ❌ <strong>{st.uploadError}</strong>
                                             </div>
                                          )}
                                          <Button
                                             size='sm'
                                             onClick={() => st.clearUpload()}
                                             appearance='subtle'
                                          >
                                             Clear file
                                          </Button>
                                       </>
                                    )}
                                    {st.uploadError && (
                                       <strong style={{ color: 'red' }}>{st.uploadError}</strong>
                                    )}
                                 </Stack>
                              </Message>
                           </Stack>
                        </Panel>
                     </Stack>
                  </FlexboxGrid.Item>
               </FlexboxGrid>

               <Stack direction='column'>
                  <h3>3. Check who has joined Bluesky and re-follow them</h3>
                  {}
                  <Stack.Item alignSelf='stretch'>
                     <Panel>
                        {st.loggedIn && st.csvReady ? (
                           <>
                              <FollowingList />
                              <FollowedList />
                              <FollowingList_NotFound />
                           </>
                        ) : (
                           <Message type='info'>
                              Once you're logged in Bluesky & have uploaded your following list, we'll try to
                              match the two lists, and allow you to conveniently compare and follow
                           </Message>
                        )}
                     </Panel>
                  </Stack.Item>
               </Stack>
            </Stack>
         </Content>
         <Footer style={{ height: 20, marginBottom: 20 }}>
            <Stack justifyContent='center'>Footer</Stack>
         </Footer>
      </Container>
   )
})

const columns_: Column<Person>[] = [
   {
      key: 'actions',
      name: 'Follow',
      formatter: (val) => {
         if (!val.row.ready) return
         if (val.row.reloading) return <Loader />
         if (val.row.followLoading) return <Loader color='blue' />

         if (val.row.isFollowed)
            return (
               <Stack>
                  <div>✅ Followed</div>
                  <Button appearance='subtle' color='red' size='sm' onClick={() => val.row.unfollow()}>
                     Unfollow
                  </Button>
               </Stack>
            )
         return (
            <Button appearance='primary' color='green' size='sm' onClick={() => val.row.follow()}>
               Follow
            </Button>
         )
      },
   },
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
      formatter: (val) => <Avatar src={val.row.bskyPfp} alt={val.row.bskyHandle} />,
   },
   { key: 'bskyHandle', name: 'Username' },
   {
      key: 'bskyDisplayName',
      name: 'Display Name',
      formatter: (val) => {
         if (val.row.loading) return <Loader />
         if (val.row.failed) return '❌'
         return val.row.bskyDisplayName
      },
   },
   { key: 'bskyBio', name: 'Description' },
] // satisfies ({ key: keyof Person | 'actions' } & Record<string, unknown>)[] // 🔶

const columns = observableCols(columns_)

export const FollowingList = observer(function FollowingList_() {
   const st = useSt()
   return (
      <>
         <h2>
            Your friends found on Bluesky
            {st.initialLoadingCount > 0 ? (
               <Button style={{ marginLeft: 10 }}>
                  <Loader style={{ marginRight: 10 }} /> {st.initialLoadingCount} profiles loading...
               </Button>
            ) : null}
         </h2>
         <h4>It's a simple matching algorithm. First line is twitter</h4>

         <Panel header={`${st.found.length} profiles`} collapsible defaultExpanded bordered>
            <List hover bordered>
               {st.found.map((p) => (
                  <FollowingListRow person={p} key={p.twitterId} />
               ))}
            </List>
         </Panel>
      </>
   )
})

export const FollowedList = observer(function FollowingList_() {
   const st = useSt()
   return (
      <>
         <h2>Profiles you already follow on Bluesky</h2>
         <Panel header={`${st.followed.length} other profiles`} collapsible bordered>
            <List hover>
               {st.followed.map((p) => (
                  <FollowingListRow person={p} key={p.twitterId} />
               ))}
            </List>
         </Panel>
      </>
   )
})
export const FollowingList_NotFound = observer(function FollowingList_() {
   const st = useSt()
   return (
      <>
         <h2>Profiles not found on Bluesky</h2>
         <h4>
            This does not mean they are not there! They may have a different handle (ex: a custom domain)
         </h4>
         <Panel header={`${st.notFound.length} other profiles`} collapsible bordered>
            <List hover style={{ opacity: 0.6 }}>
               {st.notFound.map((p) => (
                  <FollowingListRow person={p} key={p.twitterId} />
               ))}
            </List>
         </Panel>
      </>
   )
})

export const FollowingListRow = observer(function FollowingList_(p: { person: Person }) {
   const st = useSt()
   return (
      <List.Item size='lg'>
         <div>
            <FlexboxGrid style={{ wordBreak: 'break-all' }} justify='space-between' align='middle'>
               <FlexboxGrid.Item colspan={1}>
                  {/* <Avatar src={twitterIcon} size='xs' /> */}
                  {/* @ts-ignore */}
                  <Icon as={FaSvgIcon} faIcon={faTwitter} style={{ fontSize: 11, color: '#aaa' }} />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={1}>
                  <Avatar src={p.person.twitterPfp} alt={p.person.twitterHandle} />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={3}>
                  <strong>{p.person.twitterDisplayName}</strong>{' '}
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={3}>
                  <span style={{ color: 'gray' }}>@{p.person.twitterHandle}</span>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={12}>
                  <span>{p.person.twitterBio}</span>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={4}></FlexboxGrid.Item>
            </FlexboxGrid>
         </div>
         <Divider style={{ margin: '14px 0', opacity: 0.4 }} />
         <div>
            <FlexboxGrid style={{ wordBreak: 'break-all' }} justify='space-between' align='middle'>
               <FlexboxGrid.Item colspan={1}>
                  {/* <Avatar src={twitterIcon} size='xs' /> */}
                  {/* @ts-ignore */}
                  <Avatar src={bskyIcon} size='xs' />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={1}>
                  <Stack>
                     <Avatar src={p.person.bskyPfp} alt={p.person.bskyHandle} />
                  </Stack>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={3}>
                  {p.person.failed ? '❌ no match found' : <strong>{p.person.bskyDisplayName}</strong>}
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={3}>
                  <span style={{ color: 'gray' }}>@{p.person.bskyHandle}</span>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={12}>
                  <span>{p.person.bskyBio}</span>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={4} /* style={{ backgroundColor: '#fee' }} */>
                  <Stack justifyContent='flex-end'>
                     <FollowButton person={p.person} />
                  </Stack>
               </FlexboxGrid.Item>
            </FlexboxGrid>
         </div>
      </List.Item>
   )
})

export const FollowButton = observer(function FollowButton_(p: { person: Person }) {
   if (!p.person.ready) return null
   if (p.person.reloading) return <Loader />
   if (p.person.followLoading) return <Loader color='blue' />

   if (p.person.isFollowed)
      return (
         <Stack>
            <div>✅ Followed</div>
            <Button appearance='subtle' color='red' size='sm' onClick={() => p.person.unfollow()}>
               Unfollow
            </Button>
         </Stack>
      )
   return (
      <Button appearance='primary' color='blue' onClick={() => p.person.follow()}>
         Follow on Bluesky
      </Button>
   )
})

export const FollowingGrid = observer(function FollowingGrid_(p: {}) {
   const st = useSt()
   return (
      <DataGrid
         style={{ minHeight: 800, height: '90vh' }}
         columns={columns}
         rows={st.persons}
         rowKeyGetter={(row) => row.twitterId}
         className={'rdg-light grid-wrapped grid-var-height'}
         rowHeight={undefined}
         enableVirtualization={false}
      />
   )
})

export const LoginForm = observer(function LoginForm_(p: {}) {
   const st = useSt()
   const toaster = useToaster()

   if (false)
      //st.loggedIn)
      return (
         <Stack direction='column' alignItems='flex-end'>
            <Message type='success'>
               <Stack spacing={5}>
                  <div>
                     Logged in as <strong>{st._api?.session?.handle}</strong>
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
                           <strong>This is as safe as possible </strong>(if you trust me).
                           <br />
                           <br />
                           Passwords are sent to no server except the service you choose below (ie. Bluesky
                           itself), not stored in any back-end, cookies or even front-end.
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
                     onClick={async () => {
                        const error = await st.login()
                        if (error) {
                           void toaster?.push(
                              <Notification type='error' header='error' closable>{error}</Notification>, // prettier-ignore
                              { placement: 'bottomCenter' },
                           )
                        }
                     }}
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
