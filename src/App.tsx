import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/i18n/I18nProvider";
import Index from "./pages/Index";
import Estudo from "./pages/Estudo";
import CultosAoVivo from "./pages/CultosAoVivo";
import Cantina from "./pages/Cantina";
import Ministerios from "./pages/Ministerios";
import MinisterioDetalhe from "./pages/MinisterioDetalhe";
import Missoes from "./pages/Missoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/estudo" element={<Estudo />} />
              <Route path="/cultos-ao-vivo" element={<CultosAoVivo />} />
              <Route path="/cantina" element={<Cantina />} />
              <Route path="/missoes" element={<Missoes />} />
              <Route path="/ministerios" element={<Ministerios />} />
              <Route path="/ministerios/:slug" element={<MinisterioDetalhe />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
