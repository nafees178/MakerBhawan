import { Bar, Block, Loading } from "@/components/Skeleton";

export default function ProjectLoading() {
  return (
    <Loading>
      <Bar className="h-3 w-24" />
      <Bar className="mt-8 h-10 w-[26rem] max-w-full" />
      <Bar className="mt-5 h-4 w-72" />
      <Block className="mt-12 aspect-[16/9] w-full lg:aspect-[21/9]" />
      <div className="mt-14 grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bar key={i} className={i % 4 === 3 ? "w-3/5" : "w-full"} />
          ))}
        </div>
        <Block className="h-64" />
      </div>
    </Loading>
  );
}
