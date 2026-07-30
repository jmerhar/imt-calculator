import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { GlossaryPage } from "@/pages/GlossaryPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        {/* How-it-works page is added next. */}
        <Route path="/how-it-works" element={<GlossaryPage />} />
        <Route path="*" element={<CalculatorPage />} />
      </Routes>
    </Layout>
  );
}
