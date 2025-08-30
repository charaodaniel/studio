
'use client';

import Link from 'next/link';

const version = "0.0.11";

export function Footer() {
  return (
    <footer className="border-t bg-background/95">
      <div className="container mx-auto flex h-16 items-center justify-center px-4 md:px-6 gap-8 relative">
        <Link href="/docs" passHref>
          <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Termos de Uso
          </span>
        </Link>
        <Link href="/docs" passHref>
             <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Documentação
            </span>
        </Link>
         <div className="absolute bottom-1 right-2 text-xs text-muted-foreground/50">
            v{version}
        </div>
      </div>
    </footer>
  );
}
