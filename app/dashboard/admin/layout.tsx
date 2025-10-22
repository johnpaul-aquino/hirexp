import { Sidebar } from '@/components/dashboard/sidebar'

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Sidebar type="admin" />
      <main className="lg:pl-64">
        {children}
      </main>
    </>
  )
}
