"use client";

import { useState } from "react";

/* ------------------------- DROPDOWN OPTIONS (Kept the same) ------------------------- */

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

/* ------------------------- BACKEND URL (Kept the same) ------------------------- */

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/* ------------------------- HELPER CLASSES (Refined) ------------------------- */

// Replaced the simple formField with a styled class
const formInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

// Label style
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

      // Fetch uses the local path, relies on vercel.json rewrite
      const res = await fetch(`/api/generate-image`, {
        method: "POST",
        body: formData,
      });

      // 🚨 UPDATED ERROR HANDLING LOGIC 🚨
      if (!res.ok) {
        let errorMsg = `Server Error: ${res.status} ${res.statusText}`;

        // Attempt to parse JSON body for a detailed error message
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await res.json();
            // Assuming the backend error structure is { error: "..." }
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // Failed to parse JSON, use generic error message
          }
        } else {
          // If not JSON (e.g., HTML 404/405 page), read as text and truncate
          const errorText = await res.text();
          errorMsg += `. Details: ${errorText.substring(0, 100)}...`;
        }

        throw new Error(errorMsg);
      }
      // END UPDATED ERROR HANDLING LOGIC

      // If res.ok is true, we expect a valid JSON response
      const data = await res.json();
      if (!data.imageBase64) throw new Error("Image data missing in response.");

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

        {/* Header - Now Brighter and more inviting */}
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
            {/* Reference Image Section */}
            <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <span className="mr-2 text-pink-500">🖼️</span> 1. Reference Image
              </h2>
              <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
                <div className="flex-1 w-full">
                  <label className={labelClass + " !mb-1"}>
                    Upload Saree / Dress Image
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    The AI will use the design, print, and primary colors from this image.
                  </p>

                  <input
                    type="file"
                    name="referenceImage"
                    required
                    accept="image/*"
                    onChange={handleRefChange}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition duration-150 cursor-pointer"
                  />
                </div>

                <div className="w-[120px] h-[160px] md:w-[150px] md:h-[200px] flex-shrink-0 rounded-xl border-4 border-slate-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                  {refPreview ? (
                    <img
                      src={refPreview}
                      alt="Reference Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 text-center px-3">
                      Image Preview
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORM CONTENT - Structured with clear groupings */}
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
              <span className="mr-2 text-pink-500">⚙️</span> 2. Customization Options
            </h2>

            {/* Row 1: Pose */}
            <div>
              <label className={labelClass}>Pose</label>
              <select name="pose" defaultValue="" required className={formInputClass}>
                <option value="" disabled>Select the model's stance and position...</option>
                {POSES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Row 2: Location + Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <label className={labelClass}>
                  Location / Background
                </label>
                <select name="location" defaultValue="" className={formInputClass}>
                  <option value="" disabled>Select scene or background...</option>
                  {LOCATIONS.map((loc) => <option key={loc}>{loc}</option>)}
                </select>
              </div>

              {/* Model */}
              <div>
                <label className={labelClass}>
                  Model Style / Build
                </label>
                <select name="model" defaultValue="" className={formInputClass}>
                  <option value="" disabled>Select model characteristics...</option>
                  {MODELS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Row 3: Accessories + Other Preset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accessories */}
              <div>
                <label className={labelClass}>
                  Accessories / Jewellery
                </label>
                <select name="accessories" defaultValue="" className={formInputClass}>
                  <option value="" disabled>Select jewellery and props...</option>
                  {ACCESSORIES.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>

              {/* Other preset */}
              <div>
                <label className={labelClass}>
                  Design Change Preset
                </label>
                <select name="otherOption" defaultValue="" className={formInputClass}>
                  <option value="" disabled>Select a design modification...</option>
                  {OTHER_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>


            {/* Detailed instructions */}
            <div>
              <label className={labelClass}>
                Detailed Instructions (Advanced Prompting)
              </label>
              <textarea
                name="otherDetails"
                rows={4}
                className={formInputClass.replace("px-4 py-3", "px-4 py-3")} // Use same style for textarea
                placeholder="Example: 'keep floral print same, change base colour to deep emerald green and add elbow sleeves boat neck blouse. Use soft, cinematic lighting.'"
              />
              <p className="text-xs text-slate-500 mt-2">
                Use this for specific color, lighting, fabric, or complex design instructions.
              </p>
            </div>

            {/* Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-pink-600 text-white text-lg font-bold py-3 shadow-lg hover:bg-pink-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Request...
                  </>
                ) : (
                  "Generate New Catalog Image"
                )}
              </button>
            </div>
          </form>

          {/* Output Section */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2 text-pink-500">📸</span> 3. Generated Result
            </h2>

            <div className="text-center p-4">
              <p className="text-sm font-semibold text-slate-600 mb-4 min-h-[20px]">{status}</p>

              {generatedImage && (
                <div className="space-y-4">
                  <img
                    src={generatedImage}
                    alt="Generated Saree Image"
                    className="w-full max-h-[500px] rounded-2xl border-4 border-pink-100 shadow-xl object-contain bg-slate-50 mx-auto"
                  />
                  <button
                    onClick={handleDownload}
                    className="mt-3 px-6 py-2.5 rounded-full bg-emerald-600 text-white text-md font-semibold hover:bg-emerald-700 transition duration-200 shadow-lg"
                  >
                    ⬇️ Download High-Res Image
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}