"use client";

import { useId, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
  autoComplete?: string;
  label: string;
  id?: string;
};

export function PasswordInput({
  value,
  onChange,
  required,
  minLength,
  placeholder,
  autoComplete,
  label,
  id,
}: Props) {
  const [show, setShow] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div>
      <label className="label" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="input pr-12"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 transition hover:text-brand-700 focus:outline-none focus:text-brand-700"
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          tabIndex={-1}
        >
          {show ? (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M3 3l18 18M10.58 10.58a3 3 0 0 0 4.24 4.24M9.88 4.24A10.04 10.04 0 0 1 12 4c5 0 9.27 3.11 11 8a13.16 13.16 0 0 1-2.16 3.51M6.4 6.4A13.13 13.13 0 0 0 1 12c1.73 4.89 6 8 11 8a9.96 9.96 0 0 0 5.6-1.7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path
                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
