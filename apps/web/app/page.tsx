/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Mic,
  Flame,
  ShieldCheck,
  QrCode,
  Dumbbell,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Layers,
  Apple,
  Zap,
  ChevronRight,
  ChevronDown,
  Scale,
  RefreshCw,
} from 'lucide-react';

// ==========================================
// DEMO DISHES FOR AI VISION SCANNER
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
    tag: 'Bulking / Năng lượng cao',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    description: 'Món ăn đặc sản phổ biến, giàu protein từ sườn heo nướng và chả trứng.',
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
    tag: 'Phục hồi cơ bắp',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800&auto=format&fit=crop',
    description: 'Bò tái mềm giàu kẽm, nước dùng thanh từ xương hầm và bánh phở truyền thống.',
    components: [
      { name: 'Bánh phở tươi', defaultGrams: 220, calPer100: 140, proPer100: 3.2, carbPer100: 30.0, fatPer100: 0.5 },
      { name: 'Thịt bò tái nạm', defaultGrams: 120, calPer100: 215, proPer100: 26.0, carbPer100: 0.0, fatPer100: 12.5 },
      { name: 'Nước dùng phở bò', defaultGrams: 350, calPer100: 35, proPer100: 2.8, carbPer100: 1.5, fatPer100: 2.0 },
      { name: 'Hành tây & Rau thơm', defaultGrams: 40, calPer100: 25, proPer100: 1.2, carbPer100: 5.2, fatPer100: 0.2 },
    ],
  },
  {
    id: 'salad-uc-ga',
    name: 'Salad Ức Gà Áp Chảo & Bơ',
    tag: 'Cutting / Siêu nạc',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    description: 'Khẩu phần siết mỡ tối ưu: ức gà hấp dẫn, chất béo tốt từ bơ sáp và chất xơ.',
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
    tag: 'Cheat Meal / Cân bằng',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=800&auto=format&fit=crop',
    description: 'Chả viên nướng và thịt ba chỉ thơm nức, ăn kèm bún tươi và nước chấm đu đủ.',
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
      { raw: 'nửa chén cơm trắng', parsed: '75g Cơm trắng (nửa chén)', cal: 98, p: '2g', c: '22g', f: '0.2g' },
      { raw: '150g ức gà áp chảo', parsed: '150g Ức gà áp chảo', cal: 248, p: '46.5g', c: '0g', f: '5.4g' },
      { raw: '1 đĩa rau luộc', parsed: '200g Bông cải & Rau luộc', cal: 50, p: '3g', c: '9g', f: '0.4g' },
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
    q: 'AI nhận diện món ăn Việt Nam có chính xác không?',
    a: 'Cực kỳ chính xác! NutriCore kết hợp mô hình thị giác Google Gemini Vision AI được tinh chỉnh prompt chuyên sâu cho ẩm thực Việt Nam cùng cơ sở dữ liệu hàng ngàn món ăn bản địa. AI có khả năng nhận biết từ đĩa cơm tấm, phở, bún chả đến các món xào, luộc và ước tính gram theo kích thước đĩa.',
  },
  {
    q: 'Nếu đĩa thức ăn thực tế của tôi to hoặc nhỏ hơn ước tính của AI thì sao?',
    a: 'NutriCore áp dụng nguyên lý Human-in-the-loop: Sau khi AI phân tích hình ảnh hoặc giọng nói, màn hình luôn hiển thị bảng xem trước (Preview) cho phép bạn vuốt thanh trượt hoặc gõ trực tiếp số gram thực tế trước khi bấm "Lưu vào nhật ký", đảm bảo độ chuẩn xác 100%.',
  },
  {
    q: 'Huấn luyện viên (PT) kết nối với học viên như thế nào?',
    a: 'PT chỉ cần tạo mã QR hoặc gửi một đường link mời (có thể cấu hình sẵn số buổi tập: 12, 16, 24, 36 buổi hoặc tùy chỉnh). Khi học viên quét mã hoặc click link, hai tài khoản sẽ tự động đồng bộ 1:1, cho phép PT xếp lịch tập, giao bài tập có ảnh kỹ thuật và duyệt thực đơn.',
  },
  {
    q: 'Tôi có thể cài đặt ứng dụng lên điện thoại không?',
    a: 'Hoàn toàn được! Bạn có thể cài đặt trực tiếp từ trình duyệt Safari (iOS) / Chrome (Android) qua tính năng PWA (Thêm vào Màn hình chính), hoặc tải file cài đặt Android APK (xây dựng bằng Capacitor Native) để nhận Push Notification nhắc nhở tập luyện và uống nước.',
  },
  {
    q: 'Chỉ số sức khỏe và hình ảnh vóc dáng của tôi có an toàn không?',
    a: 'NutriCore trang bị công nghệ mã hóa đầu cuối (End-to-End Encryption) bằng thuật toán AES-256-GCM chuẩn quân đội. Mọi dữ liệu chỉ số cơ thể, hình ảnh InBody trước/sau đều được mã hóa trên thiết bị của bạn trước khi truyền tải, đồng thời tự động che dữ liệu nhạy cảm trong hệ thống logs.',
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

  // Dynamic grams adjuster for interactive demo
  const [gramAdjustments, setGramAdjustments] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt_token');
      setIsLoggedIn(Boolean(token));
    }
  }, []);

  // Trigger radar scan animation when switching dishes
  const handleSelectDish = (idx: number) => {
    setSelectedDishIdx(idx);
    setGramAdjustments({});
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 900);
    return () => clearTimeout(timer);
  };

  const currentDish = DEMO_DISHES[selectedDishIdx];

  // Calculate dynamic totals for the selected dish
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
    <div className="min-h-screen bg-[#06080C] text-zinc-100 selection:bg-emerald-500 selection:text-black font-sans overflow-x-hidden antialiased">
      {/* Background Subtle Tech Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#10b98118_1px,transparent_1px)] [background-size:28px_28px] z-0" />

      {/* ========================================================================= */}
      {/* 1. TOP ATHLETIC NAVBAR */}
      {/* ========================================================================= */}
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-[#06080C]/85 border-b border-white/10 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center font-black text-black text-xl tracking-tighter shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:scale-105 transition-transform">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-wider uppercase text-white leading-none">
                Nutri<span className="text-emerald-400">core</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/80 mt-1">
                AI Fitness Ecosystem
              </span>
            </div>
          </Link>

          {/* Nav Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <a href="#ai-scanner" className="hover:text-emerald-400 transition flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-400" />
              Demo AI Scanner
            </a>
            <a href="#pillars" className="hover:text-emerald-400 transition">
              Tính năng cốt lõi
            </a>
            <a href="#roles" className="hover:text-emerald-400 transition">
              Học viên & PT
            </a>
            <a href="#comparison" className="hover:text-emerald-400 transition">
              So sánh
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition">
              Hỏi đáp
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/home')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2"
              >
                <span>Vào Dashboard</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-white hover:bg-white/5 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/onboarding"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition-all transform hover:-translate-y-0.5 shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center gap-1.5"
                >
                  <Zap size={14} />
                  <span>Trải nghiệm ngay</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative min-h-[95vh] flex items-center pt-24 pb-16 overflow-hidden border-b border-white/10">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Vision & Pitch */}
            <div className="lg:col-span-7 space-y-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-black uppercase tracking-widest text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Next-Gen Fitness & Nutrition Intelligence</span>
              </div>

              {/* Bold Title */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[1.02] text-white">
                Đổ mồ hôi <br />
                trong phòng tập. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
                  Làm chủ từng gam Macro.
                </span>
              </h1>

              {/* Description */}
              <p className="text-zinc-300 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
                Không còn cảnh cân đo thủ công hay tra bảng tính mỏi mắt. <strong>NutriCore</strong> ứng dụng{' '}
                <span className="text-emerald-400 font-semibold">Gemini Vision AI</span> nhận diện đĩa cơm Việt Nam, bóc tách giọng nói tự nhiên, cân bằng thực đơn chuẩn TDEE và đồng bộ 1:1 cùng Huấn luyện viên cá nhân (PT).
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link
                  href="/onboarding"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm sm:text-base uppercase tracking-wider transition-all transform hover:-translate-y-1 shadow-[0_0_35px_rgba(16,185,129,0.5)] text-center flex items-center justify-center gap-2"
                >
                  <Flame size={18} />
                  <span>Đo chỉ số TDEE & Dùng Thử Miễn Phí</span>
                </Link>
                <a
                  href="#ai-scanner"
                  className="px-7 py-4 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-white/15 text-white font-bold text-sm sm:text-base uppercase tracking-wider transition-all text-center backdrop-blur-md flex items-center justify-center gap-2 hover:border-emerald-500/50"
                >
                  <Sparkles size={16} className="text-emerald-400" />
                  <span>Xem Demo AI Scanner</span>
                </a>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/10 max-w-2xl">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">10,000+</p>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                    Món ăn Việt Nam
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">99.2%</p>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                    Chuẩn xác Macro
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-teal-400">1-Touch</p>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                    Mời PT qua QR
                  </p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-orange-400">AES-256</p>
                  <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
                    Mã hóa đầu cuối
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Mockup Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-zinc-950/80 backdrop-blur-xl p-2">
                {/* Hero Card Image */}
                <div className="relative h-[340px] rounded-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop"
                    alt="Athlete Training Discipline"
                    className="w-full h-full object-cover object-center filter contrast-125 brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06080C] via-transparent to-black/60" />

                  {/* Top Live Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <div className="backdrop-blur-md bg-black/75 border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-white">Coach Đào Trần đã duyệt</span>
                    </div>
                    <div className="backdrop-blur-md bg-orange-500/20 border border-orange-500/40 px-3 py-1 rounded-xl text-xs font-black text-orange-300 flex items-center gap-1.5">
                      <Flame size={14} className="text-orange-400" />
                      <span>21 Ngày Streak</span>
                    </div>
                  </div>

                  {/* Floating AI Vision Tag */}
                  <div className="absolute bottom-3 left-3 right-3 backdrop-blur-md bg-emerald-950/80 border border-emerald-500/40 p-2.5 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Camera size={16} className="text-emerald-400" />
                      <span className="text-white font-bold">Gemini Vision AI: Quét xong trong 0.8s</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-[10px]">
                      100% MATCH
                    </span>
                  </div>
                </div>

                {/* Bottom Stats HUD */}
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                        Tiến độ Calo hôm nay • Lean Recomp
                      </p>
                      <p className="text-2xl font-black text-white mt-0.5">
                        2,150 <span className="text-xs font-bold text-emerald-400">/ 2,400 KCAL</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black">
                        ĐẠT 90%
                      </span>
                    </div>
                  </div>

                  {/* Macro Progress Bars */}
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div className="bg-zinc-900/90 border border-white/5 p-2 rounded-xl">
                      <div className="flex justify-between font-bold text-[11px] mb-1">
                        <span className="text-rose-400">ĐẠM (P)</span>
                        <span className="text-white">165g</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full w-[94%]" />
                      </div>
                    </div>
                    <div className="bg-zinc-900/90 border border-white/5 p-2 rounded-xl">
                      <div className="flex justify-between font-bold text-[11px] mb-1">
                        <span className="text-amber-400">TINH BỘT (C)</span>
                        <span className="text-white">210g</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full w-[88%]" />
                      </div>
                    </div>
                    <div className="bg-zinc-900/90 border border-white/5 p-2 rounded-xl">
                      <div className="flex justify-between font-bold text-[11px] mb-1">
                        <span className="text-sky-400">BÉO (F)</span>
                        <span className="text-white">55g</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="bg-sky-400 h-full w-[80%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE AI FOOD SCANNER SHOWCASE (DEMO SỐNG ĐỘNG) */}
      {/* ========================================================================= */}
      <section id="ai-scanner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Trải nghiệm AI Thực tế tại chỗ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            Nhận diện món ăn & Bóc tách Macro <br />
            <span className="text-emerald-400">Chỉ trong một cái chớp mắt</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Hãy bấm chọn các món ăn mẫu dưới đây để xem cách AI thị giác và thuật toán NLP phân tích từng thành phần đĩa ăn theo thời gian thực.
          </p>

          {/* Mode Switcher: Vision AI vs Voice NLP */}
          <div className="inline-flex p-1.5 rounded-2xl bg-zinc-900 border border-white/10 mt-4">
            <button
              onClick={() => setDemoMode('vision')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                demoMode === 'vision'
                  ? 'bg-emerald-500 text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Camera size={16} />
              <span>1. Quét Ảnh (Gemini Vision AI)</span>
            </button>
            <button
              onClick={() => setDemoMode('voice')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                demoMode === 'voice'
                  ? 'bg-emerald-500 text-black shadow-lg'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Mic size={16} />
              <span>2. Giọng nói (Vietnamese NLP)</span>
            </button>
          </div>
        </div>

        {demoMode === 'vision' ? (
          /* Vision AI Sandbox */
          <div className="grid lg:grid-cols-12 gap-8 items-start bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl">
            {/* Dish Selection Thumbnails */}
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                Chọn đĩa ăn để AI quét thử:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
                {DEMO_DISHES.map((dish, idx) => (
                  <button
                    key={dish.id}
                    onClick={() => handleSelectDish(idx)}
                    className={`text-left p-3.5 rounded-2xl border transition-all flex items-center gap-3.5 ${
                      selectedDishIdx === idx
                        ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-lg'
                        : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:border-white/25'
                    }`}
                  >
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 filter contrast-110"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block truncate">
                        {dish.tag}
                      </span>
                      <p className="text-sm font-bold text-white truncate">{dish.name}</p>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{dish.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Scanning Visual & Detected Components */}
            <div className="lg:col-span-7 bg-[#07090E] border border-white/10 rounded-3xl p-6 space-y-6">
              {/* Image Preview with Scanning Radar Overlay */}
              <div className="relative h-60 sm:h-72 rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={currentDish?.image}
                  alt={currentDish?.name}
                  className="w-full h-full object-cover filter contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Radar Scan Line Effect */}
                {isScanning && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent animate-[pulse_1s_infinite] border-b-2 border-emerald-400" />
                )}

                {/* Detected Tag Overlay */}
                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-xs">
                  <Camera size={14} className="text-emerald-400" />
                  <span className="text-white font-bold">{currentDish?.name}</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs text-zinc-300">
                    {isScanning ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" /> Đang phân tích Vision...
                      </span>
                    ) : (
                      <span>Nhận diện: <strong>{currentDish?.components.length} thành phần</strong></span>
                    )}
                  </div>
                  <span className="bg-emerald-500 text-black text-xs font-black px-2.5 py-1 rounded-lg">
                    Gemini 2.5 Flash
                  </span>
                </div>
              </div>

              {/* Total Macro Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Tổng chỉ số dinh dưỡng</p>
                  <p className="text-3xl font-black text-white mt-0.5">
                    {computedDishTotals.cal} <span className="text-sm font-bold text-emerald-400">KCAL</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black">
                    Protein: {computedDishTotals.pro}g
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black">
                    Carbs: {computedDishTotals.carb}g
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 font-black">
                    Fat: {computedDishTotals.fat}g
                  </span>
                </div>
              </div>

              {/* Interactive Component Granular Breakdown (Human in the loop) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-bold uppercase tracking-wider">Các món thành phần (Tự do tinh chỉnh số gram)</span>
                  <span className="text-[11px] text-emerald-400 font-semibold">Tự động tính lại Calo</span>
                </div>

                {currentDish?.components.map((comp, idx) => {
                  const currentGrams = gramAdjustments[idx] ?? comp.defaultGrams;
                  const factor = currentGrams / 100;
                  const itemCal = Math.round(comp.calPer100 * factor);
                  const itemPro = (comp.proPer100 * factor).toFixed(1);

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-zinc-900/90 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-white">{comp.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            {itemCal} kcal • {itemPro}g Protein
                          </p>
                        </div>
                      </div>

                      {/* Weight Stepper Controller */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => handleAdjustGram(idx, -10)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm flex items-center justify-center transition"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 rounded-lg bg-black border border-white/10 font-black text-emerald-300 min-w-[70px] text-center">
                          {currentGrams}g
                        </span>
                        <button
                          onClick={() => handleAdjustGram(idx, 10)}
                          className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-black text-sm flex items-center justify-center transition"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <Link
                href="/onboarding"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs sm:text-sm uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <span>Lưu thực đơn & Khởi tạo lộ trình cá nhân →</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Voice NLP Sandbox */
          <div className="bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl space-y-8">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-black">
                Vietnamese Speech & Text NLP Parser
              </span>
              <h3 className="text-2xl font-black uppercase text-white">
                Bóc tách ngôn từ dân dã thành số gram chuẩn
              </h3>
              <p className="text-zinc-400 text-sm">
                Người Việt thường nói: <em>&ldquo;2 quả trứng&rdquo;, &ldquo;nửa chén cơm&rdquo;, &ldquo;1 tô phở&rdquo;</em>. Hệ thống tự động nhận dạng quy đổi sang trọng lượng tương đương.
              </p>
            </div>

            {/* Voice Sample Tabs */}
            <div className="grid sm:grid-cols-3 gap-4">
              {VOICE_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveVoiceIdx(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    activeVoiceIdx === idx
                      ? 'bg-emerald-500/15 border-emerald-500 shadow-lg text-white'
                      : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
                    <Mic size={14} />
                    <span>Mẫu giọng nói {idx + 1}</span>
                  </div>
                  <p className="text-xs font-bold leading-relaxed line-clamp-2">
                    &ldquo;{sample.spoken}&rdquo;
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-white/5 pt-2">
                    <span>{sample.tokens.length} món ăn</span>
                    <span className="text-emerald-300 font-bold">{sample.totalCal} kcal</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Current Voice Result Breakdown */}
            <div className="bg-[#07090E] border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="p-4 rounded-2xl bg-zinc-900/90 border border-emerald-500/30 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Mic size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                    Câu nói người dùng:
                  </p>
                  <p className="text-sm sm:text-base font-black text-white mt-0.5">
                    &ldquo;{currentVoice?.spoken}&rdquo;
                  </p>
                </div>
              </div>

              {/* Total Macros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-900 border border-white/5 text-center">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">Tổng Calo</p>
                  <p className="text-xl font-black text-white mt-1">{currentVoice?.totalCal} kcal</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-rose-400 font-bold">Protein</p>
                  <p className="text-xl font-black text-rose-300 mt-1">{currentVoice?.totalP}g</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">Carbs</p>
                  <p className="text-xl font-black text-amber-300 mt-1">{currentVoice?.totalC}g</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-sky-400 font-bold">Fat</p>
                  <p className="text-xl font-black text-sky-300 mt-1">{currentVoice?.totalF}g</p>
                </div>
              </div>

              {/* Parsed Items */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
                  Kết quả thuật toán NLP bóc tách:
                </p>
                {currentVoice?.tokens.map((token, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-zinc-900/70 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div>
                      <span className="text-[11px] font-semibold text-zinc-400 block">
                        Cụm từ gốc: &ldquo;{token.raw}&rdquo;
                      </span>
                      <span className="font-bold text-white text-sm sm:text-base mt-0.5 block">
                        ➔ Quy đổi: {token.parsed}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-300 font-semibold self-end sm:self-center">
                      <span className="text-rose-400 font-bold">P: {token.p}</span>
                      <span className="text-amber-400 font-bold">C: {token.c}</span>
                      <span className="text-sky-400 font-bold">F: {token.f}</span>
                      <span className="px-2.5 py-1 rounded bg-zinc-800 text-emerald-400 font-black">
                        {token.cal} kcal
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. THE 4 CORE ARSENAL PILLARS */}
      {/* ========================================================================= */}
      <section id="pillars" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Layers size={14} />
            <span>Hệ Thống Vũ Khí Toàn Diện</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            4 Trụ Cột Đột Phá Cho <br />
            <span className="text-emerald-400">Gymer & Huấn Luyện Viên Cá Nhân</span>
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Tất cả những gì bạn cần để kiểm soát thể hình, từ dinh dưỡng, giáo án tập luyện đến quản trị chuyên sâu.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Smart Meal Planner */}
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-emerald-500/50 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Apple size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">
                Smart AI Meal Planner
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Thuật toán Knapsack Heuristic tự động phân bổ món ăn vào các bữa Sáng, Trưa, Tối, Phụ đạt chuẩn 100% Protein, cân đối vi chất theo TDEE và né thực phẩm dị ứng.
              </p>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                Chuẩn hóa Macro TDEE <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Pillar 2: 1:1 PT Ecosystem */}
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-teal-500/50 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Dumbbell size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">
                PT 1:1 Ecosystem
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Mời học viên qua QR Code linh hoạt số buổi (12, 16, 24, 36...), xếp lịch tập thông minh, giao bài tập kèm ảnh động minh họa và điểm danh trừ buổi bằng Atomic Transaction.
              </p>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
              <span className="text-xs font-bold text-teal-400 flex items-center gap-1">
                Check-in QR an toàn <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Pillar 3: InBody & Transformation */}
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-orange-500/50 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">
                InBody & Transformation
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Biểu đồ InBody dạng Stock Chart chuyên nghiệp phân tích Cân nặng, % Mỡ và Khối lượng cơ xương (SMM). Thanh trượt tương tác so sánh ảnh vóc dáng Before/After.
              </p>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
              <span className="text-xs font-bold text-orange-400 flex items-center gap-1">
                Theo dõi Cơ - Mỡ thời gian thực <ChevronRight size={14} />
              </span>
            </div>
          </div>

          {/* Pillar 4: Enterprise Security */}
          <div className="p-6 rounded-3xl bg-zinc-900/70 border border-white/10 hover:border-sky-500/50 transition-all group flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-wide">
                Bảo Mật Đầu Cuối (E2E)
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Mã hóa Payload 2 chiều bằng thuật toán AES-256-GCM, cơ chế tự động xoay vòng Token (Silent Refresh) và che giấu thông tin nhận diện cá nhân trong hệ thống Audit Logs.
              </p>
            </div>
            <div className="pt-6 border-t border-white/5 mt-6">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                Chuẩn mã hóa quân sự <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE ROLE EXPERIENCE SWITCHER */}
      {/* ========================================================================= */}
      <section id="roles" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-zinc-900/80 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white">
                Trải nghiệm thiết kế riêng cho từng vị trí
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                Phân quyền chuyên sâu đảm bảo tính tiện dụng cho cả Người tập, PT và Nhà quản trị.
              </p>
            </div>

            {/* Role Tab Buttons */}
            <div className="flex p-1.5 rounded-2xl bg-[#07090E] border border-white/10">
              <button
                onClick={() => setActiveRoleTab('student')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeRoleTab === 'student'
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>💪 Học viên</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('pt')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeRoleTab === 'pt'
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>📋 PT Coach</span>
              </button>
              <button
                onClick={() => setActiveRoleTab('admin')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeRoleTab === 'admin'
                    ? 'bg-emerald-500 text-black shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>⚙️ Quản trị (Admin)</span>
              </button>
            </div>
          </div>

          {/* Role Tab Content */}
          <div className="grid sm:grid-cols-3 gap-6 pt-8">
            {activeRoleTab === 'student' && (
              <>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-emerald-400 font-black text-sm uppercase">01. Onboarding Khảo Sát</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Tính toán BMR, TDEE, lượng thâm hụt calo và khai báo danh sách thực phẩm dị ứng chỉ sau 1 phút.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-emerald-400 font-black text-sm uppercase">02. Log Ăn Nhanh Bằng AI</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Chụp ảnh bữa ăn hoặc nói qua mic, xem ngay bảng dinh dưỡng và giữ chuỗi Streak kỷ luật mỗi ngày.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-emerald-400 font-black text-sm uppercase">03. Tập Theo Giáo Án PT</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Xem ảnh hướng dẫn bài tập, quét mã QR điểm danh buổi tập và xem biểu đồ InBody thay đổi thể hình.
                  </p>
                </div>
              </>
            )}

            {activeRoleTab === 'pt' && (
              <>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-teal-400 font-black text-sm uppercase">01. Phát Mã Mời Học Viên</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Tùy chọn số buổi gói tập (12, 16, 24, 36...) và tạo mã QR để học viên quét liên kết ngay tại phòng tập.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-teal-400 font-black text-sm uppercase">02. Lịch Dạy & Check-in</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Quản lý toàn bộ ca dạy trên lưới lịch tháng, điểm danh trừ buổi tập an toàn chống gian lận.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-teal-400 font-black text-sm uppercase">03. Giao Bài & Giám Sát Ăn</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Chỉ định thực đơn, duyệt nhật ký ăn uống và theo dõi biến đổi cơ mỡ của từng học viên trên 1 bảng điều khiển.
                  </p>
                </div>
              </>
            )}

            {activeRoleTab === 'admin' && (
              <>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-amber-400 font-black text-sm uppercase">01. Phê Duyệt Huấn Luyện Viên</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Xem hồ sơ bằng cấp, chứng chỉ thể hình và phê duyệt quyền hoạt động huấn luyện viên trên hệ thống.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-amber-400 font-black text-sm uppercase">02. Thư Viện Toàn Cầu</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
                    Quản trị danh mục thực phẩm Việt Nam và kho bài tập chuẩn kỹ thuật với hình ảnh minh họa chất lượng cao.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#07090E] border border-white/5 space-y-2">
                  <p className="text-amber-400 font-black text-sm uppercase">03. Thống Kê & Báo Cáo</p>
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed">
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
      <section id="comparison" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest">
            <Scale size={14} />
            <span>Sự Khác Biệt Rõ Rệt</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            NutriCore vs Phương Pháp Truyền Thống
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base">
            Tại sao phương pháp thủ công khiến bạn dễ bỏ cuộc và cách NutriCore giải phóng bạn khỏi áp lực ăn kiêng.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-white/15">
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-400 font-bold w-1/3">
                  Tiêu chí so sánh
                </th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-zinc-400 font-bold w-1/3 bg-zinc-900/40">
                  Phương pháp truyền thống
                </th>
                <th className="py-4 px-6 text-xs uppercase tracking-wider text-emerald-400 font-black w-1/3 bg-emerald-950/30 border-l border-emerald-500/30">
                  ⚡ NutriCore AI Platform
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs sm:text-sm">
              <tr>
                <td className="py-5 px-6 font-bold text-white">1. Ghi nhận bữa ăn</td>
                <td className="py-5 px-6 text-zinc-400 bg-zinc-900/40">
                  Cân tiểu ly từng lạng, mở Excel hoặc app tiếng Anh gõ tìm mỏi mắt.
                </td>
                <td className="py-5 px-6 text-emerald-300 font-semibold bg-emerald-950/30 border-l border-emerald-500/30">
                  Chụp 1 tấm ảnh hoặc nói 1 câu tự nhiên. AI bóc tách món Việt trong 1s.
                </td>
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-white">2. Cân bằng dinh dưỡng Macro</td>
                <td className="py-5 px-6 text-zinc-400 bg-zinc-900/40">
                  Tính nhẩm cảm tính, thường xuyên thiếu Protein và thừa Fat ẩn.
                </td>
                <td className="py-5 px-6 text-emerald-300 font-semibold bg-emerald-950/30 border-l border-emerald-500/30">
                  Thuật toán Knapsack Heuristic tối ưu chuẩn $\ge 100\%$ Protein theo TDEE.
                </td>
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-white">3. Tương tác với Huấn luyện viên</td>
                <td className="py-5 px-6 text-zinc-400 bg-zinc-900/40">
                  Nhắn tin Zalo/Messenger rời rạc, trôi tin nhắn, khó kiểm tra lịch tập.
                </td>
                <td className="py-5 px-6 text-emerald-300 font-semibold bg-emerald-950/30 border-l border-emerald-500/30">
                  Đồng bộ 1 chạm qua mã QR, lịch tập và bài tập đồng bộ thời gian thực.
                </td>
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-white">4. Đánh giá sự tiến bộ</td>
                <td className="py-5 px-6 text-zinc-400 bg-zinc-900/40">
                  Chỉ nhìn cân nặng, không phân biệt được đang giảm mỡ hay mất cơ.
                </td>
                <td className="py-5 px-6 text-emerald-300 font-semibold bg-emerald-950/30 border-l border-emerald-500/30">
                  Biểu đồ InBody Stock Chart & Thanh trượt so sánh ảnh Before/After.
                </td>
              </tr>
              <tr>
                <td className="py-5 px-6 font-bold text-white">5. Bảo mật dữ liệu cá nhân</td>
                <td className="py-5 px-6 text-zinc-400 bg-zinc-900/40">
                  Ảnh hình thể và thông tin sức khỏe dễ bị lộ qua các nhóm chat công khai.
                </td>
                <td className="py-5 px-6 text-emerald-300 font-semibold bg-emerald-950/30 border-l border-emerald-500/30">
                  Mã hóa đầu cuối AES-256-GCM, tự động ẩn thông tin nhạy cảm.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. PWA & MOBILE NATIVE SHOWCASE */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-14">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase">
                <Smartphone size={14} />
                <span>PWA & Android Native App</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black uppercase text-white leading-tight">
                Mang NutriCore vào túi quần. <br />
                <span className="text-emerald-400">Tập luyện mọi lúc, mọi nơi.</span>
              </h2>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                Ứng dụng được tối ưu mượt mà cho mọi thiết bị di động. Cài đặt trực tiếp lên màn hình chính điện thoại chỉ với 1 chạm (Progressive Web App) hoặc sử dụng file cài đặt Android Native với quyền truy cập Camera và Microphone phần cứng.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Cài đặt trực tiếp không qua kho ứng dụng rườm rà (Add to Home Screen).</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Web Push Notification nhắc nhở giờ tập và uống nước tự động.</span>
                </div>
                <div className="flex items-center gap-3 text-xs sm:text-sm text-zinc-300">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  <span>Chế độ ngoại tuyến (Offline Ready) nạp dữ liệu tức thì.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                <Link
                  href="/onboarding"
                  className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2"
                >
                  <Smartphone size={16} />
                  <span>Mở trên điện thoại ngay</span>
                </Link>
              </div>
            </div>

            {/* Mobile Mockup Presentation */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-64 sm:w-72 h-[480px] sm:h-[520px] rounded-[40px] border-4 border-zinc-700 bg-black p-3 shadow-2xl overflow-hidden">
                {/* Phone Speaker Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-zinc-900 rounded-full z-20" />

                {/* Mock Phone Screen Content */}
                <div className="w-full h-full rounded-[30px] overflow-hidden bg-[#06080C] pt-8 p-3 flex flex-col justify-between text-xs border border-white/5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-black text-emerald-400">NutriCore App</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900 border border-white/10 space-y-1.5">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold">Mục tiêu hôm nay</p>
                      <p className="text-lg font-black text-white">2,150 / 2,400 kcal</p>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="bg-emerald-400 h-full w-[90%]" />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-center gap-2.5">
                      <Camera size={18} className="text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white text-[11px]">Chụp ảnh nhận diện món</p>
                        <p className="text-[10px] text-zinc-400">AI tự tính Calo & Gram</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center gap-2.5">
                      <QrCode size={18} className="text-teal-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white text-[11px]">Mã QR Điểm Danh Buổi Tập</p>
                        <p className="text-[10px] text-zinc-400">Coach Đào Trần (12/12 buổi)</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-500 text-black font-black text-center text-[11px] uppercase tracking-wider">
                    Đã Đồng Bộ Dữ Liệu
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FAQ ACCORDION SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-black">
            Giải Đáp Thắc Mắc
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-zinc-400 text-sm">
            Tất cả những điều bạn cần biết trước khi bắt đầu hành trình thể hình cùng NutriCore.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-zinc-900/60 border border-white/10 overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-emerald-400 transition"
              >
                <span>{item.q}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-400' : 'text-zinc-400'}`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-white/5 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. BOTTOM FINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-emerald-500/40 p-8 sm:p-14 text-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-zinc-900 to-black z-0" />
          <div className="relative z-10 space-y-6">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/40">
              Khởi Đầu Ngay Hôm Nay
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Kỷ luật tạo nên hình thể. <br />
              <span className="text-emerald-400">Dữ liệu tạo nên kết quả.</span>
            </h2>
            <p className="text-zinc-300 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
              Trải nghiệm toàn bộ sức mạnh của NutriCore hoàn toàn miễn phí. Thiết lập chỉ số cơ thể của bạn và bắt đầu hành trình thay đổi vóc dáng ngay hôm nay.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm sm:text-base uppercase tracking-wider transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
              >
                <Flame size={18} />
                <span>Thiết lập TDEE của tôi ngay</span>
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-white/15 text-white font-bold text-sm sm:text-base uppercase tracking-wider transition text-center"
              >
                Tôi đã có tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PROFESSIONAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-white/10 py-12 text-xs text-zinc-400 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black text-sm">
                N
              </div>
              <span className="font-black text-base uppercase text-white tracking-wider">
                Nutri<span className="text-emerald-400">core</span>
              </span>
              <span className="text-[10px] text-zinc-500 border-l border-zinc-700 pl-3">
                FitManagementPlatform
              </span>
            </div>

            <div className="flex flex-wrap gap-6 font-bold uppercase tracking-wider text-[11px]">
              <a href="#ai-scanner" className="hover:text-emerald-400 transition">AI Scanner</a>
              <a href="#pillars" className="hover:text-emerald-400 transition">Hệ thống</a>
              <a href="#roles" className="hover:text-emerald-400 transition">Vai trò</a>
              <a href="#faq" className="hover:text-emerald-400 transition">Hỏi đáp</a>
              <Link href="/login" className="hover:text-emerald-400 transition">Đăng nhập</Link>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-[11px]">
            <p>© 2026 NUTRICORE — FIT MANAGEMENT PLATFORM. ALL RIGHTS RESERVED.</p>
            <p className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Hệ thống hoạt động ổn định 99.9%</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
