import "./globals.css";

export const metadata = {
  title: "Rice ERP",
  description: "Rice Trading Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
