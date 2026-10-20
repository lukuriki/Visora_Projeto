import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: "Projeto Base",
  description: "Template base com Next.js, Express e MySQL",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
