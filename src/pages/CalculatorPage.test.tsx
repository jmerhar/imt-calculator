import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { I18nProvider } from "@/i18n";
import { en } from "@/i18n/en";
import { CalculatorPage } from "@/pages/CalculatorPage";

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

      // A single event fires once edits settle, carrying both bands and exact aggregate figures.
      // Default own-permanent mainland at €300k → Table I: IMT 10 542.04 + IS 2 400 = 12 942.04.
      act(() => vi.advanceTimersByTime(1600));
      expect(gtag).toHaveBeenCalledWith(
        "event",
        "calculate",
        expect.objectContaining({
          price_band: "250-500k",
          buyer_count: 1,
          shares_valid: true,
          vpt_ratio_band: "none",
          price: 300000,
          tax_base: 300000,
          imt: 10542.04,
          stamp_duty: 2400,
          grand_total: 12942.04,
          effective_rate: 4.31,
        }),
      );

      // With no VPT entered, the VPT figures are omitted (so they never skew averages).
      const params = gtag.mock.calls.find((c) => c[1] === "calculate")?.[2] as Record<string, unknown>;
      expect(params).not.toHaveProperty("vpt");
      expect(params).not.toHaveProperty("vpt_ratio");
    } finally {
      vi.useRealTimers();
    }
  });

  it("sends the VPT ratio band and numeric ratio when a VPT is entered", () => {
    vi.useFakeTimers();
    try {
      const gtag = vi.fn();
      window.gtag = gtag;
      renderPage();
      fireEvent.change(screen.getByLabelText(en.form.price), { target: { value: "300000" } });
      fireEvent.change(screen.getByLabelText(en.form.vpt, { exact: false }), {
        target: { value: "240000" },
      });
      act(() => vi.advanceTimersByTime(1600));
      const calls = gtag.mock.calls.filter((c) => c[1] === "calculate");
      const params = calls[calls.length - 1][2] as Record<string, unknown>;
      // 240k / 300k = 0.80 → band "80-90%", numeric ratio 80, raw VPT 240 000.
      expect(params).toMatchObject({
        has_vpt: true,
        vpt_ratio_band: "80-90%",
        vpt_ratio: 80,
        vpt: 240000,
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks a reset", async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: en.actions.reset }));
    expect(gtag).toHaveBeenCalledWith("event", "reset", undefined);
  });

  it("clamps out-of-range field input to [min, max]", () => {
    renderPage();
    // Negative price clamps to the min (0) so the share link never breaks.
    const price = screen.getByLabelText(en.form.price) as HTMLInputElement;
    fireEvent.change(price, { target: { value: "-5" } });
    expect(price.value).toBe("0");
    // A share above 100% clamps to the max.
    const share = screen.getByLabelText(en.form.share) as HTMLInputElement;
    fireEvent.change(share, { target: { value: "150" } });
    expect(share.value).toBe("100");
  });

  it("clears the non-resident exception when a buyer switches back to resident", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: en.form.residencyNonResident }));
    await user.selectOptions(screen.getByLabelText(en.form.exception), "becomes_resident");
    await user.click(screen.getByRole("button", { name: en.form.residencyResident }));
    // Returning to non-resident must show the default exception, not the stale earlier choice.
    await user.click(screen.getByRole("button", { name: en.form.residencyNonResident }));
    expect((screen.getByLabelText(en.form.exception) as HTMLSelectElement).value).toBe("none");
  });
});
