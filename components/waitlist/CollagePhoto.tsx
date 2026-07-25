import Image from "next/image";
import type { LucideIcon } from "lucide-react";

type CollagePhotoProps = {
  src?: string;
  alt: string;
  placeholderLabel: string;
  placeholderIcon: LucideIcon;
  priority?: boolean;
};

/**
 * Renders a client-supplied product photo, or an elegant placeholder when none has
 * been provided yet. Swap in a real `src` (see README) once final photography is ready.
 */
export function CollagePhoto({
  src,
  alt,
  placeholderLabel,
  placeholderIcon: Icon,
  priority,
}: CollagePhotoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 900px) 90vw, 40vw"
        style={{ objectFit: "cover" }}
        priority={priority}
      />
    );
  }

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 text-center"
      style={{
        background: "linear-gradient(160deg, #E9EEDD 0%, #C9D4B3 55%, #9FAE7E 100%)",
      }}
      role="img"
      aria-label={alt}
    >
      <Icon size={40} color="#0B4F37" strokeWidth={1.5} opacity={0.55} />
      <span className="max-w-[80%] text-xs font-medium text-forest-dark opacity-70">
        {placeholderLabel}
      </span>
    </div>
  );
}
