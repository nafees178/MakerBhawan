import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { pageMeta } from "@/lib/site";
import { getInventory } from "@/lib/data";
import { InventoryList } from "./InventoryList";

export const metadata: Metadata = pageMeta({
  title: "Inventory",
  description:
    "Everything on the shelves at the Anand Rathi Tinkerers' Lab, IIT Jodhpur: microcontrollers, sensors, motors, power and instruments, with what is available right now.",
  path: "/inventory",
});

export default async function InventoryPage() {
  const items = await getInventory();

  return (
    <>
      <PageHeader label="Inventory" title="On the shelves">
        Equipment the lab holds and whether it is available right now. Items marked lab use only
        stay in the lab.
      </PageHeader>
      <InventoryList items={items} />
    </>
  );
}
