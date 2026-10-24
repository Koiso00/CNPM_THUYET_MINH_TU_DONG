export type AppLanguage = "vi" | "en" | "ko";

const STORAGE_KEY = "sgu-campus-guide-language";

export function readLanguage(): AppLanguage {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "en" || value === "ko" ? value : "vi";
  } catch {
    return "vi";
  }
}

export function saveLanguage(language: AppLanguage) {
  try {
    window.localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // The selected language remains available in app state for this session.
  }
}

const messages = {
  vi: {
    skip: "Đến nội dung chính", explore: "Khám phá", mapNav: "Bản đồ khuôn viên", contentNav: "Nội dung thuyết minh", footer: "Khám phá theo cách của bạn", mapLabel: "BẢN ĐỒ KHUÔN VIÊN", mapStatus: "Nền Stadia Maps · cần Internet", manualPoints: "tọa độ do người dùng cung cấp · đã kiểm chứng thực địa", mapSource: "vị trí do người dùng cung cấp",
    language: "Ngôn ngữ", welcome: "Mỗi góc trường,", story: "một câu chuyện.", welcomeLead: "Chậm lại một chút, bật âm thanh và khám phá từng mảng kiến trúc của Đại học Sài Gòn theo một cách hoàn toàn mới.",
    highlights: "Một số điểm nổi bật", place: "ĐỊA ĐIỂM", content: "Nội dung thuyết minh", campus: "KHÔNG GIAN KHUÔN VIÊN", points: "10 điểm đang có", viAudio: "Tiếng Việt · nghe thủ công", listenTitle: "Một khuôn viên. Nhiều điều để nghe.", listenText: "Chọn điểm bất kỳ và bắt đầu hành trình theo nhịp riêng.",
    startEyebrow: "KHỞI ĐẦU HÀNH TRÌNH DI SẢN", welcomeTitle: "Chào mừng bạn đến với SGU Campus Guide", welcomeIntro: "Không cần đăng nhập tài khoản. Bạn có thể tự do khám phá các địa điểm và nghe những bài thuyết minh tiếng Việt.", start: "Bắt đầu cuộc hành trình", benefits: "Tính năng hiện có", manual: "Phát thủ công", free: "Vào tự do", audio: "Audio MP3", online: "Nghe nội dung trực tuyến", tip: "Bạn có thể chọn bất kỳ địa điểm nào trong danh sách sau khi bắt đầu. GPS và offline sẽ được bổ sung ở giai đoạn sau.", admin: "Đăng nhập quản trị",
    hello: "Xin chào", exploreLead: "Xem nội dung giới thiệu các địa điểm trong khuôn viên, chọn nơi bạn muốn tìm hiểu và mở vị trí trên bản đồ.", descriptions: "mô tả địa điểm từ nguồn", mapPlaces: "vị trí trên bản đồ", viewPlaces: "Xem các địa điểm", campusMap: "Sơ đồ khuôn viên", contentLanguage: "Tiếng Việt", selectMap: "Chọn biểu tượng trên bản đồ để xem mô tả", selected: "Đang chọn", mapTitle: "Bản đồ khuôn viên & các điểm thuyết minh", close: "Đóng mô tả", sourceNote: "Mô tả nguồn · tọa độ đã kiểm chứng thực địa", noAudio: "Địa điểm này chưa có audio được công bố.", narration: "NỘI DUNG THUYẾT MINH", placesTitle: "Các khu và nội dung thuyết minh", disclaimer: "Nội dung lấy từ tài liệu bạn cung cấp; tọa độ marker đã được bạn kiểm chứng tại thực địa.", chosen: "Đang chọn địa điểm", listen: "Nghe thuyết minh", view: "Xem nội dung", englishAudioNote: "Bản dịch tiếng Anh hiện là bản nháp; audio đang có là tiếng Việt.", geofenceTitle: "GPS và mô phỏng đều dùng cùng geofence", geofenceText: "GPS chỉ bắt đầu khi bạn nhấn bật; vị trí không gửi lên máy chủ. Mô phỏng được gắn nhãn và không ghi thống kê thật. Geofence thử tự phát audio; nếu trình duyệt chặn, bạn có thể phát thủ công.", blocked: "Trình duyệt đã chặn tự phát. Nhấn nút phát trên trình nghe để tiếp tục.", retry: "Thử lại", loading: "Đang tải địa điểm…", noPublished: "Chưa có nội dung được công bố. Vui lòng quay lại sau.", loadError: "Chưa tải được nội dung. Kiểm tra kết nối và thử lại.", noPlaces: "Chưa có địa điểm.",
  },
  en: {
    skip: "Skip to main content", explore: "Explore", mapNav: "Campus map", contentNav: "Audio guide", footer: "Explore at your own pace", mapLabel: "CAMPUS MAP", mapStatus: "Stadia Maps · Internet required", manualPoints: "user-provided coordinates · field-verified", mapSource: "user-provided locations", language: "Language", welcome: "Every corner of campus,", story: "a story to tell.", welcomeLead: "Slow down, turn on your sound, and discover the architecture of Saigon University in a new way.",
    highlights: "Featured places", place: "PLACE", content: "Audio guide", campus: "CAMPUS SPACE", points: "10 available stops", viAudio: "Vietnamese · tap to play", listenTitle: "One campus. Many stories to hear.", listenText: "Choose a stop and begin exploring at your own pace.",
    startEyebrow: "BEGIN YOUR CAMPUS JOURNEY", welcomeTitle: "Welcome to SGU Campus Guide", welcomeIntro: "No account is needed. Explore the campus and listen to Vietnamese audio guides.", start: "Start your journey", benefits: "Available features", manual: "Tap to play", free: "Open access", audio: "MP3 audio", online: "Listen online", tip: "Choose any stop from the list after you begin. GPS and offline access will be added in a later phase.", admin: "Admin sign in",
    hello: "Hello", exploreLead: "Browse campus stories, choose a place to learn about, and find it on the map.", descriptions: "source descriptions", mapPlaces: "map locations", viewPlaces: "Browse stops", campusMap: "Campus map", contentLanguage: "English", selectMap: "Select a map marker to view its description", selected: "Selected", mapTitle: "Campus map and audio guide stops", close: "Close description", sourceNote: "Source description · coordinates field-verified", noAudio: "No published audio is available for this place.", narration: "AUDIO GUIDE", placesTitle: "Campus areas and audio guides", disclaimer: "Content is based on the materials you provided; you field-verified the marker coordinates.", chosen: "Selected", listen: "Listen to audio guide", view: "View details", englishAudioNote: "English narration is not available for this place yet.", geofenceTitle: "GPS and simulation use the same geofence", geofenceText: "GPS starts only when enabled. Your location is not sent to the server. Simulation is labeled and excluded from real statistics. The geofence may try to play audio automatically; if blocked, tap Play.", blocked: "Your browser blocked autoplay. Press Play in the audio player to continue.", retry: "Try again", loading: "Loading places…", noPublished: "No published content is available yet. Please check back later.", loadError: "Could not load content. Check your connection and try again.", noPlaces: "No places are available.",
  },
  ko: {
    skip: "본문으로 건너뛰기", explore: "둘러보기", mapNav: "캠퍼스 지도", contentNav: "오디오 안내", footer: "나만의 속도로 둘러보기", mapLabel: "캠퍼스 지도", mapStatus: "Stadia Maps · 인터넷 필요", manualPoints: "사용자 제공 좌표 · 현장 확인 완료", descriptions: "개 장소 설명", mapPlaces: "개 지도 위치", mapSource: "사용자 제공 위치", language: "언어", welcome: "캠퍼스의 모든 공간에,", story: "이야기가 있습니다.", welcomeLead: "잠시 여유를 갖고 오디오를 켜서 사이공대학교의 건축 공간을 새롭게 만나보세요.",
    highlights: "추천 장소", place: "장소", content: "오디오 안내", campus: "캠퍼스 공간", points: "이용 가능한 10개 지점", viAudio: "베트남어 · 눌러서 재생", listenTitle: "하나의 캠퍼스, 다양한 이야기.", listenText: "장소를 선택하고 원하는 속도로 둘러보세요.",
    startEyebrow: "캠퍼스 여정 시작", welcomeTitle: "SGU Campus Guide에 오신 것을 환영합니다", welcomeIntro: "계정 없이 캠퍼스를 둘러보고 베트남어 오디오 안내를 들을 수 있습니다.", start: "여정 시작", benefits: "이용 가능한 기능", manual: "눌러서 재생", free: "자유롭게 이용", audio: "MP3 오디오", online: "온라인으로 듣기", tip: "시작한 후 목록에서 원하는 장소를 선택하세요. GPS와 오프라인 기능은 이후 단계에서 추가됩니다.", admin: "관리자 로그인",
    hello: "안녕하세요", exploreLead: "캠퍼스 장소 소개를 살펴보고, 알아보고 싶은 곳을 선택해 지도에서 위치를 확인하세요.", viewPlaces: "장소 보기", campusMap: "캠퍼스 안내도", contentLanguage: "베트남어", selectMap: "지도 아이콘을 선택해 설명을 확인하세요", selected: "선택됨", mapTitle: "캠퍼스 지도 및 오디오 안내 지점", close: "설명 닫기", sourceNote: "제공된 설명 · 현장 확인 좌표", noAudio: "이 장소에는 공개된 오디오가 없습니다.", narration: "오디오 안내", placesTitle: "구역 및 오디오 안내", disclaimer: "콘텐츠는 제공된 자료를 바탕으로 하며, 지도 좌표는 현장에서 확인되었습니다.", chosen: "선택됨", listen: "베트남어 오디오 듣기", view: "내용 보기", englishAudioNote: "영어 번역은 검토용 초안이며, 현재 제공되는 오디오는 베트남어입니다.", geofenceTitle: "GPS와 시뮬레이션은 같은 지오펜스를 사용합니다", geofenceText: "GPS는 직접 켠 경우에만 시작되며 위치는 서버로 전송되지 않습니다. 시뮬레이션은 표시되며 실제 통계에 포함되지 않습니다. 지오펜스가 자동 재생을 시도할 수 있습니다. 차단되면 재생을 누르세요.", blocked: "브라우저가 자동 재생을 차단했습니다. 오디오 플레이어의 재생 버튼을 누르세요.", retry: "다시 시도", loading: "장소를 불러오는 중…", noPublished: "공개된 콘텐츠가 없습니다. 나중에 다시 확인해 주세요.", loadError: "콘텐츠를 불러오지 못했습니다. 연결을 확인하고 다시 시도하세요.", noPlaces: "이용 가능한 장소가 없습니다.",
  },
} satisfies Record<AppLanguage, Record<string, string>>;

export type MessageKey = keyof typeof messages.vi;
export const translate = (language: AppLanguage, key: MessageKey) => messages[language][key];
export const languageNames: Record<AppLanguage, string> = { vi: "Tiếng Việt", en: "English", ko: "한국어" };
