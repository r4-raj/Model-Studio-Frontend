"use client";

import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../lib/cropUtils"; // relative path adjust as needed

export default function CropperModal({ src, onCancel, onComplete, aspect = 3 / 4 }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropCompleteInternal = useCallback((_, croppedAreaPixelsLocal) => {
    setCroppedAreaPixels(croppedAreaPixelsLocal);
  }, []);

  const handleDone = useCallback(async () => {
    try {
      setProcessing(true);
      const blob = await getCroppedImg(src, croppedAreaPixels, 0);
      console.log("CropperModal: cropped blob size:", blob?.size);
      onComplete(blob);
    } catch (err) {
      console.error("CropperModal: getCroppedImg error:", err);
      onCancel();
    } finally {
      setProcessing(false);
    }
  }, [src, croppedAreaPixels, onComplete, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-lg w-[90vw] max-w-3xl p-4">
        <div style={{ position: "relative", width: "100%", height: 480, background: "#333" }}>
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
          />
        </div>

        <div className="mt-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium">Zoom</label>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          </div>
          <div className="space-x-2">
            <button onClick={onCancel} disabled={processing} className="px-4 py-2 rounded bg-slate-200">Cancel</button>
            <button onClick={handleDone} disabled={processing} className="px-4 py-2 rounded bg-pink-600 text-white">
              {processing ? "Processing…" : "Use Crop"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}