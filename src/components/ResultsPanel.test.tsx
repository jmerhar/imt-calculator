import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nProvider } from "@/i18n";
import { en } from "@/i18n/en";
import { calculate } from "@/engine/imt";
import { defaultInput } from "@/state/defaults";
import { ResultsPanel } from "@/components/ResultsPanel";
import type { CalcInput } from "@/engine/types";

function setup(input: CalcInput) {
  render(
    <I18nProvider>
      <ResultsPanel input={input} result={calculate(input)} onReset={() => {}} />
    </I18nProvider>,
  );
}

describe("ResultsPanel", () => {
  let writeText: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    delete window.gtag;
  });

  it("shows a per-buyer breakdown with rule tags and a reclaimable amount", () => {
    setup({
      ...defaultInput(),
      price: 400000,
      intendedUse: "secondary",
      buyers: [
        { share: 0.5, type: "individual", taxHaven: false, residency: "non_resident", exception: "becomes_resident", jovem: false },
        { share: 0.5, type: "entity", taxHaven: true, residency: "resident", exception: "none", jovem: false },
      ],
    });
    expect(screen.getByText(en.results.perBuyer)).toBeInTheDocument();
    expect(screen.getByText(en.results.ruleNonResident)).toBeInTheDocument();
    expect(screen.getByText(en.results.ruleTaxHaven)).toBeInTheDocument();
    expect(screen.getByText(en.results.reclaimableNote)).toBeInTheDocument();
    expect(screen.getByText(/Reclaimable later/)).toBeInTheDocument();
  });

  it("copies the share link and the result summary", async () => {
    setup(defaultInput());

    fireEvent.click(screen.getByRole("button", { name: en.actions.copyLink }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("calc-imt.online/?c="));
    expect(await screen.findByText(en.actions.linkCopied)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: en.actions.copy }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining(en.results.totalDue));
    expect(await screen.findByText(en.actions.copied)).toBeInTheDocument();
  });

  it("silently ignores a clipboard failure", async () => {
    writeText.mockRejectedValue(new Error("blocked"));
    setup(defaultInput());
    fireEvent.click(screen.getByRole("button", { name: en.actions.copyLink }));
    expect(writeText).toHaveBeenCalled();
    expect(screen.queryByText(en.actions.linkCopied)).not.toBeInTheDocument();
  });

  it("tracks share, copy and print actions", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    setup(defaultInput());

    fireEvent.click(screen.getByRole("button", { name: en.actions.copyLink }));
    fireEvent.click(screen.getByRole("button", { name: en.actions.copy }));
    fireEvent.click(screen.getByRole("button", { name: en.actions.print }));

    expect(gtag).toHaveBeenCalledWith("event", "share_link", undefined);
    expect(gtag).toHaveBeenCalledWith("event", "copy_result", undefined);
    expect(gtag).toHaveBeenCalledWith("event", "print", undefined);
    expect(print).toHaveBeenCalled();
    print.mockRestore();
  });
});
