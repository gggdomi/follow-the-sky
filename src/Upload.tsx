import { observer } from 'mobx-react-lite'
import { Form, IconButton, Message, Panel, Stack } from 'rsuite'
import { useSt } from './St.ctx'
import * as I from '@rsuite/icons'
import { useRef } from 'react'

export const Upload = observer(function Upload_(p: {}) {
   const fileInputRef = useRef<HTMLInputElement>(null)

   const st = useSt()
   return (
      <Panel>
         <Stack direction='column' spacing={10} alignItems='stretch'>
            <Panel
               header='Instructions'
               bordered
               collapsible
               defaultExpanded={!st.csvReady}
               style={{ maxWidth: '90vw' }}
            >
               <strong>Step 1. Export your following list from Twitter</strong>
               <br />
               <span>
                  We wish we could export our list of friends in one click with an app. But with Twitter
                  closing its API, it's currently not possible.
               </span>
               <br />
               My best known alternative:{' '}
               <a href='https://www.twtdata.com/' target='_blank'>
                  twtdata.com
               </a>{' '}
               allows you to instantly export up to 2000 people you follow to a csv file for free.
               <Form.HelpText style={{ margin: '5px 0' }}>
                  If you find any better exporter and want it supported here, please mention it to{' '}
                  <a href='https://staging.bsky.app/profile/sengui.dev' target='_blank'>
                     @sengui.dev
                  </a>
               </Form.HelpText>
               To get your following list:
               <ol>
                  <li>
                     Go to{' '}
                     <a href='https://www.twtdata.com/' target='_blank'>
                        twtdata.com
                     </a>
                  </li>
                  <li>
                     Switch to <code>Friends/Following</code> tab in the form in right-half of the page
                  </li>
                  <li>Enter your Twitter handle, your email, submit</li>
                  <li>Preferred file format: csv. "Get free report"</li>
                  <li>
                     ⚠️{' '}
                     <strong>
                        There is a big THANK YOU page but you're not there yet! Only after filling the
                        feedback form, will you (immediately) get your csv file export in your mail
                     </strong>{' '}
                     ⚠️
                  </li>
               </ol>
               <strong>Step 2. Upload your following list below</strong>
               <Form.HelpText>
                  If you downloaded the file from twtdata.com, you're good. Just drop the export below.
                  <br />
                  If you're manually editing an export from another source, the supported format is a{' '}
                  <code>.csv</code> file, with (at least) these 4 columns in the header:
                  {/* prettier-ignore */}
                  <pre style={{ overflowX: 'scroll', maxWidth: '30rem', margin: '8px 0', backgroundColor: '#eee', padding: 5 }}>
                        username,name,profile_image_url,description<br/>
                        @justinbieber,Justin Bieber,https://pbs.twimg.com/profile_images/1473447174591684612/vlsbWYtq_x96.jpg,"JUSTICE the album out now"<br />
                        ...
                  </pre>
               </Form.HelpText>
            </Panel>

            <Message type={st.uploadError.length ? 'error' : st.csvReady ? 'success' : 'warning'}>
               <Stack spacing={20} style={{ backgroundColor: 'var(--rs-background-success)' }} wrap>
                  <div
                     className='dropzone'
                     tabIndex={-1}
                     onDrop={(e) => {
                        e.preventDefault()
                        st.handleFile(e.dataTransfer.files[0]!)
                     }}
                     onClick={() => fileInputRef.current?.click()}
                     onDragOver={(e) => e.preventDefault()} // 🔶 this could set/unset a state
                     onDragLeave={(e) => e.preventDefault()}
                  >
                     <div style={{ marginRight: 8 }}>
                        <I.FileUpload style={{ fontSize: 24 }} />
                     </div>
                     <div>{!st.csvReady ? 'Drop your following list here' : 'Drop again to replace'}</div>
                  </div>

                  <input
                     type='file'
                     ref={fileInputRef}
                     onChange={(e) => st.handleFile(e.target.files![0])}
                     style={{ display: 'none' }}
                  />
                  {st.csvReady ? (
                     <Stack spacing={3} direction='column' alignItems='flex-start'>
                        <div>
                           {st.persons.length === 0 ? '⚠️' : '✅'} found <strong>{st.persons.length}</strong>{' '}
                           followers
                        </div>
                        {st.uploadError.map((e) => (
                           <div>
                              ❌ <strong>{e}</strong>
                           </div>
                        ))}
                        <IconButton
                           size='sm'
                           onClick={() => st.clearUpload()}
                           // appearance='subtle'
                           icon={<I.Trash />}
                        >
                           Clear file
                        </IconButton>
                     </Stack>
                  ) : (
                     <div>
                        <div>No file uploaded yet</div>
                     </div>
                  )}
               </Stack>
            </Message>
         </Stack>
      </Panel>
   )
})
