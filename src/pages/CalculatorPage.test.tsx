import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import { en } from "@/i18n/en";
import { CalculatorPage } from "@/pages/CalculatorPage";

function renderPage() {
  return render(
    <I18nProvider>
      <CalculatorPage />
    </I18nProvider>,
  );
}

describe("CalculatorPage", () => {
  it("shows a computed total for the default inputs", () => {
    const { container } = renderPage();
    // Default: own permanent home, mainland, €250 000, one resident → IMT 7 042.04 + IS 2 000.
    expect(container.textContent).toContain("9,042.04");
  });

  it("adds a second buyer and reveals the per-buyer breakdown", async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.queryByText(en.results.perBuyer)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: new RegExp(en.form.addBuyer) }));
    expect(screen.getByText(en.results.perBuyer)).toBeInTheDocument();
    // Two buyer cards now, each with its own Share field.
    expect(screen.getAllByLabelText(en.form.share)).toHaveLength(2);
  });
});
