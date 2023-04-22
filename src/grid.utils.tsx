import { Observer } from 'mobx-react-lite'
import { Column, FormatterProps } from 'react-data-grid'

export const observableCols = <Row extends any>(cols: Column<Row>[]): Column<Row>[] => {
   return cols.map((col) => {
      const OriginalFormatter = (col.formatter as any) ?? DefaultFormatter
      const formatter = (props: FormatterProps<Row, any>) => (
         <Observer>{() => <OriginalFormatter {...props} />}</Observer>
      )
      return { ...col, formatter }
   })
}

export const DefaultFormatter = <Row extends any>(val: FormatterProps<Row, any>) => (
   <div>{val.row[val.column.key as keyof Row] as any}</div>
)
