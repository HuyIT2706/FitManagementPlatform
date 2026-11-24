/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Mic,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Star,
  Plus,
  Minus,
  Menu,
  X,
} from 'lucide-react';

// ==========================================
// DEMO DISHES FOR CAL AI VISION SCANNER
// ==========================================
interface FoodComponent {
  name: string;
  defaultGrams: number;
  calPer100: number;
  proPer100: number;
  carbPer100: number;
  fatPer100: number;
}

interface DemoDish {
  id: string;
  name: string;
  tag: string;
  image: string;
  description: string;
  components: FoodComponent[];
}

const DEMO_DISHES: DemoDish[] = [
  {
    id: 'com-tam',
    name: 'Cơm Tấm Sườn Bì Chả',
    tag: 'Bulking / Giàu Đạm',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=75&w=480&auto=format&fit=crop',
    description: 'Món ăn đặc sản phổ biến, giàu protein từ sườn nướng cốt lết và chả trứng hấp.',
    components: [
      { name: 'Cơm tấm trắng', defaultGrams: 200, calPer100: 130, proPer100: 2.7, carbPer100: 28.2, fatPer100: 0.3 },
      { name: 'Sườn cốt lết nướng', defaultGrams: 140, calPer100: 242, proPer100: 27.3, carbPer100: 2.5, fatPer100: 14.1 },
      { name: 'Chả trứng hấp', defaultGrams: 60, calPer100: 185, proPer100: 14.2, carbPer100: 5.1, fatPer100: 12.0 },
      { name: 'Dưa leo & Cà chua', defaultGrams: 50, calPer100: 18, proPer100: 0.9, carbPer100: 3.8, fatPer100: 0.2 },
    ],
  },
  {
    id: 'pho-bo',
    name: 'Phở Bò Tái Nạm Hà Nội',
    tag: 'Phục Hồi Thể Lực',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=75&w=480&auto=format&fit=crop',
    description: 'Thịt bò tươi mềm giàu sắt và kẽm, nước dùng thanh hầm từ xương bò tự nhiên.',
    components: [
      { name: 'Bánh phở tươi', defaultGrams: 220, calPer100: 140, proPer100: 3.2, carbPer100: 30.0, fatPer100: 0.5 },
      { name: 'Thịt bò tái nạm', defaultGrams: 120, calPer100: 215, proPer100: 26.0, carbPer100: 0.0, fatPer100: 12.5 },
      { name: 'Nước dùng phở bò', defaultGrams: 350, calPer100: 35, proPer100: 2.8, carbPer100: 1.5, fatPer100: 2.0 },
      { name: 'Hành tây & Rau thơm', defaultGrams: 40, calPer100: 25, proPer100: 1.2, carbPer100: 5.2, fatPer100: 0.2 },
    ],
  },
  {
    id: 'salad-uc-ga',
    name: 'Salad Ức Gà & Bơ Sáp',
    tag: 'Cutting / Siêu Nạc',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=75&w=480&auto=format&fit=crop',
    description: 'Khẩu phần siết mỡ tối ưu: ức gà nạc áp chảo, chất béo đơn không bão hòa từ bơ.',
    components: [
      { name: 'Ức gà phi lê áp chảo', defaultGrams: 180, calPer100: 165, proPer100: 31.0, carbPer100: 0.0, fatPer100: 3.6 },
      { name: 'Bơ sáp tươi lát', defaultGrams: 60, calPer100: 160, proPer100: 2.0, carbPer100: 8.5, fatPer100: 14.7 },
      { name: 'Xà lách & Bắp cải tím', defaultGrams: 120, calPer100: 22, proPer100: 1.4, carbPer100: 4.3, fatPer100: 0.2 },
      { name: 'Dầu dấm chanh ô liu', defaultGrams: 15, calPer100: 420, proPer100: 0.0, carbPer100: 3.0, fatPer100: 45.0 },
    ],
  },
  {
    id: 'bun-cha',
    name: 'Bún Chả Nướng Than Hoa',
    tag: 'Đậm Đà Hương Vị',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=75&w=480&auto=format&fit=crop',
    description: 'Chả viên nướng và thịt ba chỉ thơm lừng, ăn kèm bún tươi và nước mắm dưa góp.',
    components: [
      { name: 'Bún tươi', defaultGrams: 200, calPer100: 110, proPer100: 2.0, carbPer100: 25.0, fatPer100: 0.2 },
      { name: 'Chả nướng viên', defaultGrams: 100, calPer100: 275, proPer100: 18.0, carbPer100: 4.5, fatPer100: 21.0 },
      { name: 'Thịt ba chỉ nướng', defaultGrams: 70, calPer100: 310, proPer100: 16.5, carbPer100: 2.0, fatPer100: 27.0 },
      { name: 'Nước chấm & Đu đủ', defaultGrams: 120, calPer100: 45, proPer100: 0.8, carbPer100: 10.5, fatPer100: 0.1 },
    ],
  },
];

// ==========================================
// VOICE & TEXT NLP SAMPLES
// ==========================================
const VOICE_SAMPLES = [
  {
    spoken: 'Sáng nay ăn 2 quả trứng gà luộc, 1 bát cơm trắng và 1 hộp sữa chua',
    tokens: [
      { raw: '2 quả trứng gà luộc', parsed: '100g Trứng gà luộc', cal: 155, p: '13g', c: '1.1g', f: '11g' },
      { raw: '1 bát cơm trắng', parsed: '150g Cơm trắng', cal: 195, p: '4g', c: '44g', f: '0.5g' },
      { raw: '1 hộp sữa chua', parsed: '100g Sữa chua ít đường', cal: 70, p: '3.5g', c: '10g', f: '1.8g' },
    ],
    totalCal: 420,
    totalP: 20.5,
    totalC: 55.1,
    totalF: 13.3,
  },
  {
    spoken: 'Trưa ăn nửa chén cơm trắng với 150g ức gà áp chảo và 1 đĩa rau luộc',
    tokens: [
      { raw: 'nửa chén cơm trắng', parsed: '75g Cơm trắng', cal: 98, p: '2g', c: '22g', f: '0.2g' },
      { raw: '150g ức gà áp chảo', parsed: '150g Ức gà áp chảo', cal: 248, p: '46.5g', c: '0g', f: '5.4g' },
      { raw: '1 đĩa rau luộc', parsed: '200g Bông cải luộc', cal: 50, p: '3g', c: '9g', f: '0.4g' },
    ],
    totalCal: 396,
    totalP: 51.5,
    totalC: 31.0,
    totalF: 6.0,
  },
  {
    spoken: 'Tối ăn 1 tô phở bò tái nạm thêm 1 quả trứng trần',
    tokens: [
      { raw: '1 tô phở bò tái nạm', parsed: '1 tô Phở bò (500g)', cal: 510, p: '34g', c: '65g', f: '12g' },
      { raw: '1 quả trứng trần', parsed: '50g Lòng đỏ trứng trần', cal: 78, p: '6.5g', c: '0.6g', f: '5.5g' },
    ],
    totalCal: 588,
    totalP: 40.5,
    totalC: 65.6,
    totalF: 17.5,
  },
];

// ==========================================
// TESTIMONIALS / USER REVIEWS SAMPLES
// ==========================================
const TESTIMONIALS = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Học viên Gym • Giảm 8kg mỡ',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=75&w=96&h=96&auto=format&fit=crop',
    rating: 5,
    quote:
      'Trước đây mỗi bữa ăn là cực hình vì phải cân từng lạng ức gà, khoai lang. Dùng NutriCore chỉ cần giơ máy chụp ảnh đĩa cơm tấm hay phở bò là có ngay macro chuẩn. PT của mình cũng duyệt bữa ăn ngay trong ngày, cực kỳ kỷ luật!',
    tag: 'Giảm 8kg • Tăng 2.5kg cơ',
  },
  {
    name: 'Coach Trần Hoàng Long',
    role: 'Huấn luyện viên PT 1:1 • Quản lý 35 học viên',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=75&w=96&h=96&auto=format&fit=crop',
    rating: 5,
    quote:
      'Tính năng tạo mã QR mời học viên tùy chọn số buổi (12, 16, 24, 36...) và điểm danh trừ buổi tập nguyên tử đã giúp mình tiết kiệm 80% thời gian sổ sách. Học viên ăn gì mình cũng nắm rõ để nhắc nhở kịp thời.',
    tag: 'Quản lý 35 học viên 1:1',
  },
  {
    name: 'Lê Thu Trang',
    role: 'Nhân viên văn phòng • Body Recomp',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=75&w=96&h=96&auto=format&fit=crop',
    rating: 5,
    quote:
      'Mình thích nhất tính năng nhận diện giọng nói tiếng Việt, nói "sáng nay ăn 2 quả trứng với 1 bát cơm" là máy tự hiểu và quy đổi ra gram. Giao diện màu trắng sạch sẽ, mượt mà như app Apple.',
    tag: 'Giảm 4% Body Fat',
  },
  {
    name: 'Phạm Đức Anh',
    role: 'Vận động viên Thể hình tự nhiên',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=75&w=96&h=96&auto=format&fit=crop',
    rating: 5,
    quote:
      'Biểu đồ InBody dạng Stock Chart và thanh trượt so sánh Before/After rất chuyên nghiệp. Dữ liệu mã hóa an toàn giúp mình yên tâm lưu trữ toàn bộ hành trình siết cân.',
    tag: 'Chuẩn bị thi đấu',
  },
  {
    name: 'Đặng Quỳnh Chi',
    role: 'Mẹ bỉm phục hồi vóc dáng',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=75&w=96&h=96&auto=format&fit=crop',
    rating: 5,
    quote:
      'Bận rộn chăm con nhỏ không có thời gian gõ từng món. Cứ chụp mâm cơm gia đình là AI tự trừ khẩu phần, tính chính xác Calo theo mục tiêu thâm hụt. Vòng eo mình giảm 6cm sau 2 tháng!',
    tag: 'Giảm 6cm vòng eo',
  },
  {
    name: 'Coach Nguyễn Hùng',
    role: 'Fitness Club Manager • Hà Nội',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=75&w=96&h=96&auto=format&fit=crop',
    rating: 5,
    quote:
      'Toàn bộ đội ngũ 12 HLV của phòng gym chúng tôi đều chuyển sang quản lý học viên trên NutriCore. Tỷ lệ học viên tái ký hợp đồng tăng 40% nhờ tính minh bạch và chuyên nghiệp vượt trội.',
    tag: 'Đội ngũ 12 HLV chuyên nghiệp',
  },
];

// ==========================================
// FAQ ITEMS
// ==========================================
const FAQ_ITEMS = [
  {
    q: 'AI nhận diện món ăn Việt Nam hoạt động như thế nào?',
    a: 'NutriCore sử dụng mô hình thị giác Google Gemini Vision AI kết hợp cơ sở dữ liệu ẩm thực Việt Nam phong phú. Khi bạn chụp hoặc tải ảnh đĩa thức ăn, AI sẽ nhận diện từng món ăn riêng lẻ, ước lượng trọng lượng gram dựa trên kích thước đĩa và tự động tra cứu chỉ số Calo, Protein, Carbs, Fat.',
  },
  {
    q: 'Nếu đĩa cơm thực tế của tôi to hoặc nhỏ hơn ước tính của AI thì sao?',
    a: 'Chúng tôi xây dựng theo quy trình "Human-in-the-loop": Sau khi AI phân tích xong, ứng dụng luôn hiển thị giao diện xem trước cho phép bạn chạm nhẹ vào nút (+) hoặc (-) để điều chỉnh số gram thực tế theo cảm nhận của bạn trước khi bấm lưu, đảm bảo dữ liệu ghi nhận luôn chuẩn xác 100%.',
  },
  {
    q: 'Huấn luyện viên cá nhân  kết nối với học viên ra sao?',
    a: 'Huấn luyện viên chỉ cần tạo mã QR hoặc gửi liên kết mời học viên (có thể đặt số buổi tập: 12, 16, 24, 36 buổi hoặc số buổi bất kỳ). Học viên quét mã 1 lần duy nhất để liên kết tài khoản. Sau đó, PT có thể theo dõi nhật ký ăn uống, xếp lịch tập và điểm danh trừ buổi tập an toàn qua mã QR.',
  },
  {
    q: 'Tôi có thể cài đặt NutriCore lên điện thoại như một ứng dụng bình thường không?',
    a: 'Có! NutriCore hỗ trợ công nghệ Progressive Web App (PWA) giúp bạn cài đặt trực tiếp từ Safari (iOS) hoặc Chrome (Android) chỉ với 1 chạm "Thêm vào màn hình chính", có hỗ trợ thông báo đẩy (Web Push). Ngoài ra, ứng dụng còn có file đóng gói Android APK nguyên bản tối ưu phần cứng camera và micro.',
  },
  {
    q: 'Thông tin sức khỏe và hình ảnh vóc dáng của tôi có được bảo mật không?',
    a: 'Tuyệt đối an toàn. Mọi dữ liệu chỉ số cơ thể, hình ảnh hành trình InBody đều được mã hóa đầu cuối (End-to-End Encryption) bằng thuật toán chuẩn quân đội AES-256-GCM trước khi gửi lên máy chủ, đồng thời hệ thống tự động ẩn danh hóa (masking) email và số điện thoại trong toàn bộ nhật ký truy cập.',
  },
];

// ==========================================
// 3D INTERACTIVE TILT CARD WITH SPECULAR SPOTLIGHT
// ==========================================
interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
}

function TiltCard3D({
  children,
  className = '',
  maxTilt = 7,
  glowColor = 'rgba(16, 185, 129, 0.08)',
}: TiltCard3DProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<string>(
    'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`
    );
    setGlowPos({
      x: Math.round((x / rect.width) * 100),
      y: Math.round((y / rect.height) * 100),
      opacity: 1,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlowPos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden transition-all duration-200 ease-out ${className}`}
      style={{
        transform,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {/* Specular Spotlight Glow Following Mouse */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-1"
        style={{
          opacity: glowPos.opacity,
          background: `radial-gradient(circle 300px at ${glowPos.x}% ${glowPos.y}%, ${glowColor}, transparent 70%)`,
        }}
      />
      {children}
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [demoMode, setDemoMode] = useState<'vision' | 'voice'>('vision');
  const [selectedDishIdx, setSelectedDishIdx] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [activeVoiceIdx, setActiveVoiceIdx] = useState(0);
  const [activeRoleTab, setActiveRoleTab] = useState<'student' | 'pt' | 'admin'>('student');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Dynamic grams adjuster for interactive sandbox
  const [gramAdjustments, setGramAdjustments] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      setIsLoggedIn(Boolean(token));
    }
  }, []);

  // Trigger smooth scanning animation when dish changes
  const handleSelectDish = (idx: number) => {
    setSelectedDishIdx(idx);
    setGramAdjustments({});
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 800);
    return () => clearTimeout(timer);
  };

  const currentDish = DEMO_DISHES[selectedDishIdx];

  // Calculate dynamic totals with strict 1-decimal rounding to avoid floating-point artifacts like 73.39999999999999
  const computedDishTotals = useMemo(() => {
    const raw = (currentDish?.components || []).reduce(
      (acc, comp, i) => {
        const factor = (gramAdjustments[i] ?? comp.defaultGrams) / 100;
        return {
          cal: acc.cal + Math.round(comp.calPer100 * factor),
          pro: acc.pro + comp.proPer100 * factor,
          carb: acc.carb + comp.carbPer100 * factor,
          fat: acc.fat + comp.fatPer100 * factor,
        };
      },
      { cal: 0, pro: 0, carb: 0, fat: 0 }
    );
    return {
      cal: Math.round(raw.cal),
      pro: Math.round(raw.pro * 10) / 10,
      carb: Math.round(raw.carb * 10) / 10,
      fat: Math.round(raw.fat * 10) / 10,
    };
  }, [currentDish, gramAdjustments]);

  const handleAdjustGram = (compIdx: number, delta: number) => {
    const currentComp = currentDish?.components[compIdx];
    if (!currentComp) return;
    const currentVal = gramAdjustments[compIdx] ?? currentComp.defaultGrams;
    const nextVal = Math.max(10, Math.min(500, currentVal + delta));
    setGramAdjustments((prev) => ({ ...prev, [compIdx]: nextVal }));
  };

  const currentVoice = VOICE_SAMPLES[activeVoiceIdx];

  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans overflow-x-hidden antialiased">
      {/* ========================================================================= */}
      {/* 1. TOP MINIMALIST NAVBAR (RESPONSIVE WITH REAL APP LOGO) */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/85 border-b border-zinc-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo using Official App Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200 bg-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <img
                src="/logoApp.jpg"
                alt="NutriCore Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-extrabold text-lg tracking-tight text-black">
                Nutri<span className="text-emerald-600">Core</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            <a href="#ai-scanner" className="hover:text-black transition">
              Chụp món ăn
            </a>
            <a href="#comparison" className="hover:text-black transition">
              So Sánh
            </a>
            <a href="#reviews" className="hover:text-black transition">
              Đánh Giá
            </a>
            <a href="#roles" className="hover:text-black transition">
              Học Viên & PT
            </a>
            <a href="#faq" className="hover:text-black transition">
              Hỏi Đáp
            </a>
          </nav>

          {/* Action CTAs (Desktop) */}
          <div className="hidden md:flex items-center gap-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/home')}
                className="px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
              >
                <span>Vào Dashboard</span>
                <ArrowRight size={13} />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-black transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/onboarding"
                  className="px-5 py-2.5 rounded-full bg-black hover:bg-zinc-800 text-white font-semibold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>Dùng thử</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-zinc-700 hover:text-black hover:bg-zinc-100 transition"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 bg-white/95 backdrop-blur-xl px-4 py-5 space-y-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-3 text-sm font-semibold text-zinc-700">
              <a
                href="#ai-scanner"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-black transition flex items-center justify-between"
              >
                <span>Quét Ảnh AI</span>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>
              <a
                href="#comparison"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-black transition flex items-center justify-between"
              >
                <span>So Sánh Giải Pháp</span>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>
              <a
                href="#reviews"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-black transition flex items-center justify-between"
              >
                <span>Đánh Giá Từ Người Dùng</span>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>
              <a
                href="#roles"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-black transition flex items-center justify-between"
              >
                <span>Học Viên & PT</span>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>
              <a
                href="#faq"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1.5 hover:text-black transition flex items-center justify-between"
              >
                <span>Hỏi Đáp</span>
                <ChevronRight size={16} className="text-zinc-400" />
              </a>
            </nav>

            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2.5">
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/home');
                  }}
                  className="w-full py-3 rounded-full bg-black text-white font-semibold text-xs uppercase tracking-wider text-center shadow-sm"
                >
                  Vào Dashboard →
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-full bg-zinc-100 text-center text-xs font-semibold text-zinc-800"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/onboarding"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full py-3 rounded-full bg-black text-white text-center text-xs font-semibold uppercase tracking-wider shadow-sm"
                  >
                    Trải nghiệm miễn phí
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH 3D AMBIENT ORBS & SPATIAL SCANNER HUD */}
      {/* ========================================================================= */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden bg-gradient-to-b from-zinc-50/60 via-white to-white">
        {/* 3D Soft Ambient Mesh Floating Spheres */}
        <div
          className="absolute top-12 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-100/40 via-teal-50/30 to-transparent blur-3xl pointer-events-none"
          style={{ animation: 'float-orb-slow 16s ease-in-out infinite alternate' }}
        />
        <div
          className="absolute top-36 right-1/4 w-80 h-80 rounded-full bg-gradient-to-bl from-zinc-200/40 via-emerald-50/20 to-transparent blur-3xl pointer-events-none"
          style={{ animation: 'float-orb-slow 20s ease-in-out infinite alternate-reverse' }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
          {/* Minimalist Stark Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.08]">
            Chụp ảnh bữa ăn. <br />
            <span className="text-zinc-400">Biết ngay từng gam Macro.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Không cần cân tiểu ly. Chỉ cần một bức ảnh hoặc một câu nói tự nhiên, NutriCore tự động nhận diện món ăn Việt Nam, tính chuẩn Calo & Protein và kết nối trực tiếp với Huấn luyện viên  của bạn.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Tính chỉ số TDEE miễn phí</span>
              <ArrowRight size={16} />
            </Link>
            <a
              href="#ai-scanner"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles size={16} className="text-zinc-500" />
              <span>Xem Demo</span>
            </a>
          </div>

          {/* Social Proof Star Rating */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-zinc-500">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <span className="font-medium text-zinc-700">
              4.9/5 xếp hạng • Cơ sở dữ liệu hơn 10,000 món ăn & thức uống Việt Nam
            </span>
          </div>
        </div>

        {/* Centerpiece Visual: 3D Tilt Card & Multi-layer Food Scanner HUD */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-10" style={{ perspective: '1200px' }}>
          <TiltCard3D
            maxTilt={4}
            glowColor="rgba(16, 185, 129, 0.08)"
            className="rounded-3xl bg-white p-3 sm:p-5 shadow-xl shadow-zinc-200/50"
          >
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Left: Food Scanner Preview with 3D Spatial Laser & Target Brackets */}
              <div
                className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-zinc-100 group/scan"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=78&w=800&auto=format&fit=crop"
                  alt="Food Scan Preview"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/scan:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* 3D Laser Scanline Animation */}
                <div
                  className="pointer-events-none absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_rgba(52,211,153,0.9)]"
                  style={{ animation: 'laser-scan 3.5s ease-in-out infinite' }}
                />
                <div
                  className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs"
                  style={{ transform: 'translateZ(40px)' }}
                >
                  <span className="backdrop-blur-md bg-black/80 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                    Sườn nướng: 140g (339 kcal)
                  </span>
                  <span className="backdrop-blur-md bg-black/80 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                    Cơm tấm: 200g (260 kcal)
                  </span>
                  <span className="backdrop-blur-md bg-black/80 text-white font-medium px-3 py-1 rounded-full shadow-sm">
                    Chả trứng: 60g (111 kcal)
                  </span>
                </div>
              </div>

              {/* Right: Clean White Macro Metrics HUD */}
              <div className="md:col-span-5 p-4 sm:p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                    <span>Mục Tiêu Hôm Nay</span>
                    <span className="text-emerald-600 font-extrabold">Đạt 88%</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-black">2,110</span>
                    <span className="text-sm font-semibold text-zinc-600">/ 2,400 kcal</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden mt-3">
                    <div className="bg-black h-full w-[88%] rounded-full" />
                  </div>
                </div>

                {/* Macro Chips */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-zinc-700">Chất đạm (Protein)</span>
                    </div>
                    <span className="text-sm font-extrabold text-black">
                      165g <span className="text-xs font-normal text-zinc-400">/ 180g</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-zinc-700">Tinh bột (Carbs)</span>
                    </div>
                    <span className="text-sm font-extrabold text-black">
                      210g <span className="text-xs font-normal text-zinc-400">/ 240g</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="text-xs font-bold text-zinc-700">Chất béo (Fat)</span>
                    </div>
                    <span className="text-sm font-extrabold text-black">
                      55g <span className="text-xs font-normal text-zinc-400">/ 65g</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Coach Đào Trần đã xem & duyệt thực đơn 10 phút trước</span>
                </div>
              </div>
            </div>
          </TiltCard3D>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE INTERACTIVE AI SCANNER (BORDERLESS SELECTION CARDS & CLEAN NUMBERS) */}
      {/* ========================================================================= */}
      <section id="ai-scanner" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Xem AI nhận diện món ăn trong 1 giây
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Chọn một món ăn mẫu hoặc câu nói dưới đây để trải nghiệm cách NutriCore bóc tách Calo và thành phần dinh dưỡng.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-full bg-zinc-100 mt-3 shadow-xs">
            <button
              onClick={() => setDemoMode('vision')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                demoMode === 'vision'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Camera size={14} />
              <span>Quét ảnh thực đơn</span>
            </button>
            <button
              onClick={() => setDemoMode('voice')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                demoMode === 'voice'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Mic size={14} />
              <span>Nói tự nhiên</span>
            </button>
          </div>
        </div>

        {demoMode === 'vision' ? (
          <div className="rounded-3xl bg-white p-5 sm:p-8 shadow-sm space-y-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-3">
                Chọn đĩa ăn để phân tích:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMO_DISHES.map((dish, idx) => (
                  <button
                    key={dish.id}
                    onClick={() => handleSelectDish(idx)}
                    className={`text-left p-3 rounded-2xl transition-all flex flex-col gap-2 cursor-pointer ${
                      selectedDishIdx === idx
                        ? 'bg-zinc-100 shadow-sm'
                        : 'bg-zinc-50/80 hover:bg-zinc-100/70'
                    }`}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-24 rounded-xl object-cover"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 block truncate">
                        {dish.tag}
                      </span>
                      <p className="text-xs font-bold text-black truncate mt-0.5">{dish.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Split View: Photo + Interactive Component Weights */}
            <div className="grid md:grid-cols-12 gap-8 items-start pt-2 border-t border-zinc-100">
              {/* Left Photo View */}
              <div className="md:col-span-6 space-y-4">
                <div className="relative rounded-2xl overflow-hidden aspect-4/3 bg-zinc-100">
                  <img
                    src={currentDish?.image}
                    alt={currentDish?.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md">
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Đang phân tích món ăn...</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-bold text-zinc-900 shadow-xs">
                      {currentDish?.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Nutrients & Granular Gram Adjuster */}
              <div className="md:col-span-6 space-y-6">
                {/* Total Calories Bar (NO LONG FLOATING POINT DECIMALS) */}
                <div className="p-4 rounded-2xl bg-zinc-50">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Tổng Dinh Dưỡng</p>
                      <p className="text-3xl font-extrabold text-black mt-0.5">
                        {computedDishTotals.cal} <span className="text-sm font-semibold text-zinc-500">kcal</span>
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs font-bold">
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                        P: {computedDishTotals.pro}g
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                        C: {computedDishTotals.carb}g
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                        F: {computedDishTotals.fat}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Components Adjuster (BORDERLESS LIST) */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-zinc-500 font-semibold">
                    <span>Thành phần nhận diện</span>
                    <span>Chạm (+) (-) để chỉnh số gram</span>
                  </div>

                  {currentDish?.components.map((comp, idx) => {
                    const currentGrams = gramAdjustments[idx] ?? comp.defaultGrams;
                    const factor = currentGrams / 100;
                    const itemCal = Math.round(comp.calPer100 * factor);

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-zinc-50 flex items-center justify-between gap-3 text-xs shadow-xs"
                      >
                        <div>
                          <p className="font-bold text-black">{comp.name}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{itemCal} kcal</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustGram(idx, -10)}
                            className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center transition shadow-xs"
                            aria-label="Giảm 10g"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-14 text-center font-extrabold text-black text-xs">
                            {currentGrams}g
                          </span>
                          <button
                            onClick={() => handleAdjustGram(idx, 10)}
                            className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center transition shadow-xs"
                            aria-label="Tăng 10g"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href="/onboarding"
                  className="w-full py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Lưu thực đơn & Đo TDEE của bạn →</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Voice NLP Clean Sandbox (BORDERLESS CARDS as requested in item 4) */
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-xl font-bold text-black">
                Thuật toán bóc tách khẩu phần ăn dân dã Việt Nam
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm">
                Người Việt thường nói: <em>&ldquo;2 quả trứng&rdquo;, &ldquo;nửa chén cơm&rdquo;, &ldquo;1 tô phở&rdquo;</em>. NutriCore tự động nhận dạng quy đổi sang trọng lượng tương đương.
              </p>
            </div>

            {/* Voice Samples (BORDERLESS as requested) */}
            <div className="grid sm:grid-cols-3 gap-3">
              {VOICE_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVoiceIdx(idx)}
                  className={`p-4 rounded-2xl text-left transition-all cursor-pointer ${
                    activeVoiceIdx === idx
                      ? 'bg-zinc-100 shadow-sm'
                      : 'bg-zinc-50/80 hover:bg-zinc-100/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2">
                    <Mic size={14} className="text-emerald-600" />
                    <span>Mẫu nói {idx + 1}</span>
                  </div>
                  <p className="text-xs font-medium text-black line-clamp-2 leading-relaxed">
                    &ldquo;{sample.spoken}&rdquo;
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-3 pt-2 border-t border-zinc-200/50">
                    Tổng: {sample.totalCal} kcal
                  </p>
                </button>
              ))}
            </div>

            {/* Current Voice Result (BORDERLESS) */}
            <div className="p-5 rounded-2xl bg-zinc-50 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <span className="text-xs font-bold text-zinc-500 uppercase">Kết quả phân tích NLP</span>
                <span className="text-sm font-extrabold text-black">
                  {currentVoice?.totalCal} kcal • {currentVoice?.totalP}g Protein
                </span>
              </div>

              <div className="space-y-2">
                {currentVoice?.tokens.map((token, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white flex items-center justify-between text-xs shadow-xs"
                  >
                    <div>
                      <span className="text-zinc-400 font-medium block">Từ nói: &ldquo;{token.raw}&rdquo;</span>
                      <span className="font-bold text-black mt-0.5 block">➔ Quy đổi: {token.parsed}</span>
                    </div>
                    <div className="flex items-center gap-3 font-semibold text-zinc-600">
                      <span>P: {token.p}</span>
                      <span>C: {token.c}</span>
                      <span>F: {token.f}</span>
                      <span className="font-extrabold text-black">{token.cal} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. COMPARISON MATRIX: TRADITIONAL VS NUTRICORE */}
      {/* ========================================================================= */}
      <section id="comparison" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight text-black">
            Bảng So Sánh NutriCore vs Cách Làm Thủ Công
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Xem sự khác biệt rõ rệt giữa phương pháp đo lường truyền thống và nền tảng thông minh NutriCore.
          </p>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-sm bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80">
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-600 font-bold w-1/3">
                  Tiêu chí
                </th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-600 font-bold w-1/3">
                  Phương pháp truyền thống
                </th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-black font-extrabold w-1/3 bg-zinc-100/50">
                  NutriCore AI Platform
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs sm:text-sm">
              <tr>
                <td className="py-4 px-6 font-bold text-black">1. Ghi nhận bữa ăn</td>
                <td className="py-4 px-6 text-zinc-600">
                  Cân tiểu ly từng lạng, tra cứu Excel mỏi mắt.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                  Chụp 1 tấm ảnh hoặc nói 1 câu tự nhiên (1s).
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">2. Cân bằng dinh dưỡng Macro</td>
                <td className="py-4 px-6 text-zinc-600">
                  Tính nhẩm cảm tính, thường xuyên thiếu Protein.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                  Thuật toán Knapsack Heuristic chuẩn hóa Macro.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">3. Tương tác với Huấn luyện viên</td>
                <td className="py-4 px-6 text-zinc-600">
                  Nhắn tin Zalo rời rạc, trôi tin, khó theo dõi.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                  Đồng bộ 1 chạm qua mã QR, lịch tập trực tiếp.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">4. Đánh giá sự tiến bộ</td>
                <td className="py-4 px-6 text-zinc-600">
                  Chỉ nhìn số ký thông thường, không rõ cơ hay mỡ.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                  Biểu đồ InBody Stock Chart & Thanh trượt Before/After.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">5. Bảo mật dữ liệu cá nhân</td>
                <td className="py-4 px-6 text-zinc-600">
                  Dữ liệu vóc dáng dễ bị chia sẻ công khai.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-900 bg-emerald-50/40">
                  Mã hóa đầu cuối AES-256-GCM chuẩn quân đội.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. NEW TESTIMONIALS / USER REVIEWS SECTION (AS REQUESTED IN ITEM 7) */}
      {/* ========================================================================= */}
      <section id="reviews" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Đánh Giá Từ Cộng Đồng Tập Luyện
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Lắng nghe câu chuyện thay đổi vóc dáng và thói quen dinh dưỡng từ những học viên và PT tiên phong.
          </p>
        </div>

        {/* 3D Horizontal Infinite Marquee Carousel (3 Cards Per Row on Desktop) */}
        <div className="relative overflow-hidden py-4" style={{ perspective: '1200px' }}>
          {/* Left fade gradient */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-r from-white via-white/80 to-transparent" />
          {/* Right fade gradient */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 bg-gradient-to-l from-white via-white/80 to-transparent" />

          {/* Marquee Track with 3 cards visible side-by-side on desktop */}
          <div
            className="marquee-track flex gap-6 py-6"
            style={{
              animation: 'marquee-scroll 36s linear infinite',
              width: 'max-content',
            }}
          >
            {/* Duplicate cards for seamless infinite loop */}
            {[...TESTIMONIALS, ...TESTIMONIALS].map((review, i) => (
              <div
                key={i}
                className="relative w-[310px] sm:w-[350px] lg:w-[360px] shrink-0 p-7 rounded-3xl bg-white shadow-sm flex flex-col justify-between space-y-5 cursor-pointer select-none overflow-hidden"
                style={{
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  transformStyle: 'preserve-3d',
                  transform:
                    i % 3 === 0
                      ? 'perspective(1000px) rotateY(3deg) translateZ(0px)'
                      : i % 3 === 1
                      ? 'perspective(1000px) rotateY(0deg) translateZ(10px)'
                      : 'perspective(1000px) rotateY(-3deg) translateZ(0px)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    'perspective(1000px) rotateY(0deg) translateY(-8px) translateZ(30px) scale(1.025)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 25px 45px -12px rgba(0,0,0,0.12), 0 10px 20px -8px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  const idx3 = i % 3;
                  (e.currentTarget as HTMLDivElement).style.transform =
                    idx3 === 0
                      ? 'perspective(1000px) rotateY(3deg) translateZ(0px)'
                      : idx3 === 1
                      ? 'perspective(1000px) rotateY(0deg) translateZ(10px)'
                      : 'perspective(1000px) rotateY(-3deg) translateZ(0px)';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                }}
              >
                {/* 3D Top Light Sheen */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent pointer-events-none" />
                {/* 3D Watermark Quote */}
                <span className="absolute top-4 right-6 text-5xl font-serif text-zinc-100 font-black select-none pointer-events-none leading-none">
                  “
                </span>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(review.rating)].map((_, idx) => (
                        <Star key={idx} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800">
                      {review.tag}
                    </span>
                  </div>
                  <p className="text-zinc-700 text-xs sm:text-sm leading-relaxed italic line-clamp-5">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                </div>

                <div className="relative z-10 pt-4 border-t border-zinc-100 flex items-center gap-3.5">
                  <img
                    src={review.avatar}
                    alt={review.name}
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover shadow-xs"
                  />
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-black">{review.name}</h4>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyframe injected via style tag */}
        <style>{`
          @keyframes marquee-scroll {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track:hover {
            animation-play-state: paused !important;
          }
          @keyframes laser-scan {
            0%   { top: 2%; opacity: 0; }
            15%  { opacity: 1; }
            85%  { opacity: 1; }
            100% { top: 96%; opacity: 0; }
          }
          @keyframes float-orb-slow {
            0%   { transform: translateY(0px) scale(1); }
            50%  { transform: translateY(-22px) scale(1.04); }
            100% { transform: translateY(12px) scale(0.96); }
          }
        `}</style>
      </section>

      {/* ========================================================================= */}
      {/* 6. ROLE EXPERIENCE SWITCHER (CAL AI MINIMALIST CARD) */}
      {/* ========================================================================= */}
      <section id="roles" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
        <div className="rounded-3xl bg-zinc-50/70 p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
            <div>
              <h2 className="text-2xl font-extrabold text-black">
                Thiết kế riêng cho từng vai trò
              </h2>
              <p className="text-zinc-600 text-xs sm:text-sm mt-1">
                Tối ưu hóa thao tác cho cả Người tập, Huấn luyện viên và Ban quản trị.
              </p>
            </div>

            {/* Role Pills */}
            <div className="inline-flex p-1 rounded-full bg-white shadow-xs">
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'student'
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Học viên
              </button>
              <button
                onClick={() => setActiveRoleTab('pt')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'pt'
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Huấn luyện viên 
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeRoleTab === 'admin'
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Quản trị viên
              </button>
            </div>
          </div>

          {/* Role Step Breakdown */}
          <div className="grid sm:grid-cols-3 gap-4 pt-6">
            {activeRoleTab === 'student' && (
              <>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Onboarding</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Tính toán BMR, TDEE, lượng thâm hụt calo và khai báo danh sách thực phẩm dị ứng chỉ sau 1 phút.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Log Ăn Bằng AI</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Chụp ảnh bữa ăn hoặc nói qua mic, xem ngay bảng dinh dưỡng và giữ chuỗi Streak kỷ luật mỗi ngày.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Tập Cùng PT</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Xem ảnh hướng dẫn bài tập, quét mã QR điểm danh buổi tập và xem biểu đồ InBody thay đổi thể hình.
                  </p>
                </div>
              </>
            )}

            {activeRoleTab === 'pt' && (
              <>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Mời Học Viên</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Tùy chọn số buổi gói tập (12, 16, 24, 36...) và tạo mã QR để học viên quét liên kết ngay tại phòng tập.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Lịch Dạy & Check-in</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Quản lý toàn bộ ca dạy trên lưới lịch tháng, điểm danh trừ buổi tập an toàn chống gian lận.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Duyệt Bữa Ăn</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Chỉ định thực đơn, duyệt nhật ký ăn uống và theo dõi biến đổi cơ mỡ của từng học viên trên 1 bảng điều khiển.
                  </p>
                </div>
              </>
            )}

            {activeRoleTab === 'admin' && (
              <>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Phê Duyệt PT</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Xem hồ sơ bằng cấp, chứng chỉ thể hình và phê duyệt quyền hoạt động huấn luyện viên trên hệ thống.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Thư Viện Thực Phẩm</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Quản trị danh mục thực phẩm Việt Nam và kho bài tập chuẩn kỹ thuật với hình ảnh minh họa chất lượng cao.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Thống Kê Nền Tảng</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Theo dõi số lượng học viên, hiệu suất hoạt động của các PT và chỉ số tăng trưởng toàn hệ sinh thái.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight text-black">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Mọi điều bạn cần biết trước khi bắt đầu cùng NutriCore.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-black text-sm hover:text-zinc-600 transition cursor-pointer"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-black' : 'text-zinc-400'}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-700 leading-relaxed border-t border-zinc-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CALL TO ACTION BANNER (WITH LUXURY GYM ATMOSPHERE & COLOR HARMONY) */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center justify-center">
          {/* Luxury Gym Background Image */}
          <img
            src="/cta-gym.jpg"
            alt="NutriCore Fitness Space"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center scale-105"
          />
          {/* Rich Dark Frosted Glass Gradient Overlay for Maximum Text Contrast & Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/75 to-black/60 backdrop-blur-[2px]" />

          <div className="relative z-10 p-8 sm:p-14 text-center space-y-6 max-w-2xl mx-auto">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-zinc-100 text-xs font-semibold uppercase tracking-wider border border-white/20 shadow-xs">
              Bắt đầu miễn phí hôm nay
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Kỷ luật tạo nên hình thể. <br />
              <span className="text-emerald-400">Dữ liệu tạo nên kết quả.</span>
            </h2>
            <p className="text-zinc-200 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-normal">
              Mở toàn bộ tính năng hoàn toàn miễn phí. Khám phá chỉ số TDEE cá nhân và theo dõi calo dễ dàng hơn bao giờ hết.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-sm tracking-wide hover:bg-zinc-100 transition shadow-lg hover:scale-105"
              >
                Thiết lập TDEE của tôi ngay
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 font-semibold text-sm transition hover:scale-105"
              >
                Đăng nhập tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. MINIMALIST CLEAN FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-zinc-200 py-10 text-xs text-zinc-500 bg-zinc-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200 bg-white flex items-center justify-center shadow-xs">
                <img src="/logoApp.jpg" alt="NutriCore Logo" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <span className="font-extrabold text-sm text-black tracking-tight">
                Nutri<span className="text-emerald-600">Core</span>
              </span>
            </div>

            <div className="flex flex-wrap gap-5 font-semibold text-zinc-600 text-xs">
              <a href="#ai-scanner" className="hover:text-black transition">Chụp món ăn </a>
              <a href="#comparison" className="hover:text-black transition">So sánh</a>
              <a href="#reviews" className="hover:text-black transition">Đánh giá</a>
              <a href="#roles" className="hover:text-black transition">Học viên & PT</a>
              <a href="#faq" className="hover:text-black transition">Hỏi đáp</a>
              <Link href="/login" className="hover:text-black transition">Đăng nhập</Link>
            </div>
          </div>

          <div className="border-t border-zinc-200/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-400 text-[11px]">
            <p>© 2026 NUTRICORE. ALL RIGHTS RESERVED.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
