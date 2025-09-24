import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SparkCreated from "@/pages/spark-created";
import Connected from "@/pages/connected";
import Synchronized from "@/pages/synchronized";

/**
 * The main router component for the application.
 * It defines all the possible routes and the components they render.
 * @returns {JSX.Element} The rendered router component.
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/spark/:sparkId">
        {(params) => <SparkCreated sparkId={params.sparkId} />}
      </Route>
      <Route path="/s/:sparkId">
        {(params) => <Connected sparkId={params.sparkId} />}
      </Route>
      <Route path="/sync/:sparkId">
        {(params) => <Synchronized sparkId={params.sparkId} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * The main component of the application.
 * It sets up the context providers for React Query and tooltips,
 * and renders the main layout and router.
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-dark-900 firefly-bg">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
