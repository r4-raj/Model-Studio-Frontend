"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/* ------------------------- POSE OPTIONS ------------------------- */
const POSE_OPTIONS = [
  { id: "kitchen-coffee", name: "Kitchen Coffee", img: "/single-kitchen-coffee.jpeg", prompt: "standing in kitchen holding coffee mug, relaxed lifestyle pose" },
  { id: "kitchen-cooking", name: "Kitchen Cooking", img: "/single-kitchen-cooking.jpeg", prompt: "cooking in kitchen, chopping vegetables, natural lifestyle pose" },
  { id: "kitchen-laptop", name: "Kitchen Laptop", img: "/single-kitchen-laptop.jpeg", prompt: "working on laptop in kitchen, modern home lifestyle pose" },
  { id: "mirror-adjustment", name: "Mirror Adjustment", img: "/single-mirror-adjustment.jpeg", prompt: "adjusting saree in front of mirror, elegant indoor pose" },
  { id: "two-model-cooking", name: "Two Model Cooking", img: "/two-model-kitchen-cooking.jpeg", prompt: "two women cooking together in kitchen, lifestyle catalog pose", disabled: true },
  { id: "two-model-reading", name: "Two Model Reading", img: "/two-model-reading.jpeg", prompt: "two women sitting together reading book, relaxed pose", disabled: true },
  { id: "two-model-standing", name: "Two Model Standing", img: "/two-model-standing.jpeg", prompt: "two women standing side by side, clean catalog pose", disabled: true },
  { id: "two-model-tea", name: "Tea Time", img: "/two-model-tea-time.jpeg", prompt: "two women holding tea cups, casual indoor lifestyle pose", disabled: true },
];

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const labelClass = "block text-sm font-bold text-slate-700 mb-2";

/* ------------------------- COMPONENT ------------------------- */

export default function HomePage() {
  const [refPreview, setRefPreview] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [status, setStatus] = useState("Awaiting your input...");
  const [loading, setLoading] = useState(false);
  const [selectedPose, setSelectedPose] = useState(null);
  const router = useRouter();

  const [originalRefFile, setOriginalRefFile] = useState(null);
  const selectedRefFileInput = useRef(null);

  function handleRefChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalRefFile(file);
    setRefPreview(URL.createObjectURL(file));
  }

  // ✅ Added missing download function
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "generated-saree-catalog.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setGeneratedImage(null);
    setStatus("🚀 Generating image...");

    try {
      if (!originalRefFile) {
        throw new Error("Reference image required");
      }
      // Require a pose client-side but avoid throwing an exception (which
      // causes the Next.js overlay). Show a user-friendly status message
      // and bail out if none selected.
      if (!selectedPose) {
        setStatus("❌ Please select a pose before generating.");
        setLoading(false);
        return;
      }

      const posePrompt = selectedPose.prompt;

      const fd = new FormData();

      // REQUIRED
      fd.append("generationMode", "POSE_BASED");
      fd.append("referenceImage", originalRefFile, originalRefFile.name);
      fd.append("pose", posePrompt);

      // OPTIONAL
      fd.append("location", "");
      fd.append("accessories", "");
      fd.append("modelType", "");
      fd.append("modelExpression", "");
      fd.append("hair", "");

      const res = await fetch(`${backendUrl}/api/generate-image`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        let msg = `Server error ${res.status}`;
        try {
          const errData = await res.json();
          msg = errData.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();

      if (!data.imageBase64) {
        throw new Error("No image returned from backend");
      }

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setStatus("✅ Image generated successfully!");
    } catch (err) {
      console.error("Generation error:", err);
      setStatus("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-pink-600 py-4 px-8">
          <h1 className="text-center text-2xl font-extrabold text-white">
            ✨ AI Saree Catalog Generator
          </h1>
          <p className="text-center text-sm text-pink-100">
            Upload image and select a fixed pose
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            {/* Reference Image */}
            <div className="mb-10">
              <label className={labelClass}>Reference Saree Image</label>
              <input
                ref={selectedRefFileInput}
                type="file"
                required
                accept="image/*"
                onChange={handleRefChange}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-pink-50 file:text-pink-600"
              />

              {refPreview && (
                <div className="mt-4 w-[150px] h-[200px] border rounded-xl overflow-hidden">
                  <img src={refPreview} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
            </div>

            {/* Pose Selection */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-slate-800 mb-4">
                🧍‍♀️ Select Pose
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {POSE_OPTIONS.map((pose) => (
                  <button
                    key={pose.id}
                    type="button"
                    onClick={() => !pose.disabled && setSelectedPose(pose)}
                    disabled={pose.disabled}
                    aria-disabled={pose.disabled ? "true" : "false"}
                    className={`rounded-2xl border bg-white overflow-hidden transition
                    ${selectedPose?.id === pose.id
                        ? "ring-4 ring-pink-500 border-pink-500"
                        : "hover:shadow-xl hover:-translate-y-1"
                      } ${pose.disabled ? "opacity-50 cursor-not-allowed select-none" : ""}`}
                  >
                    <div className="aspect-[3/4] bg-slate-100 flex items-center justify-center">
                      <img
                        src={pose.img}
                        className="max-h-full max-w-full object-contain"
                        alt={pose.name}
                      />
                    </div>
                    <div className="p-3 text-center text-sm font-semibold">
                      {pose.name}
                      {pose.disabled && (
                        <div className="text-xs text-slate-400 mt-1">Locked</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button (Inside Form) */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-pink-600 text-white text-lg font-bold py-3 shadow-lg hover:bg-pink-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing Request...
                  </>
                ) : (
                  "Generate Catalog Image"
                )}
              </button>
            </div>
          </form>

          {/* Navigation */}
          <div className="mt-8 text-center flex flex-col md:flex-row justify-center gap-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
            >
              ← Back to Home
            </button>
          </div>

          {/* Output Section */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="mr-2 text-pink-500">📸</span> 3. Generated Result
            </h2>

            <div className="text-center p-4">
              <p className="text-sm font-semibold text-slate-600 mb-4 min-h-[20px]">
                {status}
              </p>

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