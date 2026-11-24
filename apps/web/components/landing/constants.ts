import { DemoDish, VoiceSample, Testimonial, FaqItem } from "./types";

export const DEMO_DISHES: DemoDish[] = [
  {
    id: "com-tam",
    name: "Cơm Tấm Sườn Bì Chả",
    tag: "Bulking / Giàu Đạm",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=75&w=480&auto=format&fit=crop",
    description:
      "Món ăn đặc sản phổ biến, giàu protein từ sườn nướng cốt lết và chả trứng hấp.",
    components: [
      {
        name: "Cơm tấm trắng",
        defaultGrams: 200,
        calPer100: 130,
        proPer100: 2.7,
        carbPer100: 28.2,
        fatPer100: 0.3,
      },
      {
        name: "Sườn cốt lết nướng",
        defaultGrams: 140,
        calPer100: 242,
        proPer100: 27.3,
        carbPer100: 2.5,
        fatPer100: 14.1,
      },
      {
        name: "Chả trứng hấp",
        defaultGrams: 60,
        calPer100: 185,
        proPer100: 14.2,
        carbPer100: 5.1,
        fatPer100: 12.0,
      },
      {
        name: "Dưa leo & Cà chua",
        defaultGrams: 50,
        calPer100: 18,
        proPer100: 0.9,
        carbPer100: 3.8,
        fatPer100: 0.2,
      },
    ],
  },
  {
    id: "pho-bo",
    name: "Phở Bò Tái Nạm Hà Nội",
    tag: "Phục Hồi Thể Lực",
    image:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=75&w=480&auto=format&fit=crop",
    description:
      "Thịt bò tươi mềm giàu sắt và kẽm, nước dùng thanh hầm từ xương bò tự nhiên.",
    components: [
      {
        name: "Bánh phở tươi",
        defaultGrams: 220,
        calPer100: 140,
        proPer100: 3.2,
        carbPer100: 30.0,
        fatPer100: 0.5,
      },
      {
        name: "Thịt bò tái nạm",
        defaultGrams: 120,
        calPer100: 215,
        proPer100: 26.0,
        carbPer100: 0.0,
        fatPer100: 12.5,
      },
      {
        name: "Nước dùng phở bò",
        defaultGrams: 350,
        calPer100: 35,
        proPer100: 2.8,
        carbPer100: 1.5,
        fatPer100: 2.0,
      },
      {
        name: "Hành tây & Rau thơm",
        defaultGrams: 40,
        calPer100: 25,
        proPer100: 1.2,
        carbPer100: 5.2,
        fatPer100: 0.2,
      },
    ],
  },
  {
    id: "salad-uc-ga",
    name: "Salad Ức Gà & Bơ Sáp",
    tag: "Cutting / Siêu Nạc",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=75&w=480&auto=format&fit=crop",
    description:
      "Khẩu phần siết mỡ tối ưu: ức gà nạc áp chảo, chất béo đơn không bão hòa từ bơ.",
    components: [
      {
        name: "Ức gà phi lê áp chảo",
        defaultGrams: 180,
        calPer100: 165,
        proPer100: 31.0,
        carbPer100: 0.0,
        fatPer100: 3.6,
      },
      {
        name: "Bơ sáp tươi lát",
        defaultGrams: 60,
        calPer100: 160,
        proPer100: 2.0,
        carbPer100: 8.5,
        fatPer100: 14.7,
      },
      {
        name: "Xà lách & Bắp cải tím",
        defaultGrams: 120,
        calPer100: 22,
        proPer100: 1.4,
        carbPer100: 4.3,
        fatPer100: 0.2,
      },
      {
        name: "Dầu dấm chanh ô liu",
        defaultGrams: 15,
        calPer100: 420,
        proPer100: 0.0,
        carbPer100: 3.0,
        fatPer100: 45.0,
      },
    ],
  },
  {
    id: "bun-cha",
    name: "Bún Chả Nướng Than Hoa",
    tag: "Đậm Đà Hương Vị",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=75&w=480&auto=format&fit=crop",
    description:
      "Chả viên nướng và thịt ba chỉ thơm lừng, ăn kèm bún tươi và nước mắm dưa góp.",
    components: [
      {
        name: "Bún tươi",
        defaultGrams: 200,
        calPer100: 110,
        proPer100: 2.0,
        carbPer100: 25.0,
        fatPer100: 0.2,
      },
      {
        name: "Chả nướng viên",
        defaultGrams: 100,
        calPer100: 275,
        proPer100: 18.0,
        carbPer100: 4.5,
        fatPer100: 21.0,
      },
      {
        name: "Thịt ba chỉ nướng",
        defaultGrams: 70,
        calPer100: 310,
        proPer100: 16.5,
        carbPer100: 2.0,
        fatPer100: 27.0,
      },
      {
        name: "Nước chấm & Đu đủ",
        defaultGrams: 120,
        calPer100: 45,
        proPer100: 0.8,
        carbPer100: 10.5,
        fatPer100: 0.1,
      },
    ],
  },
];

export const VOICE_SAMPLES: VoiceSample[] = [
  {
    spoken:
      "Sáng nay ăn 2 quả trứng gà luộc, 1 bát cơm trắng và 1 hộp sữa chua",
    tokens: [
      {
        raw: "2 quả trứng gà luộc",
        parsed: "100g Trứng gà luộc",
        cal: 155,
        p: "13g",
        c: "1.1g",
        f: "11g",
      },
      {
        raw: "1 bát cơm trắng",
        parsed: "150g Cơm trắng",
        cal: 195,
        p: "4g",
        c: "44g",
        f: "0.5g",
      },
      {
        raw: "1 hộp sữa chua",
        parsed: "100g Sữa chua ít đường",
        cal: 70,
        p: "3.5g",
        c: "10g",
        f: "1.8g",
      },
    ],
    totalCal: 420,
    totalP: 20.5,
    totalC: 55.1,
    totalF: 13.3,
  },
  {
    spoken:
      "Trưa ăn nửa chén cơm trắng với 150g ức gà áp chảo và 1 đĩa rau luộc",
    tokens: [
      {
        raw: "nửa chén cơm trắng",
        parsed: "75g Cơm trắng",
        cal: 98,
        p: "2g",
        c: "22g",
        f: "0.2g",
      },
      {
        raw: "150g ức gà áp chảo",
        parsed: "150g Ức gà áp chảo",
        cal: 248,
        p: "46.5g",
        c: "0g",
        f: "5.4g",
      },
      {
        raw: "1 đĩa rau luộc",
        parsed: "200g Bông cải luộc",
        cal: 50,
        p: "3g",
        c: "9g",
        f: "0.4g",
      },
    ],
    totalCal: 396,
    totalP: 51.5,
    totalC: 31.0,
    totalF: 6.0,
  },
  {
    spoken: "Tối ăn 1 tô phở bò tái nạm thêm 1 quả trứng trần",
    tokens: [
      {
        raw: "1 tô phở bò tái nạm",
        parsed: "1 tô Phở bò (500g)",
        cal: 510,
        p: "34g",
        c: "65g",
        f: "12g",
      },
      {
        raw: "1 quả trứng trần",
        parsed: "50g Lòng đỏ trứng trần",
        cal: 78,
        p: "6.5g",
        c: "0.6g",
        f: "5.5g",
      },
    ],
    totalCal: 588,
    totalP: 40.5,
    totalC: 65.6,
    totalF: 17.5,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Nguyễn Minh Tuấn",
    role: "Học viên Gym • Giảm 5kg",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=75&w=96&h=96&auto=format&fit=crop",
    rating: 5,
    quote:
      "Trước đây mỗi bữa ăn là cực hình vì phải cân từng lạng ức gà, khoai lang. Dùng NutriCore chỉ cần giơ máy chụp ảnh đĩa cơm tấm hay phở bò là có ngay macro chuẩn. PT của mình cũng duyệt bữa ăn ngay trong ngày, cực kỳ kỷ luật!",
    tag: "Giảm 8kg • Tăng 2.5kg cơ",
  },
  {
    name: "Coach Trần Hoàng Long",
    role: "Huấn luyện viên PT 1:1 • Quản lý 35 học viên",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=75&w=96&h=96&auto=format&fit=crop",
    rating: 5,
    quote:
      "Tính năng tạo mã QR mời học viên tùy chọn số buổi (12, 16, 24, 36...) và điểm danh trừ buổi tập nguyên tử đã giúp mình tiết kiệm 80% thời gian sổ sách. Học viên ăn gì mình cũng nắm rõ để nhắc nhở kịp thời.",
    tag: "Quản lý 35 học viên 1:1",
  },
  {
    name: "Lê Thu Trang",
    role: "Nhân viên văn phòng • Body Recomp",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=75&w=96&h=96&auto=format&fit=crop",
    rating: 5,
    quote:
      'Mình thích nhất tính năng nhận diện giọng nói tiếng Việt, nói "sáng nay ăn 2 quả trứng với 1 bát cơm" là máy tự hiểu và quy đổi ra gram. Giao diện màu trắng sạch sẽ, mượt mà như app Apple.',
    tag: "Giảm 6kg",
  },

  {
    name: "Đặng Quỳnh Chi",
    role: "Mẹ bỉm phục hồi vóc dáng",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=75&w=96&h=96&auto=format&fit=crop",
    rating: 5,
    quote:
      "Bận rộn chăm con nhỏ không có thời gian tính từng món. Cứ chụp mâm cơm gia đình là hệ thống tự trừ khẩu phần, tính chính xác Calo theo mục tiêu thâm hụt. Vòng eo mình giảm 6cm sau 3 tháng!",
    tag: "Giảm 6cm vòng eo",
  },
];

// ==========================================
// FAQ ITEMS
// ==========================================
export const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Chụp ảnh nhận diện món ăn Việt Nam hoạt động như thế nào?",
    a: "NutriCore sử dụng mô hình thị giác  kết hợp cơ sở dữ liệu ẩm thực Việt Nam phong phú. Khi bạn chụp hoặc tải ảnh đĩa thức ăn, Bạn sẽ nhận diện từng món ăn riêng lẻ, ước lượng trọng lượng gram dựa trên kích thước đĩa và tự động tra cứu chỉ số Calo, Protein, Carbs, Fat.",
  },
  {
    q: "Nếu đĩa cơm thực tế của tôi to hoặc nhỏ hơn ước tính của hệ thống thì sao?",
    a: 'Chúng tôi xây dựng theo quy trình "Human-in-the-loop": Sau khi Hệ thống phân tích xong, ứng dụng luôn hiển thị giao diện xem trước cho phép bạn chạm nhẹ vào nút (+) hoặc (-) để điều chỉnh số gram thực tế theo cảm nhận của bạn trước khi bấm lưu, đảm bảo dữ liệu ghi nhận luôn chuẩn xác 100%.',
  },
  {
    q: "Huấn luyện viên cá nhân kết nối với học viên ra sao?",
    a: "Huấn luyện viên chỉ cần tạo mã QR hoặc gửi liên kết mời học viên (có thể đặt số buổi tập: 12, 16, 24, 36 buổi hoặc số buổi bất kỳ). Học viên quét mã 1 lần duy nhất để liên kết tài khoản. Sau đó, PT có thể theo dõi nhật ký ăn uống, xếp lịch tập và điểm danh trừ buổi tập an toàn qua mã QR.",
  },
  {
    q: "Tôi có thể cài đặt NutriCore lên điện thoại như một ứng dụng bình thường không?",
    a: 'Có! NutriCore hỗ trợ giúp bạn cài đặt trực tiếp từ Safari (iOS) hoặc Chrome (Android) chỉ với 1 chạm "Thêm vào màn hình chính". Ngoài ra, ứng dụng còn có file đóng gói Android APK nguyên bản tối ưu phần cứng camera và micro.',
  },
  {
    q: "Thông tin sức khỏe và hình ảnh vóc dáng của tôi có được bảo mật không?",
    a: "Tuyệt đối an toàn. Mọi dữ liệu chỉ số cơ thể, hình ảnh hành trình InBody đều được mã hóa trước khi gửi lên máy chủ, đồng thời hệ thống tự động ẩn danh hóa email và số điện thoại trong toàn bộ nhật ký truy cập.",
  },
];
