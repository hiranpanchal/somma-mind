"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Upload, Copy, Check, Image as ImageIcon, Palette, Type, ExternalLink, X, Droplets } from "lucide-react";

const DEFAULTS: Record<string, string> = {
  hero_banner_image: "",
  hero_title_before: "Transform from",
  hero_title_highlight: "the inside",
  hero_title_after: "out",
  hero_description:
    "A unique blend of hypnotherapy, brainspotting, and somatic healing — designed to help you release deep-seated patterns, heal from past experiences, and create lasting transformation without relying on willpower alone.",
  hero_cta_primary_text: "Explore Courses",
  hero_cta_primary_url: "/courses",
  hero_cta_secondary_text: "Learn More",
  hero_cta_secondary_url: "#about",
  method_title: "The Somaa Method",
  method_subtitle: "Three powerful healing modalities woven together into one transformative journey.",
  method_card_1_title: "Hypnotherapy",
  method_card_1_desc: "Access the subconscious mind to dissolve limiting beliefs and rewrite the stories that keep you stuck — effortlessly.",
  method_card_1_image: "",
  method_card_2_title: "Brainspotting",
  method_card_2_desc: "Locate and process trauma stored in the body using targeted eye positions, releasing what talk therapy often cannot reach.",
  method_card_2_image: "",
  method_card_3_title: "Somatic Healing",
  method_card_3_desc: "Reconnect with your body's innate wisdom to release tension, integrate experiences, and restore natural regulation.",
  method_card_3_image: "",
};

const COLOR_DEFS = [
  {
    key: "color_primary",
    label: "Primary",
    badge: "Berry Rose",
    desc: "Buttons, links, highlights & accents",
    defaultVal: "#b76d79",
  },
  {
    key: "color_primary_dark",
    label: "Primary Dark",
    badge: "Dark Berry",
    desc: "Hover states on primary elements",
    defaultVal: "#9a5864",
  },
  {
    key: "color_background",
    label: "Background",
    badge: "Page",
    desc: "Main site background colour",
    defaultVal: "#f2f2f2",
  },
  {
    key: "color_olive",
    label: "Olive",
    badge: "Botanical",
    desc: "Botanical SVG illustrations",
    defaultVal: "#85896c",
  },
  {
    key: "color_mauve",
    label: "Mauve",
    badge: "Warm accent",
    desc: "Hero gradient & warm accents",
    defaultVal: "#c9a698",
  },
  {
    key: "color_linen",
    label: "Linen",
    badge: "Soft neutral",
    desc: "Hero gradient mid-tone",
    defaultVal: "#d6cec4",
  },
];

type ImageFile = { name: string; url: string; size: number; createdAt: string };

// ─── Color Picker ────────────────────────────────────────────────────────────

function ColorPicker({
  colorKey, label, badge, desc, defaultVal, values, onChange,
}: {
  colorKey: string; label: string; badge: string; desc: string;
  defaultVal: string; values: Record<string, string>;
  onChange: (key: string, val: string) => void;
}) {
  const value = values[colorKey] || defaultVal;
  const [hexInput, setHexInput] = useState(value.replace(/^#/, "").toUpperCase());

  useEffect(() => {
    setHexInput((values[colorKey] || defaultVal).replace(/^#/, "").toUpperCase());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values[colorKey]]);

  function handlePickerChange(raw: string) {
    setHexInput(raw.replace(/^#/, "").toUpperCase());
    onChange(colorKey, raw);
  }

  function handleHexInput(raw: string) {
    const clean = raw.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, 6);
    setHexInput(clean);
    if (clean.length === 6) onChange(colorKey, `#${clean}`);
  }

  const isDefault = (values[colorKey] || defaultVal) === defaultVal;

  return (
    <div className="border border-stone-200 rounded-2xl p-4 space-y-3 hover:border-stone-300 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-stone-800">{label}</p>
          <p className="text-xs text-stone-400 mt-0.5">{desc}</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 uppercase tracking-wide whitespace-nowrap">
          {badge}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Swatch + hidden colour input */}
        <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 border-stone-200 shadow-sm cursor-pointer group">
          <div className="absolute inset-0" style={{ background: value }} />
          <input
            type="color"
            value={value}
            onChange={(e) => handlePickerChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Open colour picker"
          />
          {/* Subtle click hint */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <Droplets size={14} className="text-white opacity-0 group-hover:opacity-80 transition-opacity drop-shadow" />
          </div>
        </div>

        {/* Hex input */}
        <div className="flex-1">
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus-within:border-[#b76d79] focus-within:ring-2 focus-within:ring-[#b76d79]/20 transition-all">
            <span className="text-stone-400 font-mono text-sm font-semibold">#</span>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => handleHexInput(e.target.value)}
              maxLength={6}
              className="flex-1 bg-transparent text-sm font-mono text-stone-800 focus:outline-none uppercase tracking-widest min-w-0"
              placeholder="B76D79"
            />
          </div>
          {!isDefault && (
            <button
              onClick={() => { onChange(colorKey, defaultVal); setHexInput(defaultVal.replace(/^#/, "").toUpperCase()); }}
              className="text-[10px] text-stone-400 hover:text-stone-600 mt-1 ml-1 transition-colors"
            >
              Reset to default
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Text Field ───────────────────────────────────────────────────────────────

function Field({
  label, fieldKey, values, onChange, multiline = false, placeholder,
}: {
  label: string; fieldKey: string; values: Record<string, string>;
  onChange: (key: string, val: string) => void; multiline?: boolean; placeholder?: string;
}) {
  const val = values[fieldKey] ?? DEFAULTS[fieldKey] ?? "";
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={val} onChange={(e) => onChange(fieldKey, e.target.value)} rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b76d79] focus:border-transparent resize-none"
          placeholder={placeholder ?? DEFAULTS[fieldKey]} />
      ) : (
        <input type="text" value={val} onChange={(e) => onChange(fieldKey, e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b76d79] focus:border-transparent"
          placeholder={placeholder ?? DEFAULTS[fieldKey]} />
      )}
    </div>
  );
}

// ─── Card Image Upload ────────────────────────────────────────────────────────

function CardImageUpload({
  cardNum, values, onChange,
}: {
  cardNum: number; values: Record<string, string>; onChange: (key: string, val: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgKey = `method_card_${cardNum}_image`;
  const currentUrl = values[imgKey] ?? "";

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const { url } = await res.json();
    if (url) onChange(imgKey, url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    // Only clear drag state if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Card Image</label>
      {currentUrl ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 bg-stone-50 transition-all ${dragging ? "border-[#b76d79] ring-2 ring-[#b76d79]/20 scale-[1.01]" : "border-stone-200"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <img src={currentUrl} alt="" className={`w-full h-40 object-cover transition-opacity ${dragging ? "opacity-40" : "opacity-100"}`} />
          {dragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
              <Upload size={24} className="text-[#b76d79] mb-1" />
              <span className="text-sm font-medium text-[#b76d79]">Drop to replace</span>
            </div>
          )}
          <button
            onClick={() => onChange(imgKey, "")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 p-1.5 rounded-lg shadow transition-colors"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5 flex items-center justify-between">
            <span className="text-white text-xs truncate">{currentUrl.split("/").pop()}</span>
            <label className="cursor-pointer text-white/80 hover:text-white text-xs flex items-center gap-1">
              <Upload size={11} /> Replace
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} disabled={uploading} />
            </label>
          </div>
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center h-36 rounded-xl border-2 border-dashed transition-all cursor-pointer
            ${dragging
              ? "border-[#b76d79] bg-[#fdf0f2] scale-[1.01] ring-2 ring-[#b76d79]/20"
              : uploading
              ? "border-stone-200 bg-stone-50 opacity-60"
              : "border-stone-200 bg-stone-50 hover:border-[#b76d79] hover:bg-[#fdf0f2]"
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} disabled={uploading} />
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#b76d79] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-stone-500">Uploading…</span>
            </>
          ) : dragging ? (
            <>
              <Upload size={24} className="text-[#b76d79] mb-2" />
              <span className="text-sm font-medium text-[#b76d79]">Drop image here</span>
            </>
          ) : (
            <>
              <Upload size={20} className="text-stone-400 mb-2" />
              <span className="text-sm text-stone-500">Drop image here</span>
              <span className="text-xs text-stone-400 mt-0.5">or click to browse</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Banner Image Upload ──────────────────────────────────────────────────────

function BannerImageUpload({
  values, onChange,
}: {
  values: Record<string, string>; onChange: (key: string, val: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgKey = "hero_banner_image";
  const currentUrl = values[imgKey] ?? "";

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    const { url } = await res.json();
    if (url) onChange(imgKey, url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
        Banner Image
      </label>
      <p className="text-xs text-stone-400 mb-2">
        Fills the hero background. If none is set, the gradient is used as fallback.
      </p>

      {currentUrl ? (
        <div
          className={`relative rounded-xl overflow-hidden border-2 transition-all ${dragging ? "border-[#b76d79] ring-2 ring-[#b76d79]/20 scale-[1.01]" : "border-stone-200"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <img
            src={currentUrl}
            alt="Hero banner"
            className={`w-full h-56 object-cover transition-opacity ${dragging ? "opacity-40" : "opacity-100"}`}
          />
          {dragging && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm pointer-events-none">
              <Upload size={28} className="text-[#b76d79] mb-1" />
              <span className="text-sm font-medium text-[#b76d79]">Drop to replace</span>
            </div>
          )}
          <button
            onClick={() => onChange(imgKey, "")}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-stone-600 hover:text-red-500 p-1.5 rounded-lg shadow transition-colors"
          >
            <X size={14} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-3 py-1.5 flex items-center justify-between">
            <span className="text-white text-xs truncate">{currentUrl.split("/").pop()}</span>
            <label className="cursor-pointer text-white/80 hover:text-white text-xs flex items-center gap-1">
              <Upload size={11} /> Replace
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} disabled={uploading} />
            </label>
          </div>
        </div>
      ) : (
        <div
          className={`relative flex flex-col items-center justify-center h-44 rounded-xl border-2 border-dashed transition-all cursor-pointer
            ${dragging
              ? "border-[#b76d79] bg-[#fdf0f2] scale-[1.01] ring-2 ring-[#b76d79]/20"
              : uploading
              ? "border-stone-200 bg-stone-50 opacity-60"
              : "border-stone-200 bg-stone-50 hover:border-[#b76d79] hover:bg-[#fdf0f2]"
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} disabled={uploading} />
          {uploading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#b76d79] border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-xs text-stone-500">Uploading…</span>
            </>
          ) : dragging ? (
            <>
              <Upload size={28} className="text-[#b76d79] mb-2" />
              <span className="text-sm font-medium text-[#b76d79]">Drop banner image here</span>
            </>
          ) : (
            <>
              <Upload size={22} className="text-stone-400 mb-2" />
              <span className="text-sm text-stone-500">Drop banner image here</span>
              <span className="text-xs text-stone-400 mt-0.5">or click to browse — gradient used if empty</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({
  title, icon: Icon, children, onSave, saving, saved,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  onSave: () => void; saving: boolean; saved: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f5e4e7] flex items-center justify-center">
            <Icon size={16} className="text-[#b76d79]" />
          </div>
          <h2 className="font-semibold text-stone-800">{title}</h2>
        </div>
        <button onClick={onSave} disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${saved ? "bg-green-100 text-green-700" : "bg-[#b76d79] text-white hover:bg-[#9a5864]"} disabled:opacity-60`}>
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DesignPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "method" | "images" | "colors">("hero");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/design")
      .then((r) => r.json())
      .then((data) => { setValues(data); setLoading(false); });
    loadImages();
  }, []);

  function loadImages() {
    fetch("/api/admin/images").then((r) => r.json()).then(setImages);
  }

  function onChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function saveSection(keys: string[], sectionKey: string) {
    setSaving((p) => ({ ...p, [sectionKey]: true }));
    const updates: Record<string, string> = {};
    for (const k of keys) updates[k] = values[k] ?? DEFAULTS[k] ?? "";
    await fetch("/api/admin/design", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
    setSaving((p) => ({ ...p, [sectionKey]: false }));
    setSaved((p) => ({ ...p, [sectionKey]: true }));
    setTimeout(() => setSaved((p) => ({ ...p, [sectionKey]: false })), 2500);
  }

  async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    await fetch("/api/admin/upload-image", { method: "POST", body: fd });
    setUploading(false);
    loadImages();
    if (fileRef.current) fileRef.current.value = "";
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  const heroKeys = ["hero_banner_image","hero_title_before","hero_title_highlight","hero_title_after","hero_description","hero_cta_primary_text","hero_cta_primary_url","hero_cta_secondary_text","hero_cta_secondary_url"];
  const methodKeys = ["method_title","method_subtitle","method_card_1_title","method_card_1_desc","method_card_1_image","method_card_2_title","method_card_2_desc","method_card_2_image","method_card_3_title","method_card_3_desc","method_card_3_image"];
  const colorKeys = COLOR_DEFS.map((c) => c.key);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-[#b76d79] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const tabs = [
    { id: "hero",   label: "Hero Section" },
    { id: "method", label: "Method Section" },
    { id: "colors", label: "Colours" },
    { id: "images", label: "Images" },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-playfair)" }}>Design</h1>
          <p className="text-stone-500 text-sm mt-1">Edit your site content, colours and images</p>
        </div>
        <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
          <ExternalLink size={14} /> Preview Site
        </a>
      </div>

      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-white text-[#b76d79] shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* ── Hero ── */}
        {activeTab === "hero" && (
          <Section title="Hero Section" icon={Type} onSave={() => saveSection(heroKeys, "hero")} saving={!!saving.hero} saved={!!saved.hero}>
            <BannerImageUpload values={values} onChange={onChange} />
            <div className="bg-stone-50 rounded-xl p-4 mb-2">
              <p className="text-xs text-stone-500 mb-1 font-medium">HEADLINE PREVIEW</p>
              <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
                {values.hero_title_before ?? DEFAULTS.hero_title_before}{" "}
                <span className="text-[#b76d79]">{values.hero_title_highlight ?? DEFAULTS.hero_title_highlight}</span>{" "}
                {values.hero_title_after ?? DEFAULTS.hero_title_after}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Title — Before highlight" fieldKey="hero_title_before" values={values} onChange={onChange} />
              <Field label="Title — Highlighted (pink)" fieldKey="hero_title_highlight" values={values} onChange={onChange} />
              <Field label="Title — After highlight" fieldKey="hero_title_after" values={values} onChange={onChange} />
            </div>
            <Field label="Description" fieldKey="hero_description" values={values} onChange={onChange} multiline />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Button Text" fieldKey="hero_cta_primary_text" values={values} onChange={onChange} />
              <Field label="Primary Button URL" fieldKey="hero_cta_primary_url" values={values} onChange={onChange} placeholder="/courses" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Secondary Button Text" fieldKey="hero_cta_secondary_text" values={values} onChange={onChange} />
              <Field label="Secondary Button URL" fieldKey="hero_cta_secondary_url" values={values} onChange={onChange} placeholder="#about" />
            </div>
          </Section>
        )}

        {/* ── Method ── */}
        {activeTab === "method" && (
          <Section title="The Method Section" icon={Palette} onSave={() => saveSection(methodKeys, "method")} saving={!!saving.method} saved={!!saved.method}>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Section Title" fieldKey="method_title" values={values} onChange={onChange} />
              <Field label="Section Subtitle" fieldKey="method_subtitle" values={values} onChange={onChange} />
            </div>
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className="border border-stone-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Card {n}</p>
                <CardImageUpload cardNum={n} values={values} onChange={onChange} />
                <Field label="Title" fieldKey={`method_card_${n}_title`} values={values} onChange={onChange} />
                <Field label="Description" fieldKey={`method_card_${n}_desc`} values={values} onChange={onChange} multiline />
              </div>
            ))}
          </Section>
        )}

        {/* ── Colours ── */}
        {activeTab === "colors" && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5e4e7] flex items-center justify-center">
                  <Palette size={16} className="text-[#b76d79]" />
                </div>
                <div>
                  <h2 className="font-semibold text-stone-800">Brand Colours</h2>
                  <p className="text-xs text-stone-400">Changes apply site-wide — click any swatch to open colour picker</p>
                </div>
              </div>
              <button
                onClick={() => saveSection(colorKeys, "colors")}
                disabled={!!saving.colors}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${saved.colors ? "bg-green-100 text-green-700" : "bg-[#b76d79] text-white hover:bg-[#9a5864]"} disabled:opacity-60`}
              >
                {saved.colors ? <Check size={14} /> : <Save size={14} />}
                {saved.colors ? "Saved!" : saving.colors ? "Saving…" : "Save Colours"}
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {COLOR_DEFS.map((def) => (
                  <ColorPicker
                    key={def.key}
                    colorKey={def.key}
                    label={def.label}
                    badge={def.badge}
                    desc={def.desc}
                    defaultVal={def.defaultVal}
                    values={values}
                    onChange={onChange}
                  />
                ))}
              </div>

              {/* Live palette preview */}
              <div className="mt-6 p-5 bg-stone-50 rounded-2xl border border-stone-100">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-4">Palette Preview</p>
                <div className="flex flex-wrap gap-3">
                  {COLOR_DEFS.map((def) => {
                    const val = values[def.key] || def.defaultVal;
                    return (
                      <div key={def.key} className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-xl shadow-sm border border-white"
                          style={{ background: val }}
                          title={val}
                        />
                        <div>
                          <p className="text-xs font-medium text-stone-700 leading-none">{def.label}</p>
                          <p className="text-[10px] text-stone-400 font-mono mt-0.5">{val.toUpperCase()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sample UI button preview */}
                <div className="mt-5 pt-4 border-t border-stone-200">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">Button Preview</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold text-white shadow-sm transition-colors"
                      style={{ background: values.color_primary || "#b76d79" }}
                    >
                      Primary Button
                    </span>
                    <span
                      className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold border transition-colors"
                      style={{
                        color: values.color_primary || "#b76d79",
                        borderColor: values.color_primary || "#b76d79",
                        background: "white",
                      }}
                    >
                      Secondary Button
                    </span>
                    <span
                      className="text-sm font-semibold underline-offset-2"
                      style={{ color: values.color_primary || "#b76d79" }}
                    >
                      Text link →
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-400 mt-4">
                💡 After saving, refresh the public site to see your colour changes applied.
              </p>
            </div>
          </div>
        )}

        {/* ── Images ── */}
        {activeTab === "images" && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5e4e7] flex items-center justify-center">
                  <ImageIcon size={16} className="text-[#b76d79]" />
                </div>
                <div>
                  <h2 className="font-semibold text-stone-800">Image Library</h2>
                  <p className="text-xs text-stone-400">{images.length} images — click to copy URL</p>
                </div>
              </div>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#b76d79] text-white hover:bg-[#9a5864] transition-all cursor-pointer ${uploading ? "opacity-60" : ""}`}>
                <Upload size={14} />
                {uploading ? "Uploading…" : "Upload Image"}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
              </label>
            </div>
            <div className="p-6">
              {images.length === 0 ? (
                <div className="text-center py-16 text-stone-400">
                  <ImageIcon size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div key={img.url} className="group relative rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
                      <img src={img.url} alt={img.name} className="w-full h-36 object-cover" />
                      <div className="p-2 space-y-1.5">
                        <p className="text-xs text-stone-600 truncate font-medium">{img.name}</p>
                        <p className="text-xs text-stone-400">{(img.size / 1024).toFixed(0)} KB</p>
                        <button onClick={() => copyUrl(img.url)}
                          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${copiedUrl === img.url ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600 hover:bg-[#f5e4e7] hover:text-[#b76d79]"}`}>
                          {copiedUrl === img.url ? <Check size={12} /> : <Copy size={12} />}
                          {copiedUrl === img.url ? "Copied!" : "Copy URL"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
