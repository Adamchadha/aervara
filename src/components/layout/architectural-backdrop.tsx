import type { ReactNode } from "react";

type ArchitecturalBackdropProps = {
  children: ReactNode;
};

export function ArchitecturalBackdrop({ children }: ArchitecturalBackdropProps) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#fbfaf6]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <img
          src="/images/aervara-urban-skyline-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover object-[50%_58%] opacity-[0.22] [filter:contrast(1.08)_brightness(1.02)_saturate(1.05)]"
        />

        <div className="absolute inset-0 bg-[#fbfaf6]/30" />

        <div className="absolute left-0 top-0 h-[52vh] w-[50vw] bg-[#fbfaf6]/88 blur-xl" />

        <div className="absolute inset-0 bg-gradient-to-r from-[#fbfaf6]/35 via-transparent to-[#fbfaf6]/20" />
      </div>

      <div className="relative z-10 min-w-0">{children}</div>
    </div>
  );
}
