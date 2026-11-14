/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Mic,
  ShieldCheck,
  Dumbbell,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Apple,
  Zap,
  ChevronRight,
  ChevronDown,
  Scale,
  RefreshCw,
  Star,
  Plus,
  Minus,
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
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop',
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
    q: 'Huấn luyện viên cá nhân (PT) kết nối với học viên ra sao?',
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

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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

  // Calculate dynamic totals
  const computedDishTotals = (currentDish?.components || []).reduce(
    (acc, comp, i) => {
      const factor = (gramAdjustments[i] ?? comp.defaultGrams) / 100;
      return {
        cal: acc.cal + Math.round(comp.calPer100 * factor),
        pro: acc.pro + Number((comp.proPer100 * factor).toFixed(1)),
        carb: acc.carb + Number((comp.carbPer100 * factor).toFixed(1)),
        fat: acc.fat + Number((comp.fatPer100 * factor).toFixed(1)),
      };
    },
    { cal: 0, pro: 0, carb: 0, fat: 0 }
  );

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
      {/* 1. TOP MINIMALIST NAVBAR (CAL AI INSPIRED) */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200/80 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-black">
                Nutri<span className="text-zinc-500 font-semibold">Core</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                Cal AI Style
              </span>
            </div>
          </Link>

          {/* Nav Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            <a href="#ai-scanner" className="hover:text-black transition">
              Quét Ảnh AI
            </a>
            <a href="#features" className="hover:text-black transition">
              Tính Năng
            </a>
            <a href="#roles" className="hover:text-black transition">
              Học Viên & PT
            </a>
            <a href="#comparison" className="hover:text-black transition">
              So Sánh
            </a>
            <a href="#faq" className="hover:text-black transition">
              Hỏi Đáp
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
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
                  <Zap size={13} />
                  <span>Dùng thử</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: ULTRA-CLEAN, WHITE, CONTENT-FIRST */}
      {/* ========================================================================= */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-gradient-to-b from-zinc-50/70 via-white to-white">
        {/* Subtle decorative background circles */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-7">
          {/* Cal AI Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-100 border border-zinc-200/80 text-xs font-semibold text-zinc-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Đếm Calo & Huấn Luyện PT Đơn Giản Nhất</span>
          </div>

          {/* Minimalist Stark Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.08]">
            Chụp ảnh bữa ăn. <br />
            <span className="text-zinc-400">Biết ngay từng gam Macro.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-zinc-600 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
            Không cần cân tiểu ly. Chỉ cần một bức ảnh hoặc một câu nói tự nhiên, NutriCore tự động nhận diện món ăn Việt Nam, tính chuẩn Calo & Protein và kết nối trực tiếp với Huấn luyện viên (PT) của bạn.
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
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-900 font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <Sparkles size={16} className="text-zinc-500" />
              <span>Xem Demo AI Scanner</span>
            </a>
          </div>

          {/* Social Proof Star Rating */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-zinc-500">
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <span className="font-medium text-zinc-700">
              4.9/5 xếp hạng • Hơn 10,000+ món ăn & thức uống Việt Nam đã tối ưu
            </span>
          </div>
        </div>

        {/* Centerpiece Visual: Clean Phone Mockup & Macro HUD */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-12">
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-3 sm:p-5 shadow-xl shadow-zinc-200/50">
            <div className="grid md:grid-cols-12 gap-6 items-center">
              {/* Left: Food Scanner Preview */}
              <div className="md:col-span-7 relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-16/10 bg-zinc-100 border border-zinc-200">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200&auto=format&fit=crop"
                  alt="Food Scan Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Floating Chips on Image */}
                <div className="absolute top-4 left-4 backdrop-blur-md bg-white/90 px-3.5 py-1.5 rounded-full shadow-sm border border-zinc-200 text-xs font-semibold text-zinc-900 flex items-center gap-2">
                  <Camera size={14} className="text-emerald-600" />
                  <span>Gemini Vision AI: Cơm Tấm Sườn Bì</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 text-xs">
                  <span className="backdrop-blur-md bg-black/75 text-white font-medium px-3 py-1 rounded-full">
                    Sườn nướng: 140g (339 kcal)
                  </span>
                  <span className="backdrop-blur-md bg-black/75 text-white font-medium px-3 py-1 rounded-full">
                    Cơm tấm: 200g (260 kcal)
                  </span>
                  <span className="backdrop-blur-md bg-black/75 text-white font-medium px-3 py-1 rounded-full">
                    Chả trứng: 60g (111 kcal)
                  </span>
                </div>
              </div>

              {/* Right: Clean White Macro Metrics HUD */}
              <div className="md:col-span-5 p-4 sm:p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>Mục Tiêu Hôm Nay</span>
                    <span className="text-emerald-600 font-extrabold">Đạt 88%</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight text-black">2,110</span>
                    <span className="text-sm font-semibold text-zinc-500">/ 2,400 kcal</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden mt-3">
                    <div className="bg-black h-full w-[88%] rounded-full" />
                  </div>
                </div>

                {/* Macro Chips */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-xs font-bold text-zinc-700">Chất đạm (Protein)</span>
                    </div>
                    <span className="text-sm font-extrabold text-black">165g <span className="text-xs font-normal text-zinc-400">/ 180g</span></span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-xs font-bold text-zinc-700">Tinh bột (Carbs)</span>
                    </div>
                    <span className="text-sm font-extrabold text-black">210g <span className="text-xs font-normal text-zinc-400">/ 240g</span></span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span className="text-xs font-bold text-zinc-700">Chất béo (Fat)</span>
                    </div>
                    <span className="text-sm font-extrabold text-black">55g <span className="text-xs font-normal text-zinc-400">/ 65g</span></span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3 text-xs text-zinc-500">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Coach Đào Trần đã xem & duyệt thực đơn 10 phút trước</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LIVE INTERACTIVE AI SCANNER (CAL AI CLEAN WHITE EXPERIENCE) */}
      {/* ========================================================================= */}
      <section id="ai-scanner" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Trải nghiệm tính năng AI trực tiếp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Xem AI nhận diện món ăn trong 1 giây
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Chọn một món ăn mẫu hoặc câu nói dưới đây để trải nghiệm cách NutriCore bóc tách Calo và thành phần dinh dưỡng.
          </p>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-full bg-zinc-100 border border-zinc-200 mt-3">
            <button
              onClick={() => setDemoMode('vision')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                demoMode === 'vision'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Camera size={14} />
              <span>Quét ảnh AI (Gemini Vision)</span>
            </button>
            <button
              onClick={() => setDemoMode('voice')}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
                demoMode === 'voice'
                  ? 'bg-white text-black shadow-xs font-bold'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              <Mic size={14} />
              <span>Nói tự nhiên (Voice NLP)</span>
            </button>
          </div>
        </div>

        {demoMode === 'vision' ? (
          /* Vision AI Clean Sandbox */
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-5 sm:p-8 shadow-sm space-y-8">
            {/* Dish Selection Pill Thumbnails */}
            <div>
              <p className="text-xs uppercase tracking-wider text-zinc-400 font-bold mb-3">
                Chọn đĩa ăn để AI quét thử:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DEMO_DISHES.map((dish, idx) => (
                  <button
                    key={dish.id}
                    onClick={() => handleSelectDish(idx)}
                    className={`text-left p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                      selectedDishIdx === idx
                        ? 'border-black bg-zinc-50 shadow-xs'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
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
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 aspect-4/3 bg-zinc-100">
                  <img
                    src={currentDish?.image}
                    alt={currentDish?.name}
                    className="w-full h-full object-cover"
                  />
                  {isScanning && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-xs font-semibold shadow-md">
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Gemini Vision đang bóc tách...</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full font-bold text-zinc-900 border border-zinc-200">
                      {currentDish?.name}
                    </span>
                    <span className="bg-black text-white px-2.5 py-1 rounded-full font-semibold text-[11px]">
                      Gemini 2.5 Flash
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed italic">
                  💡 {currentDish?.description}
                </p>
              </div>

              {/* Right Side: Nutrients & Granular Gram Adjuster */}
              <div className="md:col-span-6 space-y-6">
                {/* Total Calories Bar */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
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

                {/* Components Adjuster */}
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
                        className="p-3 rounded-2xl bg-white border border-zinc-200 flex items-center justify-between gap-3 text-xs shadow-xs"
                      >
                        <div>
                          <p className="font-bold text-black">{comp.name}</p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{itemCal} kcal</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleAdjustGram(idx, -10)}
                            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center transition"
                            aria-label="Giảm 10g"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-14 text-center font-extrabold text-black text-xs">
                            {currentGrams}g
                          </span>
                          <button
                            onClick={() => handleAdjustGram(idx, 10)}
                            className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold flex items-center justify-center transition"
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
          /* Voice NLP Clean Sandbox */
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-xl font-bold text-black">
                Thuật toán bóc tách khẩu phần ăn dân dã Việt Nam
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm">
                Người Việt thường nói: <em>&ldquo;2 quả trứng&rdquo;, &ldquo;nửa chén cơm&rdquo;, &ldquo;1 tô phở&rdquo;</em>. NutriCore tự động nhận dạng quy đổi sang trọng lượng tương đương.
              </p>
            </div>

            {/* Voice Samples */}
            <div className="grid sm:grid-cols-3 gap-3">
              {VOICE_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVoiceIdx(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    activeVoiceIdx === idx
                      ? 'border-black bg-zinc-50 shadow-xs'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 mb-2">
                    <Mic size={14} className="text-emerald-600" />
                    <span>Mẫu nói {idx + 1}</span>
                  </div>
                  <p className="text-xs font-medium text-black line-clamp-2 leading-relaxed">
                    &ldquo;{sample.spoken}&rdquo;
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-3 pt-2 border-t border-zinc-100">
                    Tổng: {sample.totalCal} kcal
                  </p>
                </button>
              ))}
            </div>

            {/* Current Voice Result */}
            <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200/70 space-y-4">
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
                    className="p-3 rounded-xl bg-white border border-zinc-200 flex items-center justify-between text-xs"
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
      {/* 4. THE 4 BENTO GRID PILLARS (CAL AI STYLE BENTO BOX) */}
      {/* ========================================================================= */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold">
            <Zap size={14} className="text-emerald-600" />
            <span>Hệ Thống Tính Năng Toàn Diện</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-black">
            Mọi thứ bạn cần để đạt vóc dáng mơ ước
          </h2>
          <p className="text-zinc-600 text-sm sm:text-base">
            Kết hợp sức mạnh trí tuệ nhân tạo cùng sự đồng hành sát sao của Huấn luyện viên thể hình cá nhân.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Smart Meal Planner */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                <Apple size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-black">
                Smart AI Meal Planner
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                Thuật toán Knapsack Heuristic tự động phân bổ bữa Sáng, Trưa, Tối, Phụ đạt chuẩn 100% Protein, cân đối vi chất theo TDEE và tự động lọc danh sách thực phẩm dị ứng.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex items-center text-xs font-bold text-black">
              <span>Đạt chuẩn Macro & TDEE</span>
              <ChevronRight size={14} className="ml-1" />
            </div>
          </div>

          {/* Card 2: 1:1 PT Ecosystem */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                <Dumbbell size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-black">
                Huấn Luyện Viên PT 1:1
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                Mời học viên qua mã QR với số buổi tùy chọn (12, 16, 24, 36 buổi...), xếp lịch tập thông minh, giao bài tập có ảnh động minh họa và điểm danh trừ buổi bằng Atomic Transaction.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex items-center text-xs font-bold text-black">
              <span>Điểm danh QR nguyên tử</span>
              <ChevronRight size={14} className="ml-1" />
            </div>
          </div>

          {/* Card 3: InBody & Transformation */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-black">
                InBody & Transformation
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                Biểu đồ InBody dạng Stock Chart chuyên nghiệp phân tích Cân nặng, % Mỡ và Khối lượng cơ xương (SMM). Thanh trượt tương tác so sánh ảnh vóc dáng Before/After.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex items-center text-xs font-bold text-black">
              <span>Theo dõi Cơ - Mỡ thời gian thực</span>
              <ChevronRight size={14} className="ml-1" />
            </div>
          </div>

          {/* Card 4: Enterprise End-to-End Security */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-black">
                Mã Hóa Đầu Cuối (E2E)
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                Mã hóa toàn bộ thông tin nhạy cảm bằng thuật toán AES-256-GCM, cơ chế tự động xoay vòng Token (Silent Refresh) và che giấu thông tin nhận diện cá nhân trong hệ thống Audit Logs.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex items-center text-xs font-bold text-black">
              <span>Chuẩn bảo mật AES-256-GCM</span>
              <ChevronRight size={14} className="ml-1" />
            </div>
          </div>

          {/* Card 5: PWA & Mobile Native Container */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 md:col-span-2">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black flex items-center justify-center font-bold">
                <Smartphone size={22} />
              </div>
              <h3 className="text-xl font-extrabold text-black">
                Ứng Dụng Đa Nền Tảng (PWA & Android Native)
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">
                Dùng mượt mà trên trình duyệt di động hoặc cài đặt trực tiếp lên màn hình chính với công nghệ PWA (Add to Home Screen). Nhận thông báo Web Push nhắc nhở giờ tập và uống nước tự động mỗi ngày.
              </p>
            </div>
            <div className="pt-4 border-t border-zinc-100 flex items-center text-xs font-bold text-black">
              <span>Cài đặt 1 chạm không cần App Store</span>
              <ChevronRight size={14} className="ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ROLE EXPERIENCE SWITCHER (CAL AI MINIMALIST CARD) */}
      {/* ========================================================================= */}
      <section id="roles" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/70 p-6 sm:p-10 shadow-xs">
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
            <div className="inline-flex p-1 rounded-full bg-white border border-zinc-200 shadow-xs">
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeRoleTab === 'student'
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Học viên
              </button>
              <button
                onClick={() => setActiveRoleTab('pt')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeRoleTab === 'pt'
                    ? 'bg-black text-white'
                    : 'text-zinc-600 hover:text-black'
                }`}
              >
                Huấn luyện viên PT
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
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
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Onboarding</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Tính toán BMR, TDEE, lượng thâm hụt calo và khai báo danh sách thực phẩm dị ứng chỉ sau 1 phút.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Log Ăn Bằng AI</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Chụp ảnh bữa ăn hoặc nói qua mic, xem ngay bảng dinh dưỡng và giữ chuỗi Streak kỷ luật mỗi ngày.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Tập Cùng PT</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Xem ảnh hướng dẫn bài tập, quét mã QR điểm danh buổi tập và xem biểu đồ InBody thay đổi thể hình.
                  </p>
                </div>
              </>
            )}

            {activeRoleTab === 'pt' && (
              <>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Mời Học Viên</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Tùy chọn số buổi gói tập (12, 16, 24, 36...) và tạo mã QR để học viên quét liên kết ngay tại phòng tập.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Lịch Dạy & Check-in</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Quản lý toàn bộ ca dạy trên lưới lịch tháng, điểm danh trừ buổi tập an toàn chống gian lận.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">03. Duyệt Bữa Ăn</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Chỉ định thực đơn, duyệt nhật ký ăn uống và theo dõi biến đổi cơ mỡ của từng học viên trên 1 bảng điều khiển.
                  </p>
                </div>
              </>
            )}

            {activeRoleTab === 'admin' && (
              <>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">01. Phê Duyệt PT</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Xem hồ sơ bằng cấp, chứng chỉ thể hình và phê duyệt quyền hoạt động huấn luyện viên trên hệ thống.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                  <p className="text-black font-extrabold text-xs uppercase tracking-wider">02. Thư Viện Thực Phẩm</p>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Quản trị danh mục thực phẩm Việt Nam và kho bài tập chuẩn kỹ thuật với hình ảnh minh họa chất lượng cao.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
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
      {/* 6. COMPARISON MATRIX: TRADITIONAL VS NUTRICORE */}
      {/* ========================================================================= */}
      <section id="comparison" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-semibold">
            <Scale size={14} className="text-emerald-600" />
            <span>So Sánh Giải Pháp</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-black">
            NutriCore vs Cách Làm Thủ Công
          </h2>
          <p className="text-zinc-600 text-xs sm:text-sm">
            Tại sao phương pháp thủ công khiến bạn dễ bỏ cuộc và cách NutriCore giúp bạn duy trì kỷ luật dài hạn.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 overflow-hidden shadow-xs bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80">
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-500 font-bold w-1/3">
                  Tiêu chí
                </th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-500 font-bold w-1/3">
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
                <td className="py-4 px-6 text-zinc-500">
                  Cân tiểu ly từng lạng, tra cứu Excel mỏi mắt.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-800 bg-emerald-50/30">
                  Chụp 1 tấm ảnh hoặc nói 1 câu tự nhiên (1s).
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">2. Cân bằng dinh dưỡng Macro</td>
                <td className="py-4 px-6 text-zinc-500">
                  Tính nhẩm cảm tính, thường xuyên thiếu Protein.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-800 bg-emerald-50/30">
                  Thuật toán Knapsack Heuristic chuẩn hóa Macro.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">3. Tương tác với Huấn luyện viên</td>
                <td className="py-4 px-6 text-zinc-500">
                  Nhắn tin Zalo rời rạc, trôi tin, khó theo dõi.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-800 bg-emerald-50/30">
                  Đồng bộ 1 chạm qua mã QR, lịch tập trực tiếp.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">4. Đánh giá sự tiến bộ</td>
                <td className="py-4 px-6 text-zinc-500">
                  Chỉ nhìn số ký thông thường, không rõ cơ hay mỡ.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-800 bg-emerald-50/30">
                  Biểu đồ InBody Stock Chart & Thanh trượt Before/After.
                </td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-black">5. Bảo mật dữ liệu cá nhân</td>
                <td className="py-4 px-6 text-zinc-500">
                  Dữ liệu vóc dáng dễ bị chia sẻ công khai.
                </td>
                <td className="py-4 px-6 font-bold text-emerald-800 bg-emerald-50/30">
                  Mã hóa đầu cuối AES-256-GCM chuẩn quân đội.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-zinc-100">
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
              className="rounded-2xl border border-zinc-200 bg-white overflow-hidden transition-all shadow-xs"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-black text-sm hover:text-zinc-600 transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-black' : 'text-zinc-400'}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL HIGH-CONTRAST CALL TO ACTION (CAL AI CARD BANNER) */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl bg-black text-white p-8 sm:p-14 text-center space-y-6 shadow-xl">
          <span className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold uppercase tracking-wider">
            Bắt đầu miễn phí hôm nay
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Kỷ luật tạo nên hình thể. <br />
            <span className="text-zinc-400">Dữ liệu tạo nên kết quả.</span>
          </h2>
          <p className="text-zinc-400 max-w-lg mx-auto text-xs sm:text-sm leading-relaxed">
            Mở toàn bộ tính năng hoàn toàn miễn phí. Khám phá chỉ số TDEE cá nhân và theo dõi calo dễ dàng hơn bao giờ hết.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/onboarding"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-extrabold text-sm tracking-wide hover:bg-zinc-100 transition shadow-sm"
            >
              Thiết lập TDEE của tôi ngay
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 font-semibold text-sm transition"
            >
              Đăng nhập tài khoản
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. MINIMALIST CLEAN FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-zinc-200 py-10 text-xs text-zinc-500 bg-zinc-50/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                N
              </div>
              <span className="font-extrabold text-sm text-black tracking-tight">
                NutriCore
              </span>
              <span className="text-[11px] text-zinc-400 border-l border-zinc-300 pl-2.5">
                FitManagementPlatform
              </span>
            </div>

            <div className="flex flex-wrap gap-5 font-semibold text-zinc-600 text-xs">
              <a href="#ai-scanner" className="hover:text-black transition">Quét AI</a>
              <a href="#features" className="hover:text-black transition">Tính năng</a>
              <a href="#roles" className="hover:text-black transition">Học viên & PT</a>
              <a href="#faq" className="hover:text-black transition">Hỏi đáp</a>
              <Link href="/login" className="hover:text-black transition">Đăng nhập</Link>
            </div>
          </div>

          <div className="border-t border-zinc-200/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-zinc-400 text-[11px]">
            <p>© 2026 NUTRICORE. ALL RIGHTS RESERVED. POWERED BY GOOGLE GEMINI VISION AI.</p>
            <p className="flex items-center gap-1.5 text-zinc-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Hệ thống hoạt động ổn định 99.9%</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
