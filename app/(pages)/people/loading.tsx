import { Bar, Block, HeaderSkeleton, Loading } from "@/components/Skeleton";

export default function PeopleLoading() {
  return (
    <Loading>
      <HeaderSkeleton />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i}>
            <Block className="aspect-square w-full" />
            <Bar className="mt-4 w-2/3" />
            <Bar className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    </Loading>
  );
}
