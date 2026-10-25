import { expect, it } from "vitest";
import { readLanguage, saveLanguage, translate } from "../src/shared/i18n";
import { campusEnglishDraft, getCampusEnglishDraft } from "../src/features/tours/campusEnglishDraft";

it("persists the selected interface language for the next route or visit", () => {
  localStorage.clear();
  expect(readLanguage()).toBe("vi");
  saveLanguage("en");
  expect(readLanguage()).toBe("en");
  saveLanguage("ko");
  expect(readLanguage()).toBe("ko");
});

it("keeps the currently published narration language explicit", () => {
  expect(translate("en", "contentLanguage")).toBe("English");
  expect(translate("ko", "contentLanguage")).toBe("한국어");
  expect(translate("en", "englishAudioNote")).toContain("English narration is not available");
});

it("has draft English text for all ten published POI identifiers", () => {
  expect(Object.keys(campusEnglishDraft)).toHaveLength(10);
  expect(campusEnglishDraft["khu-a"].title).toBe("Zone A");
  expect(campusEnglishDraft["san-the-thao"].description).toContain("basketball court");
  expect(getCampusEnglishDraft("database-id", "Khu A")?.title).toBe("Zone A");
});
