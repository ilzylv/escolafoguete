import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import VideoAulas from "./pages/VideoAulas";
import VerificacaoEstrutural from "./pages/VerificacaoEstrutural";
import DesignTubeiras from "./pages/DesignTubeiras";
import Performance from "./pages/Performance";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

function Navigation() {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/", label: "Início" },
    { path: "/video-aulas", label: "Vídeo-Aulas" },
    { path: "/verificacao", label: "Verificação Estrutural" },
    { path: "/tubeiras", label: "Design de Tubeiras" },
    { path: "/performance", label: "Performance" },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-8">
          <Rocket className="h-6 w-6" />
          <span className="font-bold text-xl">Rocket Engineering</span>
        </div>
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <Button
                variant={location === item.path ? "default" : "ghost"}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/video-aulas"} component={VideoAulas} />
        <Route path={"/verificacao"} component={VerificacaoEstrutural} />
        <Route path={"/tubeiras"} component={DesignTubeiras} />
        <Route path={"/performance"} component={Performance} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
