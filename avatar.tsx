import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Plug,
  Calculator,
  ScanLine,
  Lightbulb,
  Settings,
  Zap,
  Gamepad2,
} from "lucide-react";

const navigation = [
  { name: "Painel", href: "/", icon: LayoutDashboard },
  { name: "Aparelhos", href: "/aparelhos", icon: Plug },
  { name: "Simulação", href: "/simulacao", icon: Calculator },
  { name: "Raio-X", href: "/raio-x", icon: ScanLine },
  { name: "Dicas", href: "/dicas", icon: Lightbulb },
  { name: "Jogo", href: "/jogo", icon: Gamepad2 },
  { name: "Config", href: "/configuracoes", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="flex flex-col min-h-screen w-full" style={{ background: "hsl(222 25% 7%)" }}>
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 h-14 border-b border-white/5"
        style={{ background: "hsl(222 28% 5%)" }}
      >
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="relative flex items-center justify-center w-7 h-7">
            <div className="absolute inset-0 rounded-full bg-primary/25 blur-sm" />
            <Zap className="relative h-4 w-4 text-primary energy-flicker" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Eco<span className="text-primary">Volt</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }
                `}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-primary shadow-[0_0_14px_hsl(25_95%_55%/0.45)]" />
                )}
                <item.icon className="relative h-4 w-4" />
                <span className="relative hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
