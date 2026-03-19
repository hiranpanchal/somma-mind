"use client";

import { useState, useEffect, useRef } from "react";
import { Save, Upload, Copy, Check, Trash2, Image as ImageIcon, Palette, Type, ExternalLink } from "lucide-react";

// ─── defaults ────────────────────────────────────────────────────────────────
const DEFAULTS: Record<string, string> = {
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
  method_card_1_desc:
    "Access the subconscious mind to dissolve limiting beliefs and rewrite the stories that keep you stuck — effortlessly.",
  method_card_2_title: "Brainspotting",
  method_card_2_desc:
    "Locate and process trauma stored in the body using targeted eye positions, releasing what talk therapy often cannot reach.",
  method_card_3_title: "Somatic Healing",
  method_card_3_desc:
    "Reconnect with your body's innate wisdom to release tension, integrate experiences, and restore natural regulation.",
};

type Image = { name: string; url: string; size: number; createdAt: string };

// ─── Field component ─────────────────────────────────────────────────────────
function Field({
  label,
  fieldKey,
  values,
  onChange,
  multiline = false,
  placeholder,
}: {
  label: string;
  fieldKey: string;
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const val = values[fieldKey] ?? DEFAULTS[fieldKey] ?? "";
  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={val}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b76d79] focus:border-transparent resize-none"
          placeholder={placeholder ?? DEFAULTS[fieldKey]}
        />
      ) : (
        <input
          type="text"
          value={val}
          onChange={(e) => onChange(fieldKey, e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#b76d79] focus:border-transparent"
          placeholder={placeholder ?? DEFAULTS[fieldKey]}
        />
      )}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  onSave,
  saving,
  saved,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
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
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-[#b76d79] text-white hover:bg-[#9a5864]"
          } disabled:opacity-60`}
        >
          {saved ? <Check size={14} /> : <Save size={14} />}
          {saved ? "Saved!" : saving ? "Saving…" : "Save"}
        </button>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DesignPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [images, setImages] = useState<Image[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "method" | "images">("hero");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/design")
      .then((r) => r.json())
      .then((data) => { setValues(data); setLoading(false); });
    loadImages();
  }, []);

  function loadImages() {
    fetch("/api/admin/images")
      .then((r) => r.json())
      .then(setImages);
  }

  function onChange(key: string, val: string) {
    setValues((prev) => ({ ...prev, [key]: val }));
  }

  async function saveSection(keys: string[], sectionKey: string) {
    setSaving((p) => ({ ...p, [sectionKey]: true }));
    const updates: Record<string, string> = {};
    for (const k of keys) updates[k] = values[k] ?? DEFAULTS[k] ?? "";
    await fetch("/api/admin/design", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
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

  const heroKeys = [
    "hero_title_before", "hero_title_highlight", "hero_title_after",
    "hero_description", "hero_cta_primary_text", "hero_cta_primary_url",
    "hero_cta_secondary_text", "hero_cta_secondary_url",
  ];
  const methodKeys = [
    "method_title", "method_subtitle",
    "method_card_1_title", "method_card_1_desc",
    "method_card_2_title", "method_card_2_desc",
    "method_card_3_title", "method_card_3_desc",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#b76d79] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900" style={{ fontFamily: "var(--font-playfair)" }}>
            Design
          </h1>
          <p className="text-stone-500 text-sm mt-1">Edit your site content and images</p>
        </div>
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <ExternalLink size={14} />
          Preview Site
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 w-fit">
        {(["hero", "method", "images"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? "bg-white text-[#b76d79] shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            {tab === "images" ? "Images" : tab === "hero" ? "Hero Section" : "Method Section"}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        {activeTab === "hero" && (
          <Section
            title="Hero Section"
            icon={Type}
            onSave={() => saveSection(heroKeys, "hero")}
            saving={!!saving.hero}
            saved={!!saved.hero}
          >
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

        {/* Method Section */}
        {activeTab === "method" && (
          <Section
            title="The Method Section"
            icon={Palette}
            onSave={() => saveSection(methodKeys, "method")}
            saving={!!saving.method}
            saved={!!saved.method}
          >
            <div className="grid grid-cols-2 gap-4">
              <Field label="Section Title" fieldKey="method_title" values={values} onChange={onChange} />
              <Field label="Section Subtitle" fieldKey="method_subtitle" values={values} onChange={onChange} />
            </div>
            {([1, 2, 3] as const).map((n) => (
              <div key={n} className="border border-stone-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide">Card {n}</p>
                <Field label="Title" fieldKey={`method_card_${n}_title`} values={values} onChange={onChange} />
                <Field label="Description" fieldKey={`method_card_${n}_desc`} values={values} onChange={onChange} multiline />
              </div>
            ))}
          </Section>
        )}

        {/* Images */}
        {activeTab === "images" && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#f5e4e7] flex items-center justify-center">
                  <ImageIcon size={16} className="text-[#b76d79]" />
                </div>
                <div>
                  <h2 className="font-semibold text-stone-800">Image Library</h2>
                  <p className="text-xs text-stone-400">{images.length} images — click URL to copy</p>
                </div>
              </div>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#b76d79] text-white hover:bg-[#9a5864] transition-all cursor-pointer ${uploading ? "opacity-60" : ""}`}>
                <Upload size={14} />
                {uploading ? "Uploading…" : "Upload Image"}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={uploadImage}
                  disabled={uploading}
                />
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
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-2 space-y-1.5">
                        <p className="text-xs text-stone-600 truncate font-medium">{img.name}</p>
                        <p className="text-xs text-stone-400">{(img.size / 1024).toFixed(0)} KB</p>
                        <button
                          onClick={() => copyUrl(img.url)}
                          className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            copiedUrl === img.url
                              ? "bg-green-100 text-green-700"
                              : "bg-stone-100 text-stone-600 hover:bg-[#f5e4e7] hover:text-[#b76d79]"
                          }`}
                        >
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
