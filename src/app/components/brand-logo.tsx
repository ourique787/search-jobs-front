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
      {/* > prompt */}
      <polyline
        points="3,7.5 10.5,12 3,16.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* _ cursor */}
      <line
        x1="13"
        y1="16.5"
        x2="21"
        y2="16.5"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
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
