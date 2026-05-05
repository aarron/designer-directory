import Image from "next/image";

const AVATAR_COUNT = 12;

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const ROUNDED: Record<string, string> = {
  full: "rounded-full",
  xl:   "rounded-xl",
  lg:   "rounded-lg",
  none: "",
};

export function ArtisticAvatar({
  seed,
  size = 56,
  rounded = "none",
  className = "",
}: {
  seed: string;
  size?: number;
  rounded?: "full" | "xl" | "lg" | "none";
  className?: string;
}) {
  const index = (hash(seed) % AVATAR_COUNT) + 1;
  const src = `/avatars/avatar${index}.png`;
  const roundedClass = ROUNDED[rounded] ?? "";
  const hasCssDimensions = /\bw-|\bh-/.test(className);

  if (hasCssDimensions) {
    return (
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, 25vw"
        className={`object-cover object-center ${roundedClass} ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      className={`object-cover object-center flex-shrink-0 ${roundedClass} ${className}`}
      aria-hidden="true"
    />
  );
}
