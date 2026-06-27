import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const setTheme = vi.fn();
let currentTheme = "dark";

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: currentTheme, setTheme }),
}));

import { ThemeToggle } from "@/components/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    setTheme.mockClear();
    currentTheme = "dark";
  });

  it("renderiza um botão acessível", () => {
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: /alternar tema/i }),
    ).toBeInTheDocument();
  });

  it("vai para light quando o tema atual é dark", async () => {
    currentTheme = "dark";
    render(<ThemeToggle />);
    await userEvent.click(
      screen.getByRole("button", { name: /alternar tema/i }),
    );
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("vai para dark quando o tema atual é light", async () => {
    currentTheme = "light";
    render(<ThemeToggle />);
    await userEvent.click(
      screen.getByRole("button", { name: /alternar tema/i }),
    );
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
