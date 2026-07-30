import { Routes, Route } from "react-router-dom";

// Route surface for the app. The real pages (calculator, glossary, how-it-works) are
// filled in by later work; this keeps the router shape stable from the first commit.
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Placeholder title="Calculator" />} />
      <Route path="/glossary" element={<Placeholder title="Glossary" />} />
      <Route path="/how-it-works" element={<Placeholder title="How it works" />} />
      <Route path="*" element={<Placeholder title="Not found" />} />
    </Routes>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <main>
      <h1>IMT Calculator</h1>
      <p>{title}</p>
    </main>
  );
}
