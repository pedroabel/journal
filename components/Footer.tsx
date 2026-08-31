'use client';

import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function Footer() {
  return (
    <footer className="py-10">
      <Separator className="mb-6" />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <p className="text-muted-foreground text-xs leading-relaxed">
          Fonte única de referência · revisar a cada trimestre · privado, atrás de login
        </p>

        <form action="/api/logout" method="post">
          <Button variant="ghost" size="sm" type="submit">
            <LogOut />
            Sair
          </Button>
        </form>
      </div>
    </footer>
  );
}
