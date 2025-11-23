import { Skeleton } from './skeleton'

export const Statistic = ({ label, value, helptext }: { label: string; value: string | number; helptext?: string }) => {
  return (
    <div className="p-2">
      <div className="top-8 right-0 text-right">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-xs text-gray-400">{helptext}</div>
      </div>
    </div>
  )
}

export const SkellyStats = () => {
  return Array.from({ length: 4 }, (_, i) => (
    <div key={i} className="p-2 flex flex-col">
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-2/3 mb-2 self-end" />
      <Skeleton className="h-4 w-full" />
    </div>
  ))
}
