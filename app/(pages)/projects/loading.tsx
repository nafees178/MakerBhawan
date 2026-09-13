import { Bar, Block, HeaderSkeleton, Loading } from "@/components/Skeleton";

export default function ProjectsLoading() {
  return (
    <Loading>
      <HeaderSkeleton />
      <Block className="h-64" />
      <div className="mt-20 space-y-28 lg:pl-20">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i}>
            <Block className="aspect-[16/9] w-full lg:aspect-[21/9]" />
            <div className="mt-10 grid gap-x-16 gap-y-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
              <Bar className="h-8 w-64" />
              <div className="space-y-3">
                <Bar />
                <Bar />
                <Bar className="w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Loading>
  );
}
