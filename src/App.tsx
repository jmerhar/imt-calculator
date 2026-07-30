import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { CalculatorPage } from "@/pages/CalculatorPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CalculatorPage />} />
        {/* Glossary and How-it-works pages are added in later work. */}
        <Route path="/glossary" element={<Placeholder title="Glossary" />} />
        <Route path="/how-it-works" element={<Placeholder title="How it works" />} />
        <Route path="*" element={<CalculatorPage />} />
      </Routes>
    </Layout>
  );
}

function Placeholder({ title }: { title: string }) {
  return <p>{title}</p>;
}
