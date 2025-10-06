import { Sidebar } from '@/components/dashboard/sidebar'

export default function TraineeDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar type="trainee" />
      <main className="lg:pl-64">
        {children}
      </main>
    </>
  )
}
