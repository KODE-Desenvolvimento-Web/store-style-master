import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { InventoryProvider } from "@/contexts/InventoryContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import LabelsPage from "./pages/LabelsPage";
import ReaderPage from "./pages/ReaderPage";
import OperationsPage from "./pages/OperationsPage";
import AlertsPage from "./pages/AlertsPage";
import SalesPage from "./pages/SalesPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <InventoryProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/produtos" element={<ProductsPage />} />
              <Route path="/vendas" element={<SalesPage />} />
              <Route path="/historico" element={<SalesHistoryPage />} />
              <Route path="/operacoes" element={<OperationsPage />} />
              <Route path="/etiquetas" element={<LabelsPage />} />
              <Route path="/leitor" element={<ReaderPage />} />
              <Route path="/avisos" element={<AlertsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </InventoryProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
