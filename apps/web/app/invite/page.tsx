'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Dumbbell,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import apiClient from '../../api/axios';
import { toast } from '../../utils/toast';
import { isAxiosError } from 'axios';

// ---------------------------------------------------------------------------
// Reusable error message extractor — replaces unsafe manual type casting
// ---------------------------------------------------------------------------
function getApiErrorMessage(err: unknown, fallback = ''): string {
  if (isAxiosError(err)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return (err.response?.data as { message?: string })?.message || err.message || fallback;
  }
  return fallback;
}

function InviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const code = searchParams.get('code') || '';
  const ptId = searchParams.get('pt') || '';
  const ptCode = searchParams.get('ptCode') || '';

  const [status, setStatus] = useState<
    'IDLE' | 'UNAUTHENTICATED' | 'BINDING' | 'SUCCESS' | 'ALREADY_BOUND' | 'ERROR'
  >('IDLE');
  const [message, setMessage] = useState<string>('');

  // AbortController ref to cancel in-flight request if component unmounts
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('jwt_token')
        : null;
    const bindTarget = ptId || code || ptCode;

    if (!token) {
      setStatus('UNAUTHENTICATED');
      return;
    }

    if (!bindTarget) {
      setStatus('ERROR');
      setMessage('Mã mời không hợp lệ hoặc đường link không đầy đủ thông tin.');
      return;
    }

    // Create a new AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('BINDING');
    apiClient
      .post<{ message?: string }>(
        '/pt/students/bind',
        { ptCodeOrInviteCode: bindTarget },
        { signal: controller.signal }
      )
      .then((res) => {
        setStatus('SUCCESS');
        setMessage(
          res.data?.message ||
            'Chúc mừng bạn đã kết nối thành công với Huấn Luyện Viên! Gói tập và thực đơn đã sẵn sàng.'
        );
        toast.success('Kết nối thành công với Huấn luyện viên!');
      })
      .catch((err: unknown) => {
        // Ignore cancellation — component unmounted while request was in-flight
        if (isAxiosError(err) && err.code === 'ERR_CANCELED') return;

        const errMsg = getApiErrorMessage(err);
        if (
          errMsg.toLowerCase().includes('đã có') ||
          errMsg.toLowerCase().includes('already')
        ) {
          setStatus('ALREADY_BOUND');
          setMessage(errMsg || 'Bạn hiện đã có Huấn Luyện Viên đồng hành.');
        } else {
          setStatus('ERROR');
          setMessage(
            errMsg ||
              'Không thể liên kết với mã mời này. Vui lòng kiểm tra lại!'
          );
        }
      });

    // Cleanup: abort the request when component unmounts or deps change
    return () => {
      controller.abort();
    };
  }, [code, ptId, ptCode]);

  const handleLoginRedirect = (mode = 'login') => {
    // Use Next.js hooks instead of window.location to stay framework-consistent
    const currentPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    router.push(
      `/login?redirect=${encodeURIComponent(currentPath)}${
        mode === 'register' ? '&mode=register' : ''
      }`
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-md bg-surface border border-outline rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-outline/50 flex items-center justify-center bg-black/40">
            <Image
              src={LogoApp}
              alt="NutriCore Logo"
              width={64}
              height={64}
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide flex items-center justify-center gap-2">
              NutriCore
              <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium">
                VIP 1-1
              </span>
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Hệ Sinh Thái Tập Luyện & Dinh Dưỡng Cá Nhân Hóa
            </p>
          </div>
        </div>

        {/* Content based on status */}
        {status === 'UNAUTHENTICATED' && (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <UserPlus className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Lời Mời Liên Kết Huấn Luyện Viên
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Bạn nhận được lời mời tham gia gói huấn luyện cá nhân 1:1 từ Huấn
                Luyện Viên của bạn trên NutriCore.
              </p>
            </div>

            {code && (
              <div className="inline-block bg-surface-container border border-outline/60 px-4 py-2 rounded-xl">
                <span className="text-xs text-on-surface-variant block uppercase tracking-wider font-semibold">
                  Mã kích hoạt
                </span>
                <span className="text-base font-mono font-bold text-primary">
                  {code}
                </span>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => handleLoginRedirect('login')}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              >
                Đăng Nhập Để Nhận Gói Tập
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleLoginRedirect('register')}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-surface-container border border-outline hover:border-primary/40 text-on-surface transition-all text-sm cursor-pointer"
              >
                Chưa có tài khoản? Đăng ký ngay
              </button>
            </div>
          </div>
        )}

        {status === 'BINDING' && (
          <div className="py-8 space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <h2 className="text-base font-bold text-white">
              Đang xác thực và kích hoạt liên kết...
            </h2>
            <p className="text-xs text-on-surface-variant">
              Vui lòng giữ kết nối mạng trong giây lát.
            </p>
          </div>
        )}

        {status === 'SUCCESS' && (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400 shadow-lg shadow-green-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center justify-center gap-2">
                Liên Kết Thành Công!
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {message ||
                  'Bạn đã kết nối thành công với Huấn Luyện Viên. Bắt đầu lộ trình tập luyện và dinh dưỡng chuyên nghiệp ngay hôm nay!'}
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => router.push('/training')}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                Vào Phòng Tập Ngay
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-surface-container border border-outline hover:border-primary/40 text-on-surface transition-all text-sm cursor-pointer"
              >
                Trang Chủ NutriCore
              </button>
            </div>
          </div>
        )}

        {status === 'ALREADY_BOUND' && (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Đã Có Huấn Luyện Viên
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {message ||
                  'Tài khoản của bạn đã được kết nối với Huấn Luyện Viên phụ trách.'}
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => router.push('/training')}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary-dark text-black transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Dumbbell className="w-4 h-4" />
                Xem Kế Hoạch Tập Luyện
              </button>
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="w-full py-3 px-4 rounded-xl font-semibold bg-surface-container border border-outline text-on-surface transition-all text-sm cursor-pointer"
              >
                Quay Về Trang Chủ
              </button>
            </div>
          </div>
        )}

        {status === 'ERROR' && (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Không Thể Kích Hoạt
              </h2>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                {message ||
                  'Mã mời không tồn tại, đã hết hạn hoặc đã được sử dụng.'}
              </p>
            </div>
            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="w-full py-3.5 px-4 rounded-xl font-bold bg-surface-container border border-outline hover:border-primary/40 text-white transition-all cursor-pointer"
              >
                Về Trang Chủ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
