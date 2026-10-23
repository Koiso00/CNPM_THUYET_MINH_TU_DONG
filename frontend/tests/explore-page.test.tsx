import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ExplorePage } from "../src/features/tours/ExplorePage";
import type { GuestSession } from "../src/features/guest/session";
import { campusPlaces } from "../src/features/tours/campusPlaces";

vi.mock("../src/features/map/CampusMap", () => ({
  CampusMap: ({ places, onSelectPlace }: { places: { location: unknown }[]; onSelectPlace: (id: string) => void }) => (
    <div role="application" aria-label="Bản đồ thử nghiệm">
      <span>{places.filter((place) => place.location).length} marker</span>
      <button type="button" onClick={() => onSelectPlace("cang-tin")}>Chọn marker Căng tin</button>
    </div>
  ),
}));

const places = campusPlaces.map((place) => ({
  ...place,
  source: "Nguồn kiểm thử",
  location: null,
}));
const Page = () => (
  <ExplorePage username="phong" places={places} releaseId="release" />
);

it("shows all ten supplied locations with GPS off until the visitor opts in", () => {
  render(<Page />);

  expect(
    screen.getByRole("heading", { name: "Xin chào, phong" }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("article")).toHaveLength(10);
  expect(screen.getByText(/Tọa độ do người dùng cung cấp · chưa xác minh thực địa/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Bật GPS & tự phát" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Mô phỏng & tự phát" })).toBeInTheDocument();
  expect(screen.getByText(/Chọn biểu tượng trên bản đồ để xem mô tả/)).toBeInTheDocument();
  expect(screen.getByText("10 marker")).toBeInTheDocument();
  expect(screen.getByRole("application", { name: "Bản đồ thử nghiệm" })).toBeInTheDocument();
});

it("uses the same A–E letter markers in the place cards as on the map", () => {
  render(<Page />);

  for (const letter of ["A", "B", "C", "D", "E"]) {
    const card = screen.getByRole("article", { name: `Khu ${letter}` });
    expect(card.querySelector(".poi-number-letter")).toHaveTextContent(letter);
  }
  expect(screen.getByRole("article", { name: "Khu Hiệu bộ" }).querySelector(".poi-number-letter")).toBeNull();
});

it("updates the selected place from the supplied descriptions", async () => {
  const user = userEvent.setup();
  render(<Page />);

  const canteen = screen.getByRole("article", { name: "Căng tin" });
  await user.click(
    within(canteen).getByRole("button", { name: "Xem nội dung" }),
  );

  expect(document.querySelector(".detail-description")).toHaveTextContent(
    "Căng tin nằm ở phía bên phải Khu B",
  );
  expect(
    screen.getByText("Đang chọn: Căng tin"),
  ).toBeInTheDocument();
  expect(
    within(canteen).getByRole("button", { name: "Đang xem địa điểm" }),
  ).toHaveAttribute("aria-pressed", "true");
});

it("selects a place when its map marker is activated", async () => {
  const user = userEvent.setup();
  render(<Page />);

  await user.click(screen.getByRole("button", { name: "Chọn marker Căng tin" }));

  expect(screen.getByText("Đang chọn: Căng tin")).toBeInTheDocument();
  expect(document.querySelector(".detail-description")).toHaveTextContent("Căng tin nằm ở phía bên phải Khu B");
});

it("shows narration in the place cards but keeps map detail and audio hidden until selection", () => {
  render(<Page />);

  expect(document.querySelector(".poi-card-description")).toHaveTextContent("Khu A nằm dọc theo phía trên");
  expect(document.querySelector(".detail-description")).toBeNull();
  expect(screen.queryByText(/chưa có audio được công bố/)).not.toBeInTheDocument();
  expect(screen.getByText(/GPS và mô phỏng đều dùng cùng geofence/)).toBeInTheDocument();
});

it("shows the selected description and audio only after choosing a place", async () => {
  const user = userEvent.setup();
  render(<Page />);
  expect(document.querySelector(".detail-description")).toBeNull();

  await user.click(screen.getByRole("button", { name: "Chọn marker Căng tin" }));

  expect(document.querySelector(".detail-description")).toHaveTextContent("Căng tin nằm ở phía bên phải Khu B");
});

it("uses the simulation controls to confirm a place through the shared geofence and requests autoplay", async () => {
  vi.useFakeTimers();
  const recordAudio = vi.fn();
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
    fireEvent.play(this);
    return Promise.resolve();
  });
  const playablePlaces = places.map((place) => ({ ...place, audio_id: "audio-test" }));
  const view = render(
    <ExplorePage
      username="phong"
      places={playablePlaces}
      releaseId="release"
      guest={{ recordAudio } as unknown as GuestSession}
    />,
  );
  try {
    fireEvent.click(screen.getByRole("button", { name: "Mô phỏng & tự phát" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Đang chờ hai mẫu vị trí hợp lệ/);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(screen.getByRole("status")).toHaveTextContent(/Đã xác nhận gần Khu A/);
    expect(document.querySelector(".detail-place-title")).toHaveTextContent("Khu A");
    expect(screen.getByRole("button", { name: "Dừng định vị" })).toBeInTheDocument();
    expect(play).toHaveBeenCalledOnce();
    expect(recordAudio).not.toHaveBeenCalled();
  } finally {
    view.unmount();
    play.mockRestore();
    vi.useRealTimers();
  }
});

it("lets the header actions scroll without changing the hash route", async () => {
  const user = userEvent.setup();
  render(<Page />);
  const route = window.location.hash;

  await user.click(screen.getByRole("button", { name: "Xem các địa điểm" }));

  expect(window.location.hash).toBe(route);
});
