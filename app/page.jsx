"use client";

import { useState } from "react";

/* ------------------------- DROPDOWN OPTIONS (No change needed) ------------------------- */
// POSES, LOCATIONS, ACCESSORIES, MODELS, OTHER_OPTIONS arrays remain as they were.

const POSES = [
  "Front pose – full body, facing camera, standing straight",
  "Front 3/4 pose – full body, facing slightly to the side",
  "Back pose – full body, showing entire back of saree",
  "Right side pose – full body profile, looking forward",
  "Left side pose – full body profile, looking forward",
  "Front zoom pose – from head to knees, saree details visible",
  "Seated pose – sitting gracefully, saree spread neatly",
  "Walking pose – mid step, saree flowing naturally",
  "Cross arms pose – standing with arms crossed gently",
  "Hand on waist pose – confident catalog pose",
  "Holding dupatta pose – both hands visible, dupatta displayed",
  "Over the shoulder pose – turning back slightly, looking at camera",
];

const LOCATIONS = [
  "Plain white studio background, soft shadows",
  "Light grey studio background, professional catalog look",
  "Pastel gradient studio background, soft and minimal",
  "Indoor office background, blurred, corporate look",
  "Modern living room background, blurred, home setting",
  "Balcony with city view, blurred background",
  "Green garden background, soft bokeh, outdoor daylight",
  "Wedding stage background, subtle lights, slightly blurred",
  "Ethnic indoor decor, subtle traditional elements, blurred",
  "Runway / fashion show lighting, clean background",
];

const ACCESSORIES = [
  "No jewellery, simple look",
  "Small earrings only, no other jewellery",
  "Earrings and few thin bangles",
  "Necklace and matching earrings, light bridal look",
  "Heavy bridal jewellery set – necklace, earrings, maang tikka, bangles",
  "Bangles only, both hands, no necklace",
  "Statement earrings, no necklace, minimal bangles",
  "Simple ring and watch, office-wear accessories",
];

const MODELS = [
  "Indian woman, medium height, average build, warm skin tone",
  "Indian woman, slim build, fair–medium skin tone",
  "Indian woman, curvy build, medium skin tone",
  "Indian woman, dusky skin tone, elegant look",
  "Young Indian woman, college-age, natural look",
  "Mature Indian woman, graceful, minimal makeup",
  "Plus-size Indian woman, confident pose",
  "Any Indian woman, neutral catalog look",
];

const OTHER_OPTIONS = [
  "Keep same saree / dress design and same colors",
  "Keep same design, change saree colour only",
  "Keep same saree, change blouse design only",
  "Make design richer – more embroidery / work, same colours",
  "Simplify design – less embroidery, cleaner look",
  "Convert look to bridal – heavier makeup and styling",
  "Convert look to simple office-wear",
  "Match reference design but modernise slightly",
  "Match reference design as close as possible, no changes",
  "Follow detailed custom instructions only",
];

/* ------------------------- BACKEND URL (No longer used for fetch, but kept for dev) ------------------------- */

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* ------------------------- HELPER CLASSES (No change needed) ------------------------- */

const formInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

const labelClass = "block text-sm font-bold text-slate-700 mb-2";

/* ------------------------- COMPONENT ------------------------- */

export default function HomePage() {
  const [refPreview, setRefPreview] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [status, setStatus] = useState("Awaiting your input...");
  const [loading, setLoading] = useState(false);

  function handleRefChange(e) {
    const file = e.target.files?.[0];
    if (!file) return setRefPreview(null);
    setRefPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGeneratedImage(null);
    setStatus("🚀 Generating image... Please wait, this may take a moment.");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // 🚨 FIX HERE: Use local path to trigger Vercel rewrite
      const res = await fetch("/api/generate-image", {
        method: "POST",
        body: formData,
      });

      // Check for success before parsing JSON
      if (!res.ok) {
         // Try to parse JSON error, fall back to status text
         const errorText = await res.text();
         throw new Error(`Server returned status ${res.status}: ${errorText.substring(0, 100)}...`);
      }
      
      const data = await res.json();
      if (!data.imageBase64) throw new Error("Image missing");

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setStatus("✅ Image generated successfully! Scroll down to view.");
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    const a = document.createElement("a");
    a.href = generatedImage;
    a.download = "generated-saree-image.png";
    a.click();
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Header - No change needed */}
        <div className="bg-pink-600/90 bg-cover bg-center py-4 px-8">
          <h1 className="text-center text-2xl font-extrabold text-white tracking-tight">
            ✨ AI Saree Catalog Generator
          </h1>
          <p className="text-center text-sm text-pink-100 mt-1">
            Upload an image and refine the catalog look with precise controls.
          </p>
        </div>

        <div className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Form content (omitted for brevity, no changes) */}
            {/* ... */}
          </form>
          {/* Output Section (omitted for brevity, no changes) */}
          {/* ... */}
        </div>
      </div>
    </main>
  );
}