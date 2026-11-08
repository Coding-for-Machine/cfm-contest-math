import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "CFM Contest Math",
  description: "CFM Contest Math application",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
