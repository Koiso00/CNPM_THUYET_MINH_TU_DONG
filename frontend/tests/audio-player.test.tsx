import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AudioPlayer } from "../src/features/tours/AudioPlayer";

it("attempts autoplay when geofence requests it and reports browser rejection", async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockRejectedValue(
    new DOMException("Not allowed", "NotAllowedError"),
  );
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  const onPlay = vi.fn();

  const view = render(<AudioPlayer src="/audio.mp3" title="Khu A" autoPlayRequestId={1} onPlay={onPlay} />);

  expect(play).toHaveBeenCalledOnce();
  expect(await screen.findByRole("status")).toHaveTextContent(/Trình duyệt đã chặn tự phát/);
  expect(onPlay).not.toHaveBeenCalled();
  view.unmount();
  play.mockRestore();
  pause.mockRestore();
});

it("marks a playback event as automatic when the requested audio starts", async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  const onPlay = vi.fn();
  const view = render(<AudioPlayer src="/audio.mp3" title="Khu A" autoPlayRequestId={7} onPlay={onPlay} />);

  await waitFor(() => expect(play).toHaveBeenCalledOnce());
  fireEvent.play(screen.getByLabelText("Nghe Khu A"));

  expect(onPlay).toHaveBeenCalledWith("automatic");
  view.unmount();
  play.mockRestore();
  pause.mockRestore();
});
