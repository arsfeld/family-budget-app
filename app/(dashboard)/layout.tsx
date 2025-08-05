import { NavbarWrapper } from "@/components/navbar-wrapper"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarWrapper />
      {children}
    </>
  )
}