export const metadata = {
 title: 'Dashboard',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
 return <div className="space-y-4">{children}</div>
}
