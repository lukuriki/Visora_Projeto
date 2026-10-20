import "./globals.css";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata = {
  title: "Projeto Base",
  description: "Template base com Next.js, Express e MySQL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", montserrat.variable)}>
      <body>{children}</body>
    </html>
  );
}
