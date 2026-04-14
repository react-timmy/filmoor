import { useState, useEffect } from "react";
import { IconPlay } from "./Icons";

// Extract dominant color from image using canvas sampling
function getImageDominantColor(imageElement) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imageElement, 0, 0, 150, 150);
    
    const imageData = ctx.getImageData(0, 0, 150, 150);
    const data = imageData.data;
    
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    
    const pixelCount = data.length / 4;
    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);
    
    return `rgb(${r}, ${g}, ${b})`;
  } catch (e) {
    return "rgb(232, 55, 44)";
  }
}

export default function Hero({ item, onInfo, onPlay }) {
  if (!item) return null;

  const [loaded, setLoaded] = useState(false);
  const [dominantColor, setDominantColor] = useState("rgb(232, 55, 44)");

  const handleImageLoad = (e) => {
    setLoaded(true);
    const color = getImageDominantColor(e.target);
    setDominantColor(color);
  };

  const isTV = item.type === "tv" || item.type === "anime";
  const genres = item.genres?.length
    ? item.genres
    : item.genre
      ? [item.genre]
      : [];

  const handlePlay = () => {
    if (onPlay && item.id) {
      onPlay(item.id);
    }
  };

  // Parse RGB for soft glow effect
  const rgbValues = dominantColor.match(/\d+/g) || [232, 55, 44];
  const shadowColor = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.15)`;

  return (
    <div
      data-hero-section
      className="w-full px-4 py-6"
      style={{
        boxShadow: `0 8px 32px ${shadowColor}`,
      }}
    >
      {/* Hero Card Container - Mobile Netflix Design */}
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-xl bg-black"
        style={{
          boxShadow: `inset 0 0 32px ${shadowColor}`,
        }}
      >
        {/* Backdrop Image */}
        {item.backdrop ? (
          <img
            src={item.backdrop}
            alt=""
            onLoad={handleImageLoad}
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              opacity: loaded ? 1 : 0,
              transition: "opacity 0.8s ease",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900" />
        )}

        {/* Masking Gradient Overlay - Netflix Thrash Design */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, #141414 10%, transparent 50%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        {/* Content Container - Positioned at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 flex flex-col justify-end h-full">
          
          {/* Title - Premium Typography */}
          <h1 className="font-bebas uppercase text-5xl tracking-tighter text-white mb-2 font-black drop-shadow-2xl leading-tight">
            {item.title}
          </h1>

          {/* Metadata Tags */}
          {genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {genres.slice(0, 3).map((genre, i) => (
                <span
                  key={i}
                  className="text-gray-300 text-[11px] font-medium"
                >
                  {genre}
                  {i < Math.min(2, genres.length - 1) && <span className="mx-1">•</span>}
                </span>
              ))}
            </div>
          )}

          {/* Button Container */}
          <div className="flex gap-2 w-full">
            {/* Play Button */}
            <button
              onClick={handlePlay}
              className="flex-1 bg-white text-black font-bold py-2 rounded-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-95"
            >
              <IconPlay size={16} color="currentColor" />
              <span>Play</span>
            </button>

            {/* My List Button */}
            <button
              onClick={() => onInfo(item)}
              className="flex-1 bg-[#333]/70 text-white backdrop-blur-md font-bold py-2 rounded-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-95 border border-gray-600/20"
            >
              <span>+ My List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

