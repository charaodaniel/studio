import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-background/95">
      <div className="container mx-auto flex h-16 items-center justify-center px-4 md:px-6 gap-8">
        <Link href="#" passHref>
          <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Termos de Uso
          </span>
        </Link>
        <Link href="#" passHref>
          <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            Documentação
          </span>
        </Link>
      </div>
    </footer>
  );
}
