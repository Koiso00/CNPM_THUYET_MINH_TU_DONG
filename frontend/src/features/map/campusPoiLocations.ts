export function campusPoiMarkerSymbol(title: string): string {
  const campusBlock = title.match(/^Khu ([A-E])$/);
  if (campusBlock) return campusBlock[1];
  if (title === "Căng tin") return "🍴";
  if (title.toLowerCase().includes("klf")) return "📚";
  if (title === "Bãi giữ xe") return "🅿️";
  if (title.toLowerCase().includes("thể thao")) return "⚽";
  return "🏫";
}
