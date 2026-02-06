'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

type DropdownMenuContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  return <DropdownMenuContext.Provider value={{ open, setOpen }}>{children}</DropdownMenuContext.Provider>;
}

export function DropdownMenuTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) return null;

  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={cn('inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm', className)}
    >
      {children}
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

export function DropdownMenuContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const context = React.useContext(DropdownMenuContext);
  if (!context?.open) return null;

  return <div className={cn('mt-2 min-w-[10rem] rounded-2xl border bg-popover p-1 shadow-md', className)}>{children}</div>;
}

export function DropdownMenuItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('cursor-default rounded-xl px-2 py-1.5 text-sm hover:bg-accent', className)}>{children}</div>;
}
