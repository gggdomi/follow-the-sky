import { observer } from 'mobx-react-lite'
import type { Column, FormatterProps } from 'react-data-grid'
import { Loader, Stack, Button, Avatar } from 'rsuite'
import { Person } from './Person'
import { useSt } from './St.ctx'
import DataGrid from 'react-data-grid'

/**
 * 🔶 This is an alternative UI based on a table instead of a list.
 * It's unused but it works, keeping it here for reference.
 */

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

export const observableCols = <Row extends any>(cols: Column<Row>[]): Column<Row>[] => {
   return cols.map((col) => {
      const OriginalFormatter = (col.formatter as any) ?? DefaultFormatter
      return {
         ...col,
         formatter: (props) => {
            const Comp = observer(OriginalFormatter)
            return <Comp {...props} />
         },
      }
   })
}

const columns = observableCols(columns_)

export const DefaultFormatter = <Row extends any>(val: FormatterProps<Row, any>) => (
   <div>{val.row[val.column.key as keyof Row] as any}</div>
)
