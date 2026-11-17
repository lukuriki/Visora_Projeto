"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/SidebarChat";

export default function Teste() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>

        <header className="flex h-16 items-center gap-2 px-4">
          <SidebarTrigger />
        </header>

        <main className="p-4">
          <h1>My Page Content</h1>
          <p>
            The sidebar should now work without crashing!
          </p>
        </main>

      </SidebarInset>
    </SidebarProvider>
  );
}