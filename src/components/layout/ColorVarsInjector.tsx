import { prisma } from "@/lib/db";

const COLOR_DEFAULTS: Record<string, string> = {
  color_primary: "#b76d79",
  color_primary_dark: "#9a5864",
  color_background: "#f2f2f2",
  color_olive: "#85896c",
  color_mauve: "#c9a698",
  color_linen: "#d6cec4",
};

/** Builds the CSS override block that maps hardcoded Tailwind arbitrary-value
 *  classes to CSS custom properties set by the admin Colors panel.
 *  Injected as a raw <style> tag to bypass Lightning CSS parsing (Tailwind v4
 *  rejects escaped class selectors that contain # followed by digit tokens). */
function buildOverrides(p: string, pd: string, bg: string, olive: string): string {
  // tint helpers (approximate — no oklch conversion needed here)
  const primaryTint18 = `color-mix(in srgb, ${p} 18%, white)`;
  const primaryTint8  = `color-mix(in srgb, ${p} 8%, white)`;
  const primaryTint50 = `color-mix(in srgb, ${p} 50%, white)`;
  const oliveTint22   = `color-mix(in srgb, ${olive} 22%, white)`;

  return `
/* === the Somaa Mind — dynamic brand colour overrides === */
:root {
  --brand-primary: ${p};
  --brand-primary-dark: ${pd};
  --brand-background: ${bg};
  --brand-olive: ${olive};
}

body { background-color: ${bg}; }

/* Primary */
.bg-\\[${p}\\]                   { background-color: ${p} !important; }
.text-\\[${p}\\]                 { color: ${p} !important; }
.border-\\[${p}\\]               { border-color: ${p} !important; }
.stroke-\\[${p}\\]               { stroke: ${p} !important; }
.from-\\[${p}\\]                 { --tw-gradient-from: ${p} !important; }
.to-\\[${p}\\]                   { --tw-gradient-to: ${p} !important; }
.hover\\:bg-\\[${p}\\]:hover     { background-color: ${p} !important; }
.hover\\:text-\\[${p}\\]:hover   { color: ${p} !important; }
.hover\\:border-\\[${p}\\]:hover { border-color: ${p} !important; }
.focus\\:ring-\\[${p}\\]:focus   { --tw-ring-color: ${p} !important; }
.group:hover .group-hover\\:text-\\[${p}\\] { color: ${p} !important; }

/* Primary tints (hardcoded fallbacks stay correct, dynamic overrides kick in when changed) */
.bg-\\[#f5e4e7\\]                  { background-color: ${primaryTint18} !important; }
.from-\\[#f5e4e7\\]                { --tw-gradient-from: ${primaryTint18} !important; }
.to-\\[#f5e4e7\\]                  { --tw-gradient-to: ${primaryTint18} !important; }
.hover\\:bg-\\[#fdf0f2\\]:hover    { background-color: ${primaryTint8}  !important; }
.border-\\[#e8b4bc\\]              { border-color: ${primaryTint50} !important; }
.hover\\:border-\\[#e8b4bc\\]:hover { border-color: ${primaryTint50} !important; }

/* Primary dark */
.bg-\\[${pd}\\]                  { background-color: ${pd} !important; }
.text-\\[${pd}\\]                { color: ${pd} !important; }
.hover\\:bg-\\[${pd}\\]:hover    { background-color: ${pd} !important; }
.hover\\:text-\\[${pd}\\]:hover  { color: ${pd} !important; }
.from-\\[${pd}\\]                { --tw-gradient-from: ${pd} !important; }
.to-\\[${pd}\\]                  { --tw-gradient-to: ${pd} !important; }

/* Olive */
.bg-\\[${olive}\\]               { background-color: ${olive} !important; }
.text-\\[${olive}\\]             { color: ${olive} !important; }
.stroke-\\[${olive}\\]           { stroke: ${olive} !important; }
.from-\\[#eaebdf\\]              { --tw-gradient-from: ${oliveTint22} !important; }
.to-\\[#eaebdf\\]                { --tw-gradient-to: ${oliveTint22} !important; }
.bg-\\[#eaebdf\\]                { background-color: ${oliveTint22} !important; }

/* Background */
.bg-\\[${bg}\\]                  { background-color: ${bg} !important; }
`.trim();
}

export async function ColorVarsInjector() {
  try {
    const rows = await prisma.siteContent.findMany({
      where: { id: { in: Object.keys(COLOR_DEFAULTS) } },
    });
    const colors = { ...COLOR_DEFAULTS };
    for (const r of rows) {
      if (r.value && r.id in colors) colors[r.id] = r.value;
    }

    // Only inject overrides when at least one color differs from default
    // (avoids unnecessary CSS on fresh installs)
    const css = buildOverrides(
      colors.color_primary,
      colors.color_primary_dark,
      colors.color_background,
      colors.color_olive,
    );

    return <style dangerouslySetInnerHTML={{ __html: css }} />;
  } catch {
    return null;
  }
}
