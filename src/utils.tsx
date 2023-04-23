export const bang = <T extends any>(val?: T | null | undefined): T => {
   if (val == null) throw new Error('value should not be null')
   return val
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const FaSvgIcon = ({ faIcon, ...rest }: any) => {
   const { width, height, svgPathData } = faIcon
   return (
      <svg {...rest} viewBox={`0 0 ${width} ${height}`} width='2em' height='2em' fill='currentColor'>
         <path d={svgPathData}></path>
      </svg>
   )
}

export const findHandle = (s: string | undefined) => {
   if (s == null) return
   const match = s.match(/@?(\S+(?:\.| dot )bsky(?:\.| dot )social)/)
   if (match == null) return
   return match[1].replaceAll(' dot ', '.')
}
