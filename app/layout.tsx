import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YaMetrics — Выгрузка логов Яндекс Метрики",
  description: "Удобный интерфейс для работы с Logs API Яндекс Метрики",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
