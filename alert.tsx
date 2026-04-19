import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Dashboard from "@/pages/dashboard";
import Appliances from "@/pages/appliances";
import Simulation from "@/pages/simulation";
import XRay from "@/pages/xray";
import Tips from "@/pages/tips";
import Settings from "@/pages/settings";
import Game from "@/pages/game";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/aparelhos" component={Appliances} />
      <Route path="/simulacao" component={Simulation} />
      <Route path="/raio-x" component={XRay} />
      <Route path="/dicas" component={Tips} />
      <Route path="/configuracoes" component={Settings} />
      <Route path="/jogo" component={Game} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
