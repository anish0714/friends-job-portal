import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { StoreProvider } from "../store/StoreProvider";
import { seedState, STORE_KEY } from "../store/storage";

function setup() {
  const user = userEvent.setup();
  render(
    <StoreProvider initialState={seedState()}>
      <App />
    </StoreProvider>,
  );
  const cards = () => within(screen.getByRole("region", { name: "Jobs" })).queryAllByRole("article");
  return { user, cards };
}

describe("App filtering and search", () => {
  it("shows all 30 seed jobs", () => {
    const { cards } = setup();
    expect(cards()).toHaveLength(30);
    expect(screen.getByText(/Showing 30 of 30/)).toBeInTheDocument();
  });

  it("combines search, match chips and hide-applied", async () => {
    const { user, cards } = setup();

    await user.type(screen.getByRole("searchbox", { name: "Search jobs" }), "citi");
    expect(cards()).toHaveLength(3); // 1 Strong + 2 Good at Citi

    await user.click(screen.getByRole("button", { name: "Good" }));
    expect(screen.getByRole("button", { name: "Good" })).toHaveAttribute("aria-pressed", "false");
    expect(cards()).toHaveLength(1);

    const card = cards()[0];
    await user.selectOptions(within(card).getByLabelText("Status"), "Interview");
    await user.click(screen.getByRole("checkbox", { name: "Hide applied" }));
    expect(cards()).toHaveLength(0);
    expect(screen.getByText(/No jobs here yet/)).toBeInTheDocument();
  });

  it("searches the fit and gaps notes too", async () => {
    const { user, cards } = setup();
    await user.type(screen.getByRole("searchbox", { name: "Search jobs" }), "hybris");
    expect(cards().map(c => c.getAttribute("aria-label"))).toEqual(["Commerce Functional Lead at Accenture"]);
  });

  it("adds a job from a pasted LinkedIn URL and saves to localStorage", async () => {
    const { user, cards } = setup();
    await user.click(screen.getByRole("button", { name: "+ Add job" }));
    const dialog = screen.getByRole("dialog");
    await user.type(within(dialog).getByLabelText("Job link"), "https://www.linkedin.com/jobs/view/9999999999/?trk=abc");
    await user.type(within(dialog).getByLabelText("Job title*"), "Platform Engineer");
    await user.type(within(dialog).getByLabelText("Company*"), "Example Co");
    await user.click(within(dialog).getByRole("button", { name: "Add job" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(cards()).toHaveLength(31);
    const saved = JSON.parse(localStorage.getItem(STORE_KEY)!);
    const job = saved.friends[0].jobs.find((j: { title: string }) => j.title === "Platform Engineer");
    expect(job).toMatchObject({ id: "9999999999", url: "https://www.linkedin.com/jobs/view/9999999999" });
  });

  it("closes a modal with Escape", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    expect(screen.getByRole("dialog", { name: "Edit profile" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
