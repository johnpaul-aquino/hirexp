import { Sidebar } from '@/components/dashboard/sidebar'

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar type="company" />
      <main className="lg:pl-64">
        {children}
      </main>
    </>
  )
}
