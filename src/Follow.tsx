import * as faTwitter from '@fortawesome/free-brands-svg-icons/faTwitter'
import { Icon } from '@rsuite/icons'
import { observer } from 'mobx-react-lite'
import { Avatar, Button, Divider, FlexboxGrid, List, Loader, Message, Panel, Stack } from 'rsuite'
import { Person } from './Person'
import { useSt } from './St.ctx'
import bskyIcon from './assets/bluesky.jpg'
import { FaSvgIcon } from './utils'

export const Follow = observer(function Follow_(p: {}) {
   const st = useSt()
   return (
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
                  Once you're logged in Bluesky & have uploaded your following list, we'll try to match the
                  two lists, and allow you to conveniently compare and follow
               </Message>
            )}
         </Panel>
      </Stack.Item>
   )
})

export const FollowingList = observer(function FollowingList_() {
   const st = useSt()
   return (
      <>
         <h2>
            Your friends found on Bluesky
            {st.loading.length > 0 ? (
               <Button style={{ marginLeft: 10 }}>
                  <Loader style={{ marginRight: 10 }} /> {st.loading.length} profiles loading...
               </Button>
            ) : null}
         </h2>
         <h4>It's a simple matching algorithm. First line is twitter</h4>

         <Panel header={`${st.found.length} profiles`} collapsible defaultExpanded bordered>
            <List hover bordered>
               {st.found.map((p) => (
                  <FollowingListRow person={p} key={p.twitterHandle} />
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
                  <FollowingListRow person={p} key={p.twitterHandle} />
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
                  <FollowingListRow person={p} key={p.twitterHandle} />
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
                  {/* @ts-ignore */}
                  <Avatar src={bskyIcon} size='xs' />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={1}>
                  <Stack>
                     <Avatar src={p.person.bskyPfp} alt={p.person.bskyHandle} />
                  </Stack>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item colspan={3}>
                  {p.person.notFound ? '❌ no match found' : <strong>{p.person.bskyDisplayName}</strong>}
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
