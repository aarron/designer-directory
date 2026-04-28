"use client";

import Image from "next/image";

export type CollageDesigner = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
};

// [left%, top%, depth: 0=far 1=mid 2=near, float: 0/1/2]
const SLOTS: [number, number, number, number][] = [
  // far background — small, blurred, faint (32)
  [61,  5, 0, 0], [70,  3, 0, 1], [80,  7, 0, 2], [88,  3, 0, 0],
  [96,  8, 0, 1], [64, 17, 0, 2], [97, 22, 0, 0], [60, 70, 0, 1],
  [69, 80, 0, 2], [78, 86, 0, 0], [87, 83, 0, 1], [96, 76, 0, 2],
  [63, 92, 0, 0], [74, 94, 0, 1], [84, 92, 0, 2], [94, 90, 0, 0],
  [66, 11, 0, 1], [75,  9, 0, 2], [85, 13, 0, 0], [93,  6, 0, 1],
  [61, 28, 0, 2], [72, 33, 0, 0], [82, 38, 0, 1], [91, 30, 0, 2],
  [67, 42, 0, 0], [76, 50, 0, 1], [86, 45, 0, 2], [95, 53, 0, 0],
  [62, 59, 0, 1], [71, 65, 0, 2], [81, 60, 0, 0], [90, 68, 0, 1],
  // mid — medium, clear (20)
  [65, 27, 1, 1], [75, 34, 1, 0], [85, 28, 1, 2],
  [93, 42, 1, 1], [62, 48, 1, 0], [97, 56, 1, 2],
  [68, 62, 1, 1], [79, 70, 1, 0], [89, 65, 1, 2],
  [72, 78, 1, 1],
  [70, 20, 1, 0], [80, 24, 1, 2], [90, 18, 1, 1],
  [61, 38, 1, 2], [83, 44, 1, 0], [96, 62, 1, 1],
  [74, 56, 1, 2], [64, 72, 1, 0], [87, 74, 1, 1], [77, 84, 1, 2],
  // near foreground — large, prominent (12)
  [67, 13, 2, 2], [80, 18, 2, 0], [91, 12, 2, 1],
  [71, 46, 2, 2], [83, 52, 2, 0], [94, 36, 2, 1],
  [73, 30, 2, 0], [87, 40, 2, 2], [96, 26, 2, 1],
  [63, 68, 2, 0], [78, 60, 2, 2], [91, 78, 2, 1],
];

const DEPTH_CONFIG = [
  { size: 30, opacity: 0.18, blurClass: "blur-sm" },
  { size: 46, opacity: 0.42, blurClass: "" },
  { size: 66, opacity: 0.72, blurClass: "" },
];

const FLOAT_CLASSES = ["animate-float-a", "animate-float-b", "animate-float-c"];

export function HeroCollage({ designers }: { designers: CollageDesigner[] }) {
  if (designers.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none hidden md:block" aria-hidden="true">
      {/* Gradient: left stays black (text readable), right reveals collage */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-black from-[50%] via-brand-black/70 via-[65%] to-transparent z-10" />

      {SLOTS.map((slot, i) => {
        const designer = designers[i % designers.length];
        const [left, top, depth, floatIdx] = slot;
        const { size, opacity, blurClass } = DEPTH_CONFIG[depth];

        return (
          <div
            key={i}
            className={`absolute rounded-full overflow-hidden ${blurClass} ${FLOAT_CLASSES[floatIdx]}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              opacity,
              animationDelay: `${i * 0.25}s`,
              zIndex: depth,
            }}
          >
            <Image
              src={designer.photoUrl}
              alt={`${designer.firstName} ${designer.lastName}`}
              width={size}
              height={size}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
