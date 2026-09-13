import { Bar, Block, HeaderSkeleton, Loading } from "@/components/Skeleton";

export default function InventoryLoading() {
  return (
    <Loading>
      <HeaderSkeleton />
      <Block className="h-11 w-full max-w-sm" />
      <div className="mt-8 divide-y divide-line border-t border-line">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-6 py-4">
            <Bar className="w-1/3" />
            <Bar className="h-3 w-24" />
          </div>
        ))}
      </div>
    </Loading>
  );
}
