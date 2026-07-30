import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import { en } from "@/i18n/en";
import { CalculatorPage } from "@/pages/CalculatorPage";
import { encodeToken } from "@/state/url";
import { defaultInput } from "@/state/defaults";

beforeEach(() => {
  window.history.replaceState(null, "", "#/");
});

afterEach(() => {
  delete window.gtag;
});

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

  it("shows a copyable share link carrying the state token", () => {
    renderPage();
    const link = screen.getByRole("textbox") as HTMLInputElement;
    expect(link.value).toContain("#/?c=");
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

  it("removes an added buyer", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: new RegExp(en.form.addBuyer) }));
    expect(screen.getAllByLabelText(en.form.share)).toHaveLength(2);
    await user.click(screen.getAllByRole("button", { name: new RegExp(en.form.removeBuyer) })[0]);
    expect(screen.getAllByLabelText(en.form.share)).toHaveLength(1);
  });

  it("exercises non-resident, entity, mortgage and reset controls", async () => {
    const user = userEvent.setup();
    renderPage();

    // Non-resident reveals the exception select.
    await user.click(screen.getByRole("button", { name: en.form.residencyNonResident }));
    await user.selectOptions(screen.getByLabelText(en.form.exception), "becomes_resident");
    expect(screen.getByText(en.results.reclaimableNote)).toBeInTheDocument();

    // Entity reveals the tax-haven toggle → flat 10%.
    await user.click(screen.getByRole("button", { name: en.form.typeEntity }));
    await user.click(screen.getByLabelText(en.form.taxHaven));

    // Mortgage on, short-term reveals the months field.
    await user.click(screen.getByLabelText(en.form.mortgageToggle));
    await user.selectOptions(screen.getByLabelText(en.form.mortgageTerm), "lt1");
    expect(screen.getByLabelText(en.form.mortgageMonths)).toBeInTheDocument();

    // Reset returns to the default single-buyer state.
    await user.click(screen.getByRole("button", { name: en.actions.reset }));
    expect(screen.getAllByLabelText(en.form.share)).toHaveLength(1);
  });

  it("emits one debounced calculate event after an edit, not before", () => {
    vi.useFakeTimers();
    try {
      const gtag = vi.fn();
      window.gtag = gtag;
      renderPage();

      // Nothing until the user actually changes something.
      const price = screen.getByLabelText(en.form.price) as HTMLInputElement;
      fireEvent.change(price, { target: { value: "300000" } });
      expect(gtag).not.toHaveBeenCalledWith("event", "calculate", expect.anything());

      // A single event fires once edits settle, carrying coarse (non-identifying) parameters.
      act(() => vi.advanceTimersByTime(1600));
      expect(gtag).toHaveBeenCalledWith(
        "event",
        "calculate",
        expect.objectContaining({ price_band: "250-500k", buyer_count: 1, shares_valid: true }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("reports arriving via a valid shared link", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState(null, "", `#/?c=${encodeToken(defaultInput())}`);
    renderPage();
    expect(gtag).toHaveBeenCalledWith("event", "arrived_via_share", undefined);
  });

  it("reports arriving via a broken shared link", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.history.replaceState(null, "", "#/?c=!!!!");
    renderPage();
    expect(gtag).toHaveBeenCalledWith("event", "bad_share_link", undefined);
  });

  it("tracks a reset", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: en.actions.reset }));
    expect(gtag).toHaveBeenCalledWith("event", "reset", undefined);
  });
});
