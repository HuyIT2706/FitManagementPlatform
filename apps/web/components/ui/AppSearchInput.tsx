'use client';

import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface AppSearchInputProps {
  value: string;
  onChange: (value: string, e?: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClear?: () => void;
  onSubmit?: () => void;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'glass';
  disabled?: boolean;
  autoFocus?: boolean;
  showClearButton?: boolean;
  id?: string;
}

const AppSearchInput = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  onClear,
  onSubmit,
  className = '',
  inputClassName = '',
  size = 'md',
  variant = 'default',
  disabled = false,
  autoFocus = false,
  showClearButton = true,
  id,
}: AppSearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    onChange('');
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    } else if (e.key === 'Escape' && value) {
      e.preventDefault();
      handleClear();
    }
  };

  // Size styling configurations
  const sizeConfig = {
    sm: {
      container: 'h-9 px-3 text-xs',
      icon: 14,
      clearBtn: 'p-1',
      clearIcon: 12,
      inputPl: 'pl-2',
      inputPr: value && showClearButton ? 'pr-6' : 'pr-1',
    },
    md: {
      container: 'h-11 px-3.5 text-sm',
      icon: 16,
      clearBtn: 'p-1.5',
      clearIcon: 14,
      inputPl: 'pl-2.5',
      inputPr: value && showClearButton ? 'pr-7' : 'pr-1',
    },
    lg: {
      container: 'h-13 px-4 text-base',
      icon: 19,
      clearBtn: 'p-2',
      clearIcon: 16,
      inputPl: 'pl-3',
      inputPr: value && showClearButton ? 'pr-8' : 'pr-1',
    },
  }[size];

  // Variant styling configurations
  const variantConfig = {
    default:
      'bg-[#121820]/90 border border-white/10 hover:border-white/20 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/20 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    filled:
      'bg-white/5 border border-transparent hover:border-white/10 focus-within:border-[#10b981] focus-within:bg-[#121820] focus-within:ring-2 focus-within:ring-[#10b981]/20',
    glass:
      'bg-white/[0.03] backdrop-blur-xl border border-white/15 hover:border-white/25 focus-within:border-[#10b981] focus-within:ring-2 focus-within:ring-[#10b981]/25 focus-within:shadow-[0_4px_24px_rgba(16,185,129,0.12)]',
  }[variant];

  return (
    <div
      className={`group relative flex items-center rounded-2xl transition-all duration-300 ${sizeConfig.container} ${variantConfig} ${
        disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
    >
      {/* Search Icon with Glowing Focus State */}
      <Search
        size={sizeConfig.icon}
        className="text-white/40 group-focus-within:text-[#10b981] transition-colors duration-300 shrink-0 pointer-events-none"
      />

      {/* Input Field */}
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value, e)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full h-full bg-transparent text-white placeholder-white/40 focus:outline-none font-medium ${sizeConfig.inputPl} ${sizeConfig.inputPr} ${inputClassName}`}
      />

      {/* Clear Button */}
      {showClearButton && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xóa từ khóa tìm kiếm"
          className={`absolute right-2 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all duration-200 cursor-pointer flex items-center justify-center ${sizeConfig.clearBtn}`}
        >
          <X size={sizeConfig.clearIcon} />
        </button>
      )}
    </div>
  );
};

export default AppSearchInput;