import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

/* ─── Gift box visuals ───────────────────────────────────────── */
const BOX_COLORS = [
  { base: "#dc2626", lid: "#b91c1c", ribbon: "#fbbf24", bow: "#f59e0b" },  // red
  { base: "#16a34a", lid: "#15803d", ribbon: "#fbbf24", bow: "#f59e0b" },  // green
  { base: "#7c3aed", lid: "#6d28d9", ribbon: "#f9a8d4", bow: "#f472b6" },  // purple
  { base: "#0369a1", lid: "#075985", ribbon: "#fde68a", bow: "#fbbf24" },  // blue
  { base: "#c2410c", lid: "#9a3412", ribbon: "#86efac", bow: "#4ade80" },  // orange
];

function GiftBox({ index, isSelected, isOther, isRevealing }) {
  const c = BOX_COLORS[index % BOX_COLORS.length];
  const scale = isSelected ? 1.12 : isOther ? 0.88 : 1;
  const opacity = isOther ? 0.45 : 1;

  return (
    <div
      className="transition-all duration-400 ease-out"
      style={{ transform: `scale(${scale})`, opacity, transformOrigin: "center bottom" }}
    >
      <svg width="88" height="100" viewBox="0 0 88 100" xmlns="http://www.w3.org/2000/svg">
        {/* Shadow */}
        <ellipse cx="44" cy="97" rx="28" ry="4" fill="rgba(0,0,0,0.15)"/>

        {/* Box body */}
        <rect x="8" y="42" width="72" height="50" rx="4" fill={c.base}/>
        {/* Box body right face (3D) */}
        <polygon points="80,42 88,36 88,86 80,92" fill={`${c.base}cc`}/>
        {/* Box body top face */}
        <polygon points="8,42 16,36 88,36 80,42" fill={`${c.lid}ee`}/>

        {/* Lid */}
        <rect x="4" y={isSelected && isRevealing ? 10 : 32} width="78" height="14" rx="4"
              fill={c.lid}
              style={{ transition: 'y 0.5s ease' }}/>
        {/* Lid right face */}
        <polygon points={`82,${isSelected && isRevealing ? 10 : 32} 88,${isSelected && isRevealing ? 5 : 27} 88,${isSelected && isRevealing ? 19 : 41} 82,${isSelected && isRevealing ? 24 : 46}`}
                 fill={`${c.lid}aa`}
                 style={{ transition: 'all 0.5s ease' }}/>
        {/* Lid top face */}
        <polygon points={`4,${isSelected && isRevealing ? 10 : 32} 10,${isSelected && isRevealing ? 5 : 27} 88,${isSelected && isRevealing ? 5 : 27} 82,${isSelected && isRevealing ? 10 : 32}`}
                 fill={`${c.lid}cc`}
                 style={{ transition: 'all 0.5s ease' }}/>

        {/* Vertical ribbon on body */}
        <rect x="38" y="42" width="12" height="50" fill={c.ribbon} opacity="0.85"/>
        {/* Vertical ribbon on lid */}
        <rect x="38" y={isSelected && isRevealing ? 10 : 32} width="12" height="14"
              fill={c.ribbon} opacity="0.9"
              style={{ transition: 'y 0.5s ease' }}/>

        {/* Horizontal ribbon on body */}
        <rect x="8" y="60" width="72" height="10" fill={c.ribbon} opacity="0.85"/>
        {/* Horizontal ribbon on lid */}
        <rect x="4" y={isSelected && isRevealing ? 15 : 35} width="78" height="6"
              fill={c.ribbon} opacity="0.9"
              style={{ transition: 'y 0.5s ease' }}/>

        {/* Bow left loop */}
        <ellipse cx="32" cy={isSelected && isRevealing ? 7 : 29} rx="12" ry="7"
                 fill={c.bow} opacity="0.9" transform={`rotate(-20, 32, ${isSelected && isRevealing ? 7 : 29})`}
                 style={{ transition: 'cy 0.5s ease' }}/>
        {/* Bow right loop */}
        <ellipse cx="56" cy={isSelected && isRevealing ? 7 : 29} rx="12" ry="7"
                 fill={c.bow} opacity="0.9" transform={`rotate(20, 56, ${isSelected && isRevealing ? 7 : 29})`}
                 style={{ transition: 'cy 0.5s ease' }}/>
        {/* Bow center */}
        <circle cx="44" cy={isSelected && isRevealing ? 7 : 29} r="5"
                fill={c.bow}
                style={{ transition: 'cy 0.5s ease' }}/>

        {/* Shine on lid */}
        <rect x="10" y={isSelected && isRevealing ? 13 : 35} width="20" height="3" rx="1.5"
              fill="rgba(255,255,255,0.3)"
              style={{ transition: 'y 0.5s ease' }}/>

        {/* Question mark when not selected */}
        {!isSelected && (
          <text x="44" y="74" textAnchor="middle" fontSize="22" fontWeight="bold"
                fill="rgba(255,255,255,0.5)" fontFamily="system-ui">?</text>
        )}
        {/* Loading spinner when selected + loading */}
        {isSelected && isRevealing && (
          <text x="44" y="75" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,0.8)" fontFamily="system-ui">
            ✨
          </text>
        )}
      </svg>
    </div>
  );
}

/* ─── Floating star / confetti pieces ───────────────────────── */
const STARS = [
  { size: 18, top: 8,  left: 12, delay: 0   },
  { size: 12, top: 15, left: 80, delay: 0.3 },
  { size: 20, top: 25, left: 5,  delay: 0.6 },
  { size: 14, top: 70, left: 88, delay: 0.2 },
  { size: 16, top: 85, left: 20, delay: 0.5 },
  { size: 10, top: 50, left: 92, delay: 0.8 },
  { size: 22, top: 5,  left: 55, delay: 0.4 },
  { size: 12, top: 90, left: 65, delay: 0.7 },
];

function BoxesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!state?.boxes) {
    navigate(`/v/${slug}`, { replace: true });
    return null;
  }

  const { boxes, code_id, campaign_id, name, phone, campaign_name } = state;

  async function pickBox(boxNumber) {
    if (revealed || isSubmitting || selected !== null) return;
    setSelected(boxNumber);
    setIsSubmitting(true);

    const res = await apiService("POST", "/api/public/voucher/redeem", {
      data: { code_id, campaign_id, name, phone, selected_box: boxNumber, boxes }
    });

    setIsSubmitting(false);

    if (res.status === 200 && res.data?.success) {
      setRevealed(true);
      setTimeout(() => {
        navigate(`/v/${slug}/result`, {
          state: { ...res.data, name, phone, campaign_name },
          replace: true
        });
      }, 2200);
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.data?.message || "Terjadi kesalahan, coba lagi.",
        icon: "error",
        confirmButtonColor: "#16a34a",
      });
      setSelected(null);
    }
  }

  /* Layout: 2 on top row, 3 on bottom row */
  const topBoxes    = boxes.slice(0, 2);
  const bottomBoxes = boxes.slice(2, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 via-green-700 to-green-900
                    flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Decorative top rope */}
      <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800"/>

      {/* Floating stars */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none opacity-30"
          style={{ top: `${s.top}%`, left: `${s.left}%`, fontSize: s.size, animationDelay: `${s.delay}s` }}
        >
          ✦
        </div>
      ))}

      {/* Decorative circles */}
      <div className="absolute top-8 left-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none"/>
      <div className="absolute bottom-16 right-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none"/>
      <div className="absolute top-1/2 left-2 w-16 h-16 rounded-full bg-amber-400/10 pointer-events-none"/>

      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        {campaign_name && (
          <p className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-2">
            ✦ {campaign_name} ✦
          </p>
        )}
        <h1 className="text-white text-3xl font-extrabold drop-shadow-lg">
          {revealed ? "Sedang Membuka..." : "Pilih 1 Kotak Hadiah!"}
        </h1>
        <p className="text-white/70 text-sm mt-1.5">
          {revealed
            ? "Hadiahmu sedang disiapkan ✨"
            : "Klik salah satu kotak di bawah untuk membukanya"}
        </p>
      </div>

      {/* Gift boxes */}
      <div className="relative z-10 flex flex-col items-center gap-4">

        {/* Top row — 2 boxes */}
        <div className="flex gap-6 justify-center">
          {topBoxes.map((box, i) => {
            const isSelected  = selected === box.box;
            const isOther     = selected !== null && !isSelected;
            return (
              <button
                key={box.box}
                onClick={() => pickBox(box.box)}
                disabled={selected !== null}
                className="focus:outline-none disabled:cursor-not-allowed transition-transform active:scale-95"
                title={`Kotak ${box.box}`}
              >
                <GiftBox
                  index={i}
                  isSelected={isSelected}
                  isOther={isOther}
                  isRevealing={isSelected && isSubmitting}
                />
                <p className={`text-center text-xs font-semibold mt-1 transition-all
                  ${isSelected ? 'text-amber-300' : isOther ? 'text-white/30' : 'text-white/70'}`}>
                  Kotak {box.box}
                </p>
              </button>
            );
          })}
        </div>

        {/* Bottom row — 3 boxes */}
        <div className="flex gap-5 justify-center">
          {bottomBoxes.map((box, i) => {
            const isSelected  = selected === box.box;
            const isOther     = selected !== null && !isSelected;
            return (
              <button
                key={box.box}
                onClick={() => pickBox(box.box)}
                disabled={selected !== null}
                className="focus:outline-none disabled:cursor-not-allowed transition-transform active:scale-95"
                title={`Kotak ${box.box}`}
              >
                <GiftBox
                  index={i + 2}
                  isSelected={isSelected}
                  isOther={isOther}
                  isRevealing={isSelected && isSubmitting}
                />
                <p className={`text-center text-xs font-semibold mt-1 transition-all
                  ${isSelected ? 'text-amber-300' : isOther ? 'text-white/30' : 'text-white/70'}`}>
                  Kotak {box.box}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading indicator */}
      {isSubmitting && (
        <div className="relative z-10 mt-8 flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-white/70 text-sm">Sedang membuka kotak...</p>
        </div>
      )}

      {/* Instructions */}
      {!selected && (
        <p className="relative z-10 mt-8 text-white/40 text-xs text-center">
          Hanya bisa memilih 1 kotak — pilih dengan hati!
        </p>
      )}

      {/* User info */}
      <div className="relative z-10 mt-6 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
        <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
        <span className="text-white/80 text-xs font-medium">{name}</span>
      </div>
    </div>
  );
}

export default BoxesPage;
