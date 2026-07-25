export function SparkleIcon({ size = 26, color = "#F39B28" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 2l1.4 7.2L21 12l-7.6 2.8L12 22l-1.4-7.2L3 12l7.6-2.8z" />
    </svg>
  );
}

export function LeafSproutIcon({ size = 18, color = "#7C8A54" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
      <path d="M28 6C15 7 7 14 6 26c6-1 12-4 16-10" />
    </svg>
  );
}

export function LeafBadgeIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="#2E7D46" style={{ display: "inline-block" }}>
      <path d="M28 6C15 7 7 14 6 26c6-1 12-4 16-10" opacity={0.95} />
      <path d="M15 24C18 18 22 13 28 9" stroke="#0B4F37" strokeWidth={1.2} fill="none" />
    </svg>
  );
}

export function FloatingLeafIcon({
  size,
  color,
  strokeColor,
}: {
  size: number;
  color: string;
  strokeColor?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill={color}>
      <path d="M28 4C14 5 5 13 4 27c0 1 2 1 2 0C8 15 16 8 28 6c1 0 1-2 0-2Z" opacity={0.85} />
      {strokeColor && <path d="M6 26C10 18 17 11 27 6" stroke={strokeColor} strokeWidth={1} fill="none" />}
    </svg>
  );
}
