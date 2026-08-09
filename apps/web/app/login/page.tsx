/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import LogoApp from '../../assets/imgs/logoApp.jpg';

// You must set this in your environment variables
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

function LoginContent() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      // Typically, for backend verification, we need an id_token or send access_token to userinfo endpoint.
      // @react-oauth/google's useGoogleLogin without flow="auth-code" returns access_token.
      // To get id_token easily, you can use the <GoogleLogin /> component, 
      // but since we are designing a custom button, we fetch user info or change flow.
      
      try {
        if (!tokenResponse.access_token) {
          throw new Error('Không nhận được token từ Google. Vui lòng thử lại.');
        }
        
        setLoading(true);
        setError('');
        // Fetch user info from Google
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then(res => res.json());
        
        // Example only: If you want to use the backend `verifyIdToken` endpoint, 
        // you would need flow: 'auth-code' or use the implicit flow token depending on your setup.
        // For standard JWT API:
        const response = await fetch('http://localhost:3100/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token, userInfo }), 
          // Note: Backend might need to be adjusted to accept access_token instead of id_token
        });

        if (!response.ok) throw new Error('Google Login Failed');

        const data = await response.json();
        localStorage.setItem('jwt_token', data.access_token);
        
        if (data.user?.onboardingCompleted === false) {
          window.location.href = '/onboarding';
        } else {
          window.location.href = '/';
        }
      } catch (err: any) {
        setError(err.message || 'Đã có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Đăng nhập Google thất bại');
    },
  });

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3100/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Sai email hoặc mật khẩu');
      }

      const data = await response.json();
      localStorage.setItem('jwt_token', data.access_token);
      
      // Redirect based on onboarding status
      if (data.user?.onboardingCompleted === false) {
        window.location.href = '/onboarding';
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between overflow-x-hidden relative">
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 100%)' }}
      />
      
      <header className="w-full sticky top-0 z-50 flex items-center p-4">
        <Link href="/">
          <button className="w-10 h-10 rounded-full bg-surface-container/50 backdrop-blur-md border border-outline-variant flex items-center justify-center hover:bg-surface-variant transition-colors active:scale-95 text-on-surface">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center items-center px-4 max-w-md mx-auto w-full z-10 space-y-10">
        
        <section className="flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-2xl bg-surface-container-high border border-primary p-2 shadow-[0_0_24px_rgba(78,222,163,0.15)] relative overflow-hidden flex items-center justify-center">
            <Image 
              alt="NutriCore Logo" 
              className="w-full h-full object-cover rounded-xl" 
              src={LogoApp} 
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-on-surface">
              Trợ lý dinh dưỡng cá nhân của bạn
            </h1>
            <p className="text-base text-on-surface-variant px-4">
              Lên kế hoạch dinh dưỡng cá nhân hóa, tối ưu lịch tập và bứt phá giới hạn thể hình của bạn.
            </p>
          </div>
        </section>

        <section className="w-full space-y-6">
          {error && (
            <div className="w-full p-3 text-sm text-on-error bg-error/20 border border-error rounded-xl text-center">
              {error}
            </div>
          )}

          {!showEmailForm ? (
            <>
              <button 
                onClick={() => googleLogin()}
                disabled={loading}
                className="w-full h-12 rounded-full bg-surface-container/80 backdrop-blur-md border border-outline-variant flex items-center justify-center space-x-3 hover:bg-surface-variant transition-colors active:scale-95 disabled:opacity-50"
              >
                <svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.81 15.74 17.58V20.35H19.31C21.4 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"></path>
                  <path d="M12 23C14.97 23 17.46 22.02 19.31 20.35L15.74 17.58C14.74 18.25 13.48 18.66 12 18.66C9.13001 18.66 6.70001 16.72 5.84001 14.12H2.15002V16.99C3.97002 20.61 7.74001 23 12 23Z" fill="#34A853"></path>
                  <path d="M5.84 14.12C5.62 13.46 5.5 12.75 5.5 12C5.5 11.25 5.62 10.54 5.84 9.88V7.01H2.15C1.4 8.52 1 10.21 1 12C1 13.79 1.4 15.48 2.15 16.99L5.84 14.12Z" fill="#FBBC05"></path>
                  <path d="M12 5.34C13.62 5.34 15.06 5.89 16.2 6.98L19.39 3.79C17.45 1.99 14.96 1 12 1C7.74001 1 3.97002 3.39 2.15002 7.01L5.84001 9.88C6.70001 7.28 9.13001 5.34 12 5.34Z" fill="#EA4335"></path>
                </svg>
                <span className="text-sm font-semibold text-on-surface">Tiếp tục với Google</span>
              </button>

              <div className="flex items-center w-full">
                <div className="flex-1 h-px bg-outline-variant/50"></div>
                <span className="px-4 text-xs font-medium text-on-surface-variant uppercase tracking-wider">hoặc</span>
                <div className="flex-1 h-px bg-outline-variant/50"></div>
              </div>

              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full h-12 rounded-full bg-surface-container/80 backdrop-blur-md border border-outline-variant flex items-center justify-center space-x-3 hover:bg-surface-variant transition-colors active:scale-95"
              >
                <Mail className="w-5 h-5 text-on-surface-variant" />
                <span className="text-sm font-semibold text-on-surface">Tiếp tục với Email</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="w-full space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                  required
                />
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none text-on-surface placeholder:text-on-surface-variant/50 transition-all"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex flex-col space-y-3">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold hover:bg-primary/90 transition-colors active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Quay lại
                </button>
              </div>
            </form>
          )}
        </section>
      </main>

      <footer className="w-full px-4 py-6 text-center space-y-4 z-10 pb-8">
        <Link href="/help" className="inline-block text-sm font-semibold text-secondary hover:text-secondary-fixed transition-colors">
          Cần trợ giúp?
        </Link>
        <p className="text-xs font-medium text-on-surface-variant max-w-xs mx-auto leading-relaxed">
          Tôi đồng ý với <Link href="/privacy" className="text-primary hover:text-primary-fixed transition-colors">Chính sách bảo mật</Link>, <Link href="/terms" className="text-primary hover:text-primary-fixed transition-colors">Điều khoản dịch vụ</Link>, <Link href="/data" className="text-primary hover:text-primary-fixed transition-colors">Thỏa thuận xử lý dữ liệu</Link>
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
