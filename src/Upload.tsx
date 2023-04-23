import { observer } from 'mobx-react-lite'
import { Button, Message, Panel, Stack } from 'rsuite'
import { useSt } from './St.ctx'
import FileUploadIcon from '@rsuite/icons/FileUpload'

export const Upload = observer(function Upload_(p: {}) {
   const st = useSt()
   return (
      <Panel bordered>
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
                  // bordered
               >
                  TODO
               </Panel>
            </Stack.Item>
            <Stack spacing={20}>
               <div
                  className='dropzone'
                  tabIndex={-1}
                  onDrop={(e) => st.onDrop(e)}
                  onClick={() => {}} // 🔶 TODO
                  onDragOver={(e) => e.preventDefault()} // 🔶 this could set/unset a state
                  onDragLeave={(e) => e.preventDefault()}
               >
                  <div style={{ marginRight: 8 }}>
                     <FileUploadIcon style={{ fontSize: 24 }} />
                  </div>
                  <div>Drop your following list from twtdata.com here</div>
               </div>
               {st.csvReady && (
                  <>
                     <div>✅ CSV content loaded</div>
                     <div>
                        ✅ found <strong>{st.persons.length}</strong> followers in file
                     </div>
                     {st.uploadError != null && (
                        <div>
                           ❌ <strong>{st.uploadError}</strong>
                        </div>
                     )}
                     <Button size='sm' onClick={() => st.clearUpload()} appearance='subtle'>
                        Clear file
                     </Button>
                  </>
               )}
               {st.uploadError && <strong style={{ color: 'red' }}>{st.uploadError}</strong>}
            </Stack>
         </Stack>
      </Panel>
   )
})
