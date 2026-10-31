import type { Metadata } from "next";
import "@/styles/globals.css";
import { StoreProvider } from "@/lib/redux/StoreProvider";

export const metadata: Metadata = {
  title: "Northstar Cloud",
  description: "Modern cloud infrastructure landing page",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
