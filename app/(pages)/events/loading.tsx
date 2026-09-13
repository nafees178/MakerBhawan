import { Block, HeaderSkeleton, Loading } from "@/components/Skeleton";

export default function EventsLoading() {
  return (
    <Loading>
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <Block className="h-[30rem] lg:col-span-2" />
        <Block className="h-96" />
        <Block className="h-96" />
      </div>
    </Loading>
  );
}
