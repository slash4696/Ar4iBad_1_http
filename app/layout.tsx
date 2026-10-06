import type { Metadata } from "next";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: `${site.name} — фотография и нейрофотосессии`,
  description:
    `Фотография и нейрофотосессии в ${site.city}. ${site.service.photos} обработанных фото — ${site.service.price} ₽.`,
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
