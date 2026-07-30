import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Analytics } from "@/components/Analytics";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { GlossaryPage } from "@/pages/GlossaryPage";
import { HowItWorksPage } from "@/pages/HowItWorksPage";

export function App() {
  return (
    <Layout>
      <Analytics />
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        <Route path="/glossary" element={<GlossaryPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="*" element={<CalculatorPage />} />
      </Routes>
    </Layout>
  );
}
