import React, { useState } from "react";

interface CompanyLogoProps {
  name: string;
  logoUrl?: string;
  websiteUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  name,
  logoUrl,
  websiteUrl,
  className = "",
  size = "md",
}) => {
  const [imageError, setImageError] = useState(false);

  const publishableKey = import.meta.env.VITE_LOGO_DEV_PUBLISHABLE_KEY;

  let logoDevUrl = "";
  if (publishableKey && websiteUrl) {
    try {
      const hostname = new URL(websiteUrl).hostname.replace(/^www\./, "");
      logoDevUrl = `https://img.logo.dev/${hostname}?token=${publishableKey}&size=128&format=png`;
    } catch {
      // invalid url
    }
  }

  const primarySrc = logoDevUrl || logoUrl;

  const sizeClasses = {
    sm: "w-8 h-8 text-xs rounded-lg",
    md: "w-11 h-11 text-base rounded-xl",
    lg: "w-14 h-14 text-xl rounded-xl",
    xl: "w-18 h-18 text-2xl rounded-2xl",
  }[size];

  const firstLetter = (name || "C").trim().charAt(0).toUpperCase();

  if (!primarySrc || imageError) {
    return (
      <div
        className={`flex items-center justify-center font-heading font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm shrink-0 select-none ${sizeClasses} ${className}`}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center bg-white border border-slate-200 overflow-hidden shadow-xs shrink-0 ${sizeClasses} ${className}`}
    >
      <img
        src={primarySrc}
        alt={`${name} logo`}
        className="w-full h-full object-contain p-1.5 transition-transform duration-200 hover:scale-105"
        onError={() => {
          if (logoDevUrl && primarySrc === logoDevUrl && logoUrl) {
            // fallback to logoUrl first if logoDevUrl failed
            setImageError(false);
          } else {
            setImageError(true);
          }
        }}
        loading="lazy"
      />
    </div>
  );
};
