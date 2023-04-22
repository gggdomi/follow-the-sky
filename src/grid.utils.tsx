import { observer } from 'mobx-react-lite'
import { Column, FormatterProps } from 'react-data-grid'

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

export const DefaultFormatter = <Row extends any>(val: FormatterProps<Row, any>) => (
   <div>{val.row[val.column.key as keyof Row] as any}</div>
)
