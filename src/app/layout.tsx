import "./globals.css";
import NavigationProgress from "@/components/ui/NavigationProgress";

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
      <body>
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
