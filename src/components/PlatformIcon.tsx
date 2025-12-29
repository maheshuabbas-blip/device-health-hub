import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

const platformColors: Record<string, string> = {
  twitter: 'bg-[#1DA1F2]/20 text-[#1DA1F2]',
  instagram: 'bg-[#E4405F]/20 text-[#E4405F]',
  facebook: 'bg-[#1877F2]/20 text-[#1877F2]',
  tiktok: 'bg-[#00F2EA]/20 text-[#00F2EA]',
  linkedin: 'bg-[#0A66C2]/20 text-[#0A66C2]',
  quora: 'bg-[#B92B27]/20 text-[#B92B27]',
  reddit: 'bg-[#FF4500]/20 text-[#FF4500]',
};

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const colorClass = platformColors[platform.toLowerCase()] || 'bg-muted text-muted-foreground';
  const initial = platform.charAt(0).toUpperCase();
  
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm",
        colorClass,
        className
      )}
    >
      {initial}
    </div>
  );
}

export function PlatformBadge({ platform, className }: PlatformIconProps) {
  const colorClass = platformColors[platform.toLowerCase()] || 'bg-muted text-muted-foreground';
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md capitalize",
        colorClass,
        className
      )}
    >
      {platform}
    </span>
  );
}
