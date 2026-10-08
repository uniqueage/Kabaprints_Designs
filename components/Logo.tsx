import Link from "next/link";

type Props = { size?: "sm" | "md" | "lg"; light?: boolean; href?: string };

const sizes = {
  sm: { main: "text-[26px]", sub: "text-[8.5px]", gap: "gap-[3px]" },
  md: { main: "text-[34px]", sub: "text-[11px]", gap: "gap-[4px]" },
  lg: { main: "text-[52px]", sub: "text-[17px]", gap: "gap-[7px]" },
};

/**
 * The Kabaprints header lockup, exactly as in the brand picture:
 * "Kaba" in heavy grey + "prints" in coral serif italic,
 * with "PRINTSHOP + DESIGN" underneath in blue.
 */
export default function Logo({ size = "md", light = false, href = "/" }: Props) {
  const s = sizes[size];
  return (
    <Link href={href} className={`group inline-flex flex-col ${s.gap} leading-none`} aria-label="Kabaprints home">
      <span className={`${s.main} font-black tracking-tight leading-none`}>
        <span className={light ? "text-silver-light" : "text-silver"}>Kaba</span>
        <span className={`font-display italic font-medium ${light ? "text-coral" : "text-coral-dark"}`}>prints</span>
      </span>
      <span
        className={`${s.sub} font-bold uppercase tracking-[0.32em] ${
          light ? "text-brand-mid" : "text-brand"
        }`}
      >
        Printshop + Design
      </span>
    </Link>
  );
}
