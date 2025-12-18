"use client";

import React, { useRef, useState } from "react";
import CropperModal from "../components/CropperModal"; // adjust path if needed
import { useRouter } from "next/navigation";

/* ------------------------- DROPDOWN OPTIONS (FINALIZED) ------------------------- */

const POSES = [
  "simple poses that highlight the saree's pleats, pallu, borders, and overall fit",
  "saree is the main focus",
  "Palldu spread pose",
  "Side-angle saree display",
  "Blouse zoom pose",
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
  "close up face pose",
];

const LOCATIONS = [
  "Plain white studio background, soft shadows",
  "Light grey studio background, professional catalog look",
  "Velvet Curtain Background",
  "traditional Indian backdrop",
  "street / urban style",
  "café",
  "library",
  "Pastel gradient studio background, soft and minimal",
  "Indoor office background, corporate look",
  "Modern living room background, home setting",
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

const MODELS_TYPE_BUILD = [
  "Indian woman, medium height, average build, warm skin tone",
  "fashion model professional",
  "European model, slim fair",
  "European model, young girl",
  "young African woman",
  "Indian woman, slim build, fair–medium skin tone",
  "Indian woman, curvy build, medium skin tone",
  "Indian woman, dusky skin tone, elegant look",
  "Any Indian woman, neutral catalog look",
];

const MODELS_EXPRESSION_AGE = [
  "smiling expression",
  "natural expression",
  "neutral expression (catalog look)",
  "age 20-40",
  "age 15-20",
  "GenZ style, use props",
  "smooth complexion",
];

const OTHER_OPTIONS = [
  "Match reference design as close as possible, no changes",
  "Keep same saree / dress design and same colors",
  "Keep same design, change saree colour only",
  "Keep same saree, change blouse design only",
  "Make design richer – more embroidery / work, same colours",
  "Simplify design – less embroidery, cleaner look",
  "Convert look to bridal – heavier makeup and styling",
  "Convert look to simple office-wear",
  "Match reference design but modernise slightly",
  "Follow detailed custom instructions only",
];

const HAIR_STYLES = [
  "CURLY SHORT HAIR, elegant style",
  "CURLY LONG HAIR, flowing style",
  "SHORT HAIR, neat style",
  "LONG HAIR, straight and classic",
  "HIGHLIGHT CURLY LONG HAIR",
  "HIGHLIGHT CURLY SHORT HAIR",
  "Classic Indian bun or braid",
];

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const formInputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500";

const labelClass = "block text-sm font-bold text-slate-700 mb-2";

/* ------------------------- COMPONENT ------------------------- */

export default function HomePage() {
  // UI state
  const [refPreview, setRefPreview] = useState(null); // preview URL for primary ref (original or cropped)
  const [refPreview2, setRefPreview2] = useState(null); // preview URL for second ref
  const [generatedImage, setGeneratedImage] = useState(null);
  const [status, setStatus] = useState("Awaiting your input...");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Crop controls
  const [showCropper, setShowCropper] = useState(false);
  const [selectedRefFileForCrop, setSelectedRefFileForCrop] = useState(null); // File or null; if set, used as referenceImage in submit
  const [originalRefFile, setOriginalRefFile] = useState(null); // original primary file (File)
  const selectedRefFileInput = useRef(null);

  // SECOND image file holder (unmodified)
  const [originalRefFile2, setOriginalRefFile2] = useState(null);

  // helper to detect zoom keywords (used to nudge users to crop)
  const zoomKeywords = [
    "zoom",
    "close up",
    "close-up",
    "head to knees",
    "head-to-knees",
    "zoomed",
    "closeup",
  ];

  function handleRefChange(e, setPreview, isSecond = false) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      if (!isSecond) {
        setOriginalRefFile(null);
        setSelectedRefFileForCrop(null);
      } else {
        setOriginalRefFile2(null);
      }
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);

    if (!isSecond) {
      setOriginalRefFile(file);
      // by default we send the original file; user can crop to override selectedRefFileForCrop
      setSelectedRefFileForCrop(null);
      // DO NOT clear the file input value here. Removing this avoids "No file chosen".
      console.log("Primary file selected:", file.name, file.size);
    } else {
      setOriginalRefFile2(file);
      console.log("Secondary file selected:", file.name, file.size);
    }
  }

  // Called when CropperModal returns a cropped Blob
  async function handleCropComplete(blob) {
    try {
      if (!blob) throw new Error("Cropped blob is empty");
      const croppedFile = new File([blob], "referenceImageCrop.png", {
        type: "image/png",
      });

      // Log and set state
      console.log("Crop completed — file created:", {
        name: croppedFile.name,
        size: croppedFile.size,
        type: croppedFile.type,
      });

      setSelectedRefFileForCrop(croppedFile);
      setRefPreview(URL.createObjectURL(croppedFile)); // update preview to cropped image
      setShowCropper(false);
    } catch (err) {
      console.error("handleCropComplete error:", err);
      setShowCropper(false);
    }
  }

  // Robust submit: build FormData manually, attach cropped/original file explicitly, log contents
  async function handleSubmit(e) {
    e.preventDefault();
    setGeneratedImage(null);
    setStatus("🚀 Generating image... Please wait.");
    setLoading(true);

    try {
      const form = e.currentTarget;

      // Build a clean FormData from the form; we'll re-attach files explicitly
      const rawForm = new FormData(form);
      const fd = new FormData();

      // Copy every non-file field from the raw form
      for (const [key, value] of rawForm.entries()) {
        if (key === "referenceImage" || key === "referenceImage2") continue;
        fd.append(key, value);
      }
      // ✅ REQUIRED: tell backend this is pose-based generation
      fd.append("generationMode", "POSE_BASED");

      // Attach primary image: prefer cropped file if present, otherwise originalRefFile
      if (selectedRefFileForCrop) {
        fd.append(
          "referenceImage",
          selectedRefFileForCrop,
          selectedRefFileForCrop.name
        );
        console.log(
          "Appending cropped referenceImage:",
          selectedRefFileForCrop.name,
          selectedRefFileForCrop.size
        );
      } else if (originalRefFile) {
        fd.append("referenceImage", originalRefFile, originalRefFile.name);
        console.log(
          "Appending original referenceImage:",
          originalRefFile.name,
          originalRefFile.size
        );
      } else {
        throw new Error("No primary reference image provided.");
      }

      // Attach second image if present
      if (originalRefFile2) {
        fd.append("referenceImage2", originalRefFile2, originalRefFile2.name);
        console.log(
          "Appending referenceImage2:",
          originalRefFile2.name,
          originalRefFile2.size
        );
      }

      // Debug: list form keys and file sizes (browser console)
      console.log("Final FormData to be sent:");
      for (const pair of fd.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `- ${pair[0]} => File: ${pair[1].name} (${pair[1].size} bytes)`
          );
        } else {
          console.log(`- ${pair[0]} => ${pair[1]}`);
        }
      }

      const apiUrl = `${backendUrl}/api/generate-image`;

      // DEBUG: print the final URL so we can confirm where the browser is sending the request
      // (helps diagnose 404s caused by relative paths or missing env vars)
      console.log("Posting generate request to:", apiUrl);

      const res = await fetch(apiUrl, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        let errorMsg = `Server Error: ${res.status} ${res.statusText}`;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
          } catch (err) {
            // ignore JSON parse error
          }
        } else {
          const text = await res.text();
          errorMsg += `. Details: ${text.substring(0, 200)}`;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data.imageBase64) throw new Error("Image data missing in response.");

      setGeneratedImage(`data:image/png;base64,${data.imageBase64}`);
      setStatus("✅ Image generated successfully! Scroll down to view.");

      if (data.debugAttributes) {
        console.log("Backend debugAttributes:", data.debugAttributes);
      }
    } catch (err) {
      console.error("Generation error:", err);
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
                <span className="mr-2 text-pink-500">🖼️</span> 1. Reference
                Image
              </h2>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
                  <div className="flex-1 w-full">
                    <label className={labelClass + " !mb-1"}>
                      Upload main saree / dress image (required)
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      The AI will use the design, print, and primary colors from
                      this image.
                    </p>

                    <input
                      ref={selectedRefFileInput}
                      type="file"
                      name="referenceImage"
                      required
                      accept="image/*"
                      onChange={(e) => handleRefChange(e, setRefPreview, false)}
                      className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition duration-150 cursor-pointer"
                    />

                    {/* Show crop button if a primary image is present */}
                    {refPreview && (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCropper(true)}
                          className="px-3 py-1 rounded bg-slate-100 text-sm"
                        >
                          Crop / Set Zoom
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRefPreview(null);
                            setSelectedRefFileForCrop(null);
                            setOriginalRefFile(null);
                            if (selectedRefFileInput.current)
                              selectedRefFileInput.current.value = "";
                          }}
                          className="px-3 py-1 rounded bg-red-100 text-sm"
                        >
                          Clear
                        </button>
                      </div>
                    )}
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

                <div className="flex flex-col md:flex-row justify-between gap-6 items-start">
                  <div className="flex-1 w-full">
                    <label className={labelClass + " !mb-1"}>
                      Optional second reference image
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Add another angle or fabric close-up (use for back/pallu).
                      If left empty, generation uses only the main image.
                    </p>

                    <input
                      type="file"
                      name="referenceImage2"
                      accept="image/*"
                      onChange={(e) => handleRefChange(e, setRefPreview2, true)}
                      className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-pink-50 file:text-pink-600 hover:file:bg-pink-100 transition duration-150 cursor-pointer"
                    />
                  </div>

                  <div className="w-[120px] h-[160px] md:w-[150px] md:h-[200px] flex-shrink-0 rounded-xl border-4 border-slate-300 bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    {refPreview2 ? (
                      <img
                        src={refPreview2}
                        alt="Second Reference Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-slate-400 text-center px-3">
                        Optional image preview
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* FORM CONTENT - Structured with clear groupings */}
            <h2 className="text-xl font-bold text-slate-800 border-b pb-2 mb-6 flex items-center">
              <span className="mr-2 text-pink-500">⚙️</span> 2. Customization
              Options
            </h2>

            {/* Row 1: Pose */}
            <div>
              <label className={labelClass}>Pose</label>
              <select name="pose" defaultValue="" className={formInputClass}>
                <option value="" disabled>
                  Select the model's stance and position...
                </option>
                {POSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <input
                name="poseNote"
                type="text"
                className={`${formInputClass} mt-3`}
                placeholder="Add your own pose text or override the dropdown (optional)"
              />
            </div>

            {/* Model Type + Expression/Age */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>
                  Model Type / Build (e.g., Indian, European)
                </label>
                <select
                  name="modelType"
                  defaultValue=""
                  className={formInputClass}
                >
                  <option value="" disabled>
                    Select model type and build...
                  </option>
                  {MODELS_TYPE_BUILD.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  name="modelTypeNote"
                  type="text"
                  className={`${formInputClass} mt-3`}
                  placeholder="Custom model description (optional)"
                />
              </div>

              <div>
                <label className={labelClass}>
                  Expression / Age (Select multiple)
                </label>
                <div className="p-3 border border-slate-200 bg-white rounded-xl shadow-sm space-y-2">
                  {MODELS_EXPRESSION_AGE.map((e) => (
                    <div key={e} className="flex items-center">
                      <input
                        type="checkbox"
                        name="modelExpression"
                        value={e}
                        id={`exp-${e.replace(/\s/g, "-")}`}
                        className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                      />
                      <label
                        htmlFor={`exp-${e.replace(/\s/g, "-")}`}
                        className="ml-2 text-sm text-slate-700"
                      >
                        {e}
                      </label>
                    </div>
                  ))}
                </div>
                <input
                  name="modelExpressionNote"
                  type="text"
                  className={`${formInputClass} mt-3`}
                  placeholder="Additional custom expression or age text (optional)"
                />
              </div>
            </div>

            {/* Row 3: Location + Hair Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Location / Background</label>
                <select
                  name="location"
                  defaultValue=""
                  className={formInputClass}
                >
                  <option value="" disabled>
                    Select scene or background...
                  </option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <input
                  name="locationNote"
                  type="text"
                  className={`${formInputClass} mt-3`}
                  placeholder="Custom background text (optional, can be used without dropdown)"
                />
              </div>

              <div>
                <label className={labelClass}>Hair Style</label>
                <select name="hair" defaultValue="" className={formInputClass}>
                  <option value="" disabled>
                    Select hair style...
                  </option>
                  {HAIR_STYLES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <input
                  name="hairNote"
                  type="text"
                  className={`${formInputClass} mt-3`}
                  placeholder="Custom hair style text (optional, can be used without dropdown)"
                />
              </div>
            </div>

            {/* Row 4: Accessories + Design Change Preset */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Accessories / Jewellery</label>
                <select
                  name="accessories"
                  defaultValue=""
                  className={formInputClass}
                >
                  <option value="" disabled>
                    Select jewellery and props...
                  </option>
                  {ACCESSORIES.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
                <input
                  name="accessoriesNote"
                  type="text"
                  className={`${formInputClass} mt-3`}
                  placeholder="Custom accessories text (optional, can be used without dropdown)"
                />
              </div>

              <div>
                <label className={labelClass}>Design Change Preset</label>
                <select
                  name="otherOption"
                  defaultValue=""
                  className={formInputClass}
                >
                  <option value="" disabled>
                    Select a design modification...
                  </option>
                  {OTHER_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
                <input
                  name="otherOptionNote"
                  type="text"
                  className={`${formInputClass} mt-3`}
                  placeholder="Custom design-change text (optional, can be used without dropdown)"
                />
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
                className={formInputClass.replace("px-4 py-3", "px-4 py-3")}
                placeholder="Example: 'keep floral print same, change base colour to deep emerald green and add elbow sleeves boat neck blouse. Use soft, cinematic lighting.'"
              ></textarea>
              <p className="text-xs text-slate-500 mt-2">
                Use this for specific color, lighting, fabric, or complex design
                instructions.
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
                  "Generate New Catalog Image"
                )}
              </button>
            </div>
          </form>
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => router.push("/model-reference")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full
               bg-slate-100 text-slate-700 font-semibold
               hover:bg-slate-200 transition"
            >
              Go to Model Reference Page →
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

          {/* Cropper modal */}
          {showCropper && originalRefFile && (
            <CropperModal
              src={URL.createObjectURL(originalRefFile)}
              aspect={3 / 4}
              onCancel={() => setShowCropper(false)}
              onComplete={handleCropComplete}
            />
          )}
        </div>
        {/* Navigation to Page 2 */}
        {/* Navigation */}
      </div>
    </main>
  );
}
