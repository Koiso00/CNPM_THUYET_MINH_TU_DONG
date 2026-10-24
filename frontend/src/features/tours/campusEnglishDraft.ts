export const campusEnglishDraft: Record<string, { title: string; description: string }> = {
  "khu-a": {
    title: "Zone A",
    description: "Zone A runs along the upper edge of the campus and spans almost the full width of the map. From the central area, head toward the top of the map to reach Zone A. It is near the side gate on Nguyen Trai Street and is fairly easy to recognize. This is one of the campus building areas and is used for activities according to the functions assigned to it.",
  },
  "khu-b": {
    title: "Zone B",
    description: "Zone B is below Zone A and above Zone C. On the map, it consists of two rows of buildings on either side of the central open space. When walking farther into campus from the main gate, you can use Zone C as a reference point to identify Zone B just above it. This is one of the important areas in the university's building complex.",
  },
  "khu-c": {
    title: "Zone C",
    description: "Zone C is in the middle and lower part of the campus, directly below Zone B. Like Zone B, it consists of two rows of buildings facing each other across the central walkway. From here, you can go to the Administrative Office Area or continue to other parts of campus. When you arrive at Zone C, check the directional signs to find the right classroom.",
  },
  "khu-d": {
    title: "Zone D",
    description: "Zone D is in the lower-right part of the campus map. Enter through the main gate at 273 An Duong Vuong Street and head to the right to find it. Zone D is near a walkway connecting to other buildings and is not far from the sports area. This is one of the campus building areas, used for activities according to the university's layout.",
  },
  "khu-e": {
    title: "Zone E",
    description: "Zone E is in the upper-right corner of the map, near the side gate on Nguyen Trai Street. The parking area is just below it, making the location easier to identify. Zone E is set apart from the main buildings in the center of campus. To find it, use the side gate and parking area as landmarks.",
  },
  "khu-hieu-bo": {
    title: "Administrative Office Area",
    description: "The Administrative Office Area is on the left as you enter campus through the main gate on 273 An Duong Vuong Street. It is associated with the university's management, operations, and administrative work. Students can come here for administrative procedures, following the instructions provided. Please keep noise to a minimum and follow the rules in this workplace.",
  },
  "khu-klf-tu-hoc": {
    title: "KLF Area and Self-Study Area",
    description: "The KLF Area is on the left side of campus, between Zones B and C. On the map, it is near the areas marked for self-study. Students can come here to study and review after class, subject to the rules in effect. Please keep quiet, take care of shared property, and keep the area clean.",
  },
  "cang-tin": {
    title: "Cafeteria",
    description: "The cafeteria is to the right of Zone B, near the center of campus and to the left of the sports area. It serves food and drinks and provides a place for students to take a break during the school day. After a busy class, you can come here for a meal or to relax before your next class. Please queue and keep the area clean.",
  },
  "bai-giu-xe": {
    title: "Parking Area",
    description: "The parking area runs along the right side of campus, just below Zone E and near the side gate on Nguyen Trai Street. Students and lecturers park their vehicles here when they come to campus. Follow the staff's instructions, park in the designated space, and keep your parking ticket safe. Parking neatly helps keep entry and exit safe and convenient.",
  },
  "san-the-thao": {
    title: "Sports Facilities",
    description: "The sports facilities are on the right side of campus, near the parking area and below Zone E. According to the map, they include a basketball court, badminton court, football (soccer) field, and table-tennis building. This is a place for students to stay active, relax after class, and take part in group sports. Please follow the rules, take care, and look after the shared facilities.",
  },
};

const vietnameseTitleToId: Record<string, string> = {
  "Khu A": "khu-a",
  "Khu B": "khu-b",
  "Khu C": "khu-c",
  "Khu D": "khu-d",
  "Khu E": "khu-e",
  "Khu Hiệu bộ": "khu-hieu-bo",
  "Khu KLF và khu tự học": "khu-klf-tu-hoc",
  "Căng tin": "cang-tin",
  "Bãi giữ xe": "bai-giu-xe",
  "Khu sân thể thao": "san-the-thao",
};

export function getCampusEnglishDraft(id: string, vietnameseTitle: string) {
  return campusEnglishDraft[id] ?? campusEnglishDraft[vietnameseTitleToId[vietnameseTitle] ?? ""];
}
