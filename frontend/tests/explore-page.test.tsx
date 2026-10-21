import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { ExplorePage } from "../src/features/tours/ExplorePage";

it("shows all ten supplied locations without presenting GPS as active", () => {
  render(<ExplorePage username="phong" />);

  expect(
    screen.getByRole("heading", { name: "Xin chào, phong" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(10);
  expect(screen.getByText(/Chưa bật định vị GPS/)).toBeInTheDocument();
  expect(screen.getByText(/chưa có tọa độ khảo sát/i)).toBeInTheDocument();
});

it("updates the selected place from the supplied descriptions", async () => {
  const user = userEvent.setup();
  render(<ExplorePage username="phong" />);

  const canteen = screen.getByRole("article", { name: "Căng tin" });
  await user.click(
    within(canteen).getByRole("button", { name: "Xem nội dung" }),
  );

  expect(document.querySelector(".detail-description")).toHaveTextContent(
    "Căng tin nằm ở phía bên phải Khu B",
  );
  expect(screen.getByText("Đang chọn: Căng tin")).toBeInTheDocument();
  expect(
    within(canteen).getByRole("button", { name: "Đang xem địa điểm" }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("does not enable playback before audio is connected to the page", () => {
  render(<ExplorePage username="phong" />);

  expect(
    screen.getByRole("button", { name: /Audio chưa được tích hợp/ }),
  ).toBeDisabled();
  expect(
    screen.getByText(/chưa được xác minh trên sơ đồ hoặc tại thực địa/),
  ).toBeInTheDocument();
});

it("lets the header actions scroll without changing the hash route", async () => {
  const user = userEvent.setup();
  render(<ExplorePage username="phong" />);
  const route = window.location.hash;

  await user.click(screen.getByRole("button", { name: "Xem các địa điểm" }));

  expect(window.location.hash).toBe(route);
});
