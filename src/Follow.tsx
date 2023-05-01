import * as faTwitter from '@fortawesome/free-brands-svg-icons/faTwitter'
import { Icon } from '@rsuite/icons'
import { observer } from 'mobx-react-lite'
import { Avatar, Button, Divider, FlexboxGrid, Form, List, Loader, Message, Panel, Stack, Col } from 'rsuite'
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
               <Stack direction='column' spacing={20} alignItems='stretch'>
                  <FollowingList />
                  <FollowedList />
                  <FollowingList_NotFound />
               </Stack>
            ) : (
               <Message type='info'>
                  Once you're logged in Bluesky & have uploaded your following list, we'll try to match the
                  two lists, and allow you to conveniently compare and follow profiles
               </Message>
            )}
         </Panel>
      </Stack.Item>
   )
})

export const FollowingList = observer(function FollowingList_() {
   const st = useSt()
   return (
      <Panel
         header={
            <Message type='success'>
               <div>
                  {st.found.length > 0 && '🎉 '} We found <strong>{st.found.length}</strong> potential new
                  follows on Bluesky {st.found.length > 0 && ' 🥳'}
                  <br />
                  We put their Twitter vs Bluesky profiles next to each other so you can easily check that
                  it's the same people, and eventually follow them.
               </div>
            </Message>
         }
         collapsible
         bordered
         defaultExpanded
      >
         {/* 🔶 add 'Follow all' button  */}
         <List hover bordered style={{ maxHeight: 500 }}>
            {st.found.map((p) => (
               <FollowingListRow person={p} key={p.twitterHandle} />
            ))}
         </List>
      </Panel>
   )
})

export const FollowedList = observer(function FollowingList_() {
   const st = useSt()
   return (
      <Panel
         header={
            <Message type='info'>
               <div>
                  You already follow on Bluesky <strong>{st.followed.length}</strong> persons of the uploaded
                  list (click to see the list)
               </div>
            </Message>
         }
         collapsible
         bordered
      >
         <List hover style={{ maxHeight: 500 }}>
            {st.followed.map((p) => (
               <FollowingListRow person={p} key={p.twitterHandle} />
            ))}
         </List>
      </Panel>
   )
})
export const FollowingList_NotFound = observer(function FollowingList_() {
   const st = useSt()
   return (
      <Panel
         header={
            <Message type='warning'>
               <div>
                  The other <strong>{st.notFound.length}</strong> usernames have not been found on Bluesky
                  <br />
                  This does not mean they are not there! The matching algorithm is very naive. Maybe they have
                  a slightly different handle, a custom domain... But you're on your own here!
               </div>
            </Message>
         }
         collapsible
         bordered
      >
         <List hover style={{ opacity: 0.6, maxHeight: 500 }}>
            {st.notFound.map((p) => (
               <FollowingListRow person={p} key={p.twitterHandle} />
            ))}
         </List>
      </Panel>
   )
})

export const FollowingListRow = observer(function FollowingList_(p: { person: Person }) {
   const st = useSt()
   return (
      <List.Item size='lg'>
         <div>
            <FlexboxGrid style={{ wordBreak: 'break-all' }} justify='space-between' align='middle'>
               <FlexboxGrid.Item as={Col} colspan={4} md={1}>
                  {/* @ts-ignore */}
                  <Icon as={FaSvgIcon} faIcon={faTwitter} style={{ fontSize: 11, color: '#aaa' }} />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={20} md={1}>
                  <Avatar src={p.person.twitterPfp} alt={p.person.twitterHandle} />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={3}>
                  <strong>{p.person.twitterDisplayName}</strong>{' '}
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={3}>
                  <a href={`https://twitter.com/${p.person.twitterHandle}`} target='_blank'>
                     <span style={{ color: 'gray' }}>@{p.person.twitterHandle}</span>
                  </a>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={12}>
                  <span>{p.person.twitterBio}</span>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={4}></FlexboxGrid.Item>
            </FlexboxGrid>
         </div>
         <Divider style={{ margin: '14px 0', opacity: 0.4 }} />
         <div>
            <FlexboxGrid style={{ wordBreak: 'break-all' }} justify='space-between' align='middle'>
               <FlexboxGrid.Item as={Col} colspan={4} md={1}>
                  {/* @ts-ignore */}
                  <Avatar src={bskyIcon} size='xs' />
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={20} md={1}>
                  <Stack>
                     <Avatar src={p.person.bskyPfp} alt={p.person.bskyHandle} />
                  </Stack>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={3}>
                  {p.person.notFound ? '❌ no match found' : <strong>{p.person.bskyDisplayName}</strong>}
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={3}>
                  <a href={`https://staging.bsky.app/profile/${p.person.bskyHandle}`} target='_blank'>
                     <span style={{ color: 'gray' }}>@{p.person.bskyHandle}</span>
                  </a>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={12}>
                  <span>{p.person.bskyBio}</span>
               </FlexboxGrid.Item>
               <FlexboxGrid.Item as={Col} colspan={24} md={4} /* style={{ backgroundColor: '#fee' }} */>
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
