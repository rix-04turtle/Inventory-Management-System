
import { ChartAreaInteractive } from "@/components/applayout/chart-area-interactive"
import { DataTable } from "@/components/applayout/data-table"
import { SectionCards } from "@/components/applayout/section-cards"
import data from "../app/dashboard/data.json"
import { DashboardLayout } from "@/components/applayout/with-dashboard-layout"


export default function Page() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards />
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
        <DataTable data={data} />
      </div>
    </DashboardLayout>
  );
}
