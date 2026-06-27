interface LogoMarkProps {
  className?: string;
}

export function LogoMark({ className = "w-6 h-6" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Top bar */}
      <rect x="5" y="3" width="14" height="2.5" rx="1.25" fill="currentColor" />
      {/* Stem */}
      <rect x="10.75" y="5.5" width="2.5" height="13" fill="currentColor" />
      {/* Bottom bar */}
      <rect x="5" y="18.5" width="14" height="2.5" rx="1.25" fill="currentColor" />
    </svg>
  );
}

interface BrandLogoProps {
  iconSize?: string;
  textSize?: string;
  textColor?: string;
}

export function BrandLogo({
  iconSize = "w-8 h-8",
  textSize = "text-xl",
  textColor = "text-foreground",
}: BrandLogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={`${iconSize} text-primary`} />
      <span className={`${textSize} font-display font-bold ${textColor}`}>
        searchjobs
      </span>
    </div>
  );
}
