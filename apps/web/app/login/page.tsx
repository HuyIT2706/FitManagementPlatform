'use client';

import { ArrowLeft, Eye, EyeOff, User, Dumbbell, Award, Briefcase, Info, Upload } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import LogoApp from '../../assets/imgs/logoApp.jpg';
import apiClient from '../../api/axios';

import { handleRoleRedirect } from '../../utils/authRedirect';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

function LoginContent() {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'USER' | 'PT'>('USER');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // PT specific fields
  const [avatarUrl, setAvatarUrl] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(2);
  const [specialties, setSpecialties] = useState('Tăng cơ, Giảm mỡ, Calisthenics');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingPtNotice, setPendingPtNotice] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      apiClient
        .get<{ role: string; onboardingCompleted: boolean }>('/users/me')
        .then((res) => {
          handleRoleRedirect(res.data);
        })
        .catch(() => {
          localStorage.removeItem('jwt_token');
        });
    }
  }, []);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        if (!tokenResponse.access_token) {
          throw new Error('Không nhận được token từ Google. Vui lòng thử lại.');
        }

        setLoading(true);
        setError('');
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        const response = await apiClient.post('/auth/google', {
          token: tokenResponse.access_token,
          userInfo,
        });
        const data = response.data;
        localStorage.setItem('jwt_token', data.access_token);

        handleRoleRedirect(data.user);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Đăng nhập Google thất bại');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPendingPtNotice(null);

    try {
      if (authMode === 'LOGIN') {
        const response = await apiClient.post('/auth/login', { email, password }).catch((err: { response?: { data?: { message?: string } } }) => {
          throw new Error(err.response?.data?.message || 'Sai email hoặc mật khẩu');
        });
        const data = response.data;
        localStorage.setItem('jwt_token', data.access_token);

        if (data.isPendingPtApproval) {
          setPendingPtNotice(
            'Tài khoản PT của bạn đã đăng ký thành công và đang chờ Admin kiểm duyệt trước khi truy cập giao diện PT!'
          );
          setLoading(false);
          return;
        }

        handleRoleRedirect(data.user);
      } else {
        // Register Mode
        const payload = {
          email,
          password,
          fullName,
          avatarUrl: avatarUrl.trim() || undefined,
          role,
          ...(role === 'PT' && {
            experienceYears,
            specialties: specialties.split(',').map((s) => s.trim()),
            bio,
          }),
        };

        const response = await apiClient.post('/auth/register', payload).catch((err: { response?: { data?: { message?: string } } }) => {
          throw new Error(err.response?.data?.message || 'Không thể đăng ký tài khoản');
        });
        const data = response.data;
        localStorage.setItem('jwt_token', data.access_token);

        if (role === 'PT') {
          setPendingPtNotice(
            'Đã gửi đơn đăng ký làm Huấn luyện viên PT! Hồ sơ của bạn đang chờ Admin kiểm duyệt.'
          );
        } else {
          window.location.href = '/onboarding';
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between overflow-x-hidden relative">
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 100%)',
        }}
      />

      <header className="w-full sticky top-0 z-50 flex items-center p-4">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-surface-container/50 backdrop-blur-md border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors active:scale-95 text-on-surface"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 max-w-md mx-auto w-full z-10 space-y-5 my-auto">
        <section className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-surface-container-high border border-primary p-2 shadow-[0_0_24px_rgba(78,222,163,0.15)] relative overflow-hidden flex items-center justify-center">
            <Image
              alt="NutriCore Logo"
              className="w-full h-full object-cover rounded-xl"
              src={LogoApp}
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-heading text-on-surface">
              NutriCore Platform
            </h1>
            <p className="text-xs text-on-surface-variant px-4">
              Nền tảng quản lý tập luyện & dinh dưỡng thông minh dành cho Học viên và PT.
            </p>
          </div>
        </section>

        {/* Mode Switcher: Login vs Register */}
        <div className="flex bg-surface-bright/40 p-1.5 rounded-2xl border border-white/10 w-full">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setAuthMode('LOGIN');
              setError('');
              setPendingPtNotice(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === 'LOGIN'
                ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => {
              setAuthMode('REGISTER');
              setError('');
              setPendingPtNotice(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              authMode === 'REGISTER'
                ? 'bg-primary text-dark-slate shadow-[0_0_12px_rgba(102,200,28,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* Role Switcher in Register Mode */}
        {authMode === 'REGISTER' && (
          <div className="w-full space-y-1.5">
            <label className="block text-[11px] font-semibold text-on-surface-variant text-center">
              Bạn đăng ký với vai trò:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRole('USER')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'USER'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(102,200,28,0.25)]'
                    : 'border-white/10 bg-surface-bright/20 text-on-surface-variant hover:bg-surface-bright/40'
                }`}
              >
                <User size={16} /> Học Viên
              </button>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setRole('PT')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  role === 'PT'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(102,200,28,0.25)]'
                    : 'border-white/10 bg-surface-bright/20 text-on-surface-variant hover:bg-surface-bright/40'
                }`}
              >
                <Dumbbell size={16} /> HLV PT
              </button>
            </div>
          </div>
        )}

        <section className="w-full space-y-4">
          {error && (
            <div className="w-full p-3 text-xs text-red-300 bg-red-500/20 border border-red-500/40 rounded-xl text-center font-semibold">
              {error}
            </div>
          )}

          {pendingPtNotice && (
            <div className="w-full p-4 text-xs text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-center space-y-2">
              <Info size={24} className="mx-auto text-amber-400" />
              <p className="font-bold leading-relaxed">{pendingPtNotice}</p>
            </div>
          )}

          {/* Main Direct Auth Form */}
          <form
            onSubmit={handleSubmit}
            className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-200"
          >
            {authMode === 'REGISTER' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-on-surface-variant">
                  Họ và Tên (*):
                </label>
                <input
                  type="text"
                  required
                  suppressHydrationWarning
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs text-on-surface"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant">
                Địa chỉ Email (*):
              </label>
              <input
                type="email"
                required
                suppressHydrationWarning
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs text-on-surface"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-on-surface-variant">
                Mật khẩu (*):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  suppressHydrationWarning
                  placeholder="Mật khẩu bảo mật"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 rounded-xl bg-surface-container border border-outline-variant focus:border-primary outline-none text-xs text-on-surface"
                />
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* PT Specific Application Fields */}
            {authMode === 'REGISTER' && role === 'PT' && (
              <div className="p-4 rounded-2xl bg-surface-bright/30 border border-primary/30 space-y-3 pt-3">
                <div className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase">
                  <Award size={16} /> Hồ sơ Đăng ký Huấn luyện viên (PT):
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-on-surface-variant">
                    Ảnh đại diện HLV (Tải từ máy):
                  </label>
                  <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-xl border border-white/10">
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/50 bg-black/60 flex items-center justify-center shrink-0">
                      {avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <User size={20} className="text-white/40" />
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/25 transition-all">
                        <Upload size={14} />
                        {avatarUrl ? 'Đổi ảnh đại diện' : 'Chọn ảnh từ máy'}
                        <input
                          type="file"
                          accept="image/*"
                          suppressHydrationWarning
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = document.createElement('img');
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  let width = img.width;
                                  let height = img.height;
                                  const maxDim = 400;

                                  if (width > height) {
                                    if (width > maxDim) {
                                      height = Math.round((height * maxDim) / width);
                                      width = maxDim;
                                    }
                                  } else {
                                    if (height > maxDim) {
                                      width = Math.round((width * maxDim) / height);
                                      height = maxDim;
                                    }
                                  }

                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                      {avatarUrl && (
                        <button
                          type="button"
                          suppressHydrationWarning
                          onClick={() => setAvatarUrl('')}
                          className="ml-2 text-[11px] text-rose-400 hover:underline inline-block font-semibold cursor-pointer"
                        >
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface-variant">
                    Số năm kinh nghiệm:
                  </label>
                  <div className="relative">
                    <Briefcase
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
                    />
                    <input
                      type="number"
                      min="1"
                      suppressHydrationWarning
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full h-9 pl-9 pr-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface-variant">
                    Chuyên môn chính:
                  </label>
                  <input
                    type="text"
                    suppressHydrationWarning
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    placeholder="Tăng cơ, Giảm mỡ, Calisthenics"
                    className="w-full h-9 px-3 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-on-surface-variant">
                    Giới thiệu ngắn (Bio):
                  </label>
                  <textarea
                    rows={2}
                    suppressHydrationWarning
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Giới thiệu kinh nghiệm và phong cách huấn luyện của bạn..."
                    className="w-full p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-none resize-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              suppressHydrationWarning
              disabled={loading}
              className="w-full h-12 rounded-full bg-primary text-dark-slate font-extrabold flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(102,200,28,0.4)] text-sm mt-2"
            >
              {loading
                ? 'Đang xử lý...'
                : authMode === 'LOGIN'
                ? 'Đăng nhập'
                : role === 'PT'
                ? 'Đăng ký làm HLV PT (Chờ Duyệt)'
                : 'Tạo tài khoản Học viên'}
            </button>
          </form>

          {/* Divider HOẶC */}
          <div className="flex items-center w-full pt-1">
            <div className="flex-1 h-px bg-outline-variant/40"></div>
            <span className="px-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
              hoặc
            </span>
            <div className="flex-1 h-px bg-outline-variant/40"></div>
          </div>

          {/* Google Login Button below form */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => googleLogin()}
            disabled={loading}
            className="w-full h-11 rounded-full bg-surface-container/80 backdrop-blur-md border border-outline-variant flex items-center justify-center space-x-3 hover:bg-surface-variant transition-colors active:scale-95 disabled:opacity-50 cursor-pointer text-xs"
          >
            <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
              <path
                d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.74 17.58V20.35H19.31C21.4 18.42 22.56 15.6 22.56 12.25Z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23C14.97 23 17.46 22.02 19.31 20.35L15.74 17.58C14.74 18.25 13.48 18.66 12 18.66C9.13001 18.66 6.70001 16.72 5.84001 14.12H2.15002V16.99C3.97002 20.61 7.74001 23 12 23Z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.12C5.62 13.46 5.5 12.75 5.5 12C5.5 11.25 5.62 10.54 5.84 9.88V7.01H2.15C1.4 8.52 1 10.21 1 12C1 13.79 1.4 15.48 2.15 16.99L5.84 14.12Z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.34C13.62 5.34 15.06 5.89 16.2 6.98L19.39 3.79C17.45 1.99 14.96 1 12 1C7.74001 1 3.97002 3.39 2.15002 7.01L5.84001 9.88C6.70001 7.28 9.13001 5.34 12 5.34Z"
                fill="#EA4335"
              ></path>
            </svg>
            <span className="text-xs font-semibold text-on-surface">Tiếp tục với Google</span>
          </button>
        </section>
      </main>

      <footer className="w-full px-4 py-3 text-center space-y-1.5 z-10 pb-6">
        <p className="text-xs font-medium text-on-surface-variant max-w-xs mx-auto leading-relaxed opacity-75">
          Tự động đồng bộ hệ thống Dinh dưỡng & Thể hình NutriCore
        </p>
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginContent />
    </GoogleOAuthProvider>
  );
}
