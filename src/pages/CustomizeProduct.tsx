import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  Save,
  Loader2,
  Palette,
  ChevronRight,
  Check,
  Trash2,
  Move,
} from "lucide-react";

interface Logo {
  id: number;
  title: string;
}

interface LogoVariant {
  id: number;
  color: string;
  image_url: string;
}

interface ProductImage {
  id: number;
  image_url: string;
}

interface Placement {
  id: string;
  product_variant_image_id: number;
  logo_variant_id: number;
  image_url: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  w: number; // percentage 0-100
  h: number; // percentage 0-100
}

const MIN_SIZE_PCT = 5;

const CustomizeProduct: React.FC = () => {
  const { id } = useParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [selectedMainImage, setSelectedMainImage] = useState<ProductImage | null>(null);

  const [availableLogos, setAvailableLogos] = useState<Logo[]>([]);
  const [selectedLogoVariants, setSelectedLogoVariants] = useState<LogoVariant[]>([]);
  const [activeLogoId, setActiveLogoId] = useState<number | null>(null);

  const [placements, setPlacements] = useState<Placement[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  // Design name
  const [designName, setDesignName] = useState("");
  const [nameError, setNameError] = useState(false);

  const [loading, setLoading] = useState(true);
  const [fetchingVariants, setFetchingVariants] = useState(false);
  const [saving, setSaving] = useState(false);

  // Drag state
  const dragging = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
  } | null>(null);

  // Resize state
  const resizing = useRef<{
    id: string;
    startMouseX: number;
    startMouseY: number;
    startW: number;
    startH: number;
    corner: string;
    startX: number;
    startY: number;
  } | null>(null);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const prodRes = await api.get(`/api/products/${id}`);
        const productData = prodRes.data.product || prodRes.data;
        const variants = productData?.variants || [];
        const allImgs = variants.flatMap((v: any) => v.images || []);

        setProductImages(allImgs);
        if (allImgs.length > 0) setSelectedMainImage(allImgs[0]);

        const logoRes = await api.get("/api/logos/all");
        const logos = Array.isArray(logoRes.data)
          ? logoRes.data
          : logoRes.data.logos || [];

        setAvailableLogos(logos);
      } catch (err) {
        console.error("Init Error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  // =========================
  // FETCH LOGO VARIANTS
  // =========================
  const handleLogoClick = async (logoId: number) => {
    if (activeLogoId === logoId) {
      setActiveLogoId(null);
      setSelectedLogoVariants([]);
      return;
    }

    try {
      setFetchingVariants(true);
      setActiveLogoId(logoId);
      const res = await api.get(`/api/logos/${logoId}`);
      setSelectedLogoVariants(res.data.variants || []);
    } catch (err) {
      console.error("Variant Fetch Error:", err);
    } finally {
      setFetchingVariants(false);
    }
  };

  // =========================
  // ADD LOGO TO CANVAS
  // =========================
  const addVariantToCanvas = (variant: LogoVariant) => {
    if (!selectedMainImage) return;

    const newId = crypto.randomUUID();
    const newPlacement: Placement = {
      id: newId,
      product_variant_image_id: selectedMainImage.id,
      logo_variant_id: variant.id,
      image_url: variant.image_url,
      x: 35,
      y: 35,
      w: 20,
      h: 20,
    };

    setPlacements((prev) => [...prev, newPlacement]);
    setSelectedPlacementId(newId);
  };

  // =========================
  // MOUSE DRAG
  // =========================
  const getContainerRect = () => containerRef.current?.getBoundingClientRect();

  const onDragMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlacementId(id);

    const rect = getContainerRect();
    if (!rect) return;

    const p = placements.find((pl) => pl.id === id)!;
    dragging.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: p.x,
      startY: p.y,
    };
  };

  const onResizeMouseDown = (e: React.MouseEvent, id: string, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPlacementId(id);

    const p = placements.find((pl) => pl.id === id)!;
    resizing.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startW: p.w,
      startH: p.h,
      corner,
      startX: p.x,
      startY: p.y,
    };
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const rect = getContainerRect();
      if (!rect) return;

      if (dragging.current) {
        const { id, startMouseX, startMouseY, startX, startY } = dragging.current;
        const dx = ((e.clientX - startMouseX) / rect.width) * 100;
        const dy = ((e.clientY - startMouseY) / rect.height) * 100;

        setPlacements((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p;
            const newX = Math.max(0, Math.min(100 - p.w, startX + dx));
            const newY = Math.max(0, Math.min(100 - p.h, startY + dy));
            return { ...p, x: newX, y: newY };
          })
        );
      }

      if (resizing.current) {
        const { id, startMouseX, startMouseY, startW, startH, corner, startX, startY } =
          resizing.current;

        const dx = ((e.clientX - startMouseX) / rect.width) * 100;
        const dy = ((e.clientY - startMouseY) / rect.height) * 100;

        setPlacements((prev) =>
          prev.map((p) => {
            if (p.id !== id) return p;

            let newW = startW;
            let newH = startH;
            let newX = p.x;
            let newY = p.y;

            if (corner.includes("e")) newW = Math.max(MIN_SIZE_PCT, startW + dx);
            if (corner.includes("s")) newH = Math.max(MIN_SIZE_PCT, startH + dy);
            if (corner.includes("w")) {
              newW = Math.max(MIN_SIZE_PCT, startW - dx);
              newX = startX + (startW - newW);
            }
            if (corner.includes("n")) {
              newH = Math.max(MIN_SIZE_PCT, startH - dy);
              newY = startY + (startH - newH);
            }

            // Clamp within canvas
            newW = Math.min(newW, 100 - newX);
            newH = Math.min(newH, 100 - newY);

            return { ...p, w: newW, h: newH, x: newX, y: newY };
          })
        );
      }
    },
    [placements]
  );

  const onMouseUp = useCallback(() => {
    dragging.current = null;
    resizing.current = null;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // =========================
  // REMOVE PLACEMENT
  // =========================
  const removePlacement = (id: string) => {
    setPlacements((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlacementId === id) setSelectedPlacementId(null);
  };

  // =========================
  // SAVE
  // =========================
  const handleSave = async () => {
    if (!designName.trim()) {
      setNameError(true);
      return;
    }
    if (!placements.length) {
      alert("Add at least one logo to the canvas.");
      return;
    }

    try {
      setSaving(true);
      console.log(id);
      for (const p of placements) {
        await api.post("/api/customizations/add", {
          name: designName.trim(),
          product_id: id,
          product_variant_image_id: p.product_variant_image_id,
          logo_variant_id: p.logo_variant_id,
          pos_x: p.x,
          pos_y: p.y,
          logo_width: p.w,
          logo_height: p.h,
        });
      }

      alert("Customization saved successfully!");
    } catch (err) {
      console.error("Save Error:", err);
      alert("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // CANVAS CLICK DESELECT
  // =========================
  const onCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === "IMG") {
      setSelectedPlacementId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
          <p className="text-slate-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden select-none">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex flex-grow overflow-hidden">

          {/* LEFT PANEL – Logo picker */}
          <div className="w-80 bg-white border-r border-slate-200 p-4 overflow-y-auto flex-shrink-0">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-slate-700 uppercase tracking-wider">
              <Palette size={16} className="text-indigo-500" />
              Logos
            </h3>

            {availableLogos.length === 0 && (
              <p className="text-sm text-slate-400 text-center mt-8">No logos available.</p>
            )}

            {availableLogos.map((logo) => (
              <div key={logo.id} className="mb-2">
                <button
                  onClick={() => handleLogoClick(logo.id)}
                  className={`w-full flex justify-between items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeLogoId === logo.id
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-slate-50 text-slate-700 border border-transparent hover:bg-slate-100"
                  }`}
                >
                  {logo.title}
                  <ChevronRight
                    size={15}
                    className={`transition-transform ${activeLogoId === logo.id ? "rotate-90" : ""}`}
                  />
                </button>

                {activeLogoId === logo.id && (
                  <div className="mt-2 grid grid-cols-2 gap-2 px-1">
                    {fetchingVariants ? (
                      <div className="col-span-2 flex justify-center py-4">
                        <Loader2 className="animate-spin text-indigo-400" size={22} />
                      </div>
                    ) : selectedLogoVariants.length === 0 ? (
                      <p className="col-span-2 text-xs text-slate-400 text-center py-2">
                        No variants found.
                      </p>
                    ) : (
                      selectedLogoVariants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => addVariantToCanvas(v)}
                          className="flex flex-col items-center border border-slate-200 rounded-lg p-2 bg-white hover:border-indigo-400 hover:shadow-sm transition-all group"
                          title={`Add ${v.color} variant`}
                        >
                          <img
                            src={v.image_url}
                            className="h-14 w-full object-contain mb-1"
                            alt={v.color}
                          />
                          <span className="text-xs text-slate-500 group-hover:text-indigo-600">
                            {v.color}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CANVAS */}
          <div className="flex-grow flex items-center justify-center bg-slate-200 overflow-hidden">
            <div
              ref={containerRef}
              onClick={onCanvasClick}
              className="relative bg-white shadow-2xl"
              style={{ width: 500, height: 600, cursor: "default" }}
            >
              {selectedMainImage && (
                <img
                  src={selectedMainImage.image_url}
                  className="w-full h-full object-contain pointer-events-none"
                  alt="Product"
                  draggable={false}
                />
              )}

              {placements.map((p) => {
                const isSelected = selectedPlacementId === p.id;

                return (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      width: `${p.w}%`,
                      height: `${p.h}%`,
                      outline: isSelected ? "2px dashed #6366f1" : "2px solid transparent",
                      boxSizing: "border-box",
                      cursor: "move",
                      zIndex: isSelected ? 10 : 5,
                    }}
                    onMouseDown={(e) => onDragMouseDown(e, p.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlacementId(p.id);
                    }}
                  >
                    {/* Logo image */}
                    <img
                      src={p.image_url}
                      draggable={false}
                      alt="Logo"
                      style={{ width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none" }}
                    />

                    {/* Controls when selected */}
                    {isSelected && (
                      <>
                        {/* Move icon center */}
                        <div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                          <Move size={14} className="text-indigo-500 opacity-60" />
                        </div>

                        {/* Delete button */}
                        <button
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            removePlacement(p.id);
                          }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-600 z-20"
                          title="Remove logo"
                        >
                          <Trash2 size={10} />
                        </button>

                        {/* Resize handles – 8 directions */}
                        {(["nw","n","ne","e","se","s","sw","w"] as const).map((corner) => {
                          const style: React.CSSProperties = {
                            position: "absolute",
                            width: 10,
                            height: 10,
                            background: "#6366f1",
                            border: "2px solid white",
                            borderRadius: 2,
                            zIndex: 20,
                          };

                          if (corner === "nw") { style.top = -5; style.left = -5; style.cursor = "nw-resize"; }
                          if (corner === "n")  { style.top = -5; style.left = "calc(50% - 5px)"; style.cursor = "n-resize"; }
                          if (corner === "ne") { style.top = -5; style.right = -5; style.cursor = "ne-resize"; }
                          if (corner === "e")  { style.top = "calc(50% - 5px)"; style.right = -5; style.cursor = "e-resize"; }
                          if (corner === "se") { style.bottom = -5; style.right = -5; style.cursor = "se-resize"; }
                          if (corner === "s")  { style.bottom = -5; style.left = "calc(50% - 5px)"; style.cursor = "s-resize"; }
                          if (corner === "sw") { style.bottom = -5; style.left = -5; style.cursor = "sw-resize"; }
                          if (corner === "w")  { style.top = "calc(50% - 5px)"; style.left = -5; style.cursor = "w-resize"; }

                          return (
                            <div
                              key={corner}
                              style={style}
                              onMouseDown={(e) => onResizeMouseDown(e, p.id, corner)}
                            />
                          );
                        })}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT PANEL – Views + Save */}
          <div className="w-72 bg-white border-l border-slate-200 p-4 flex flex-col flex-shrink-0 overflow-y-auto">
            <h3 className="text-sm font-bold mb-3 text-slate-700 uppercase tracking-wider">
              Product Views
            </h3>

            <div className="flex-grow overflow-y-auto space-y-2 mb-4">
              {productImages.map((img) => (
                <div
                  key={img.id}
                  onClick={() => setSelectedMainImage(img)}
                  className={`relative p-1.5 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedMainImage?.id === img.id
                      ? "border-indigo-500 shadow-sm"
                      : "border-slate-200 hover:border-indigo-200"
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-24 object-contain rounded"
                  />
                  {selectedMainImage?.id === img.id && (
                    <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                      <Check size={11} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Design Name */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">
                Design Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={designName}
                onChange={(e) => {
                  setDesignName(e.target.value);
                  if (e.target.value.trim()) setNameError(false);
                }}
                placeholder="e.g. Summer Collection v1"
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${
                  nameError ? "border-red-400 bg-red-50" : "border-slate-300"
                }`}
              />
              {nameError && (
                <p className="text-xs text-red-500 mt-1">Please enter a design name.</p>
              )}
            </div>

            {/* Placement count */}
            {placements.length > 0 && (
              <p className="text-xs text-slate-400 mb-2 text-center">
                {placements.length} logo{placements.length > 1 ? "s" : ""} placed
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-xl flex justify-center items-center gap-2 font-semibold text-sm transition-colors shadow-sm"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <Save size={16} />
                  Save Design
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeProduct;