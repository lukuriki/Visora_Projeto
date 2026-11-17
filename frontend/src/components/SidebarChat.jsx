"use client";

import { Eye, Plus, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const conversas = ["Matemática", "Português"];

  return (
    <Sidebar className="border-r border-gray-200 bg-white">

      <SidebarHeader className="bg-white p-4">

        <Link
          href="/teste"
          className="flex items-center gap-3 px-2 py-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50">
            <Eye size={22} className="text-emerald-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold tracking-tight text-gray-900">
              Mondini
            </h2>

            <p className="text-xs text-gray-500">
              Sua IA pessoal
            </p>
          </div>
        </Link>

        <Button className="mt-4 h-11 w-full justify-start gap-3 rounded-xl bg-emerald-600 px-4 font-semibold text-white transition hover:bg-emerald-700">
          <Plus size={19} />
          Nova conversa
        </Button>

        <div className="mt-6 px-2">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
            Histórico
          </p>
        </div>

      </SidebarHeader>

      <SidebarContent className="bg-white px-4">

        <div className="flex flex-col gap-1">
          {conversas.map((conversa) => (
            <button
              key={conversa}
              type="button"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              <MessageSquare size={17} />
              <span>{conversa}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-gray-100 py-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-500 transition hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Settings size={18} />
            Configurações
          </button>
        </div>

      </SidebarContent>

    </Sidebar>
  );
}