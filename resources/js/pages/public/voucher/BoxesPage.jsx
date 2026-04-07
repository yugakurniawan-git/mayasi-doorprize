import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

/* ─── CSS Keyframe Animations ───────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes shake {
  0%,100% { transform: translateX(0) rotate(0); }
  20% { transform: translateX(-6px) rotate(-3deg); }
  40% { transform: translateX(6px) rotate(3deg); }
  60% { transform: translateX(-4px) rotate(-2deg); }
  80% { transform: translateX(4px) rotate(2deg); }
}
@keyframes sparkleOut1 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(-50px,-70px) scale(1.2); opacity: 0; }
}
@keyframes sparkleOut2 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(50px,-70px) scale(1.2); opacity: 0; }
}
@keyframes sparkleOut3 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(-70px,-30px) scale(1); opacity: 0; }
}
@keyframes sparkleOut4 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(70px,-30px) scale(1); opacity: 0; }
}
@keyframes sparkleOut5 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(0px,-90px) scale(1.3); opacity: 0; }
}
@keyframes sparkleOut6 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(-30px,-80px) scale(1); opacity: 0; }
}
@keyframes sparkleOut7 {
  0%  { transform: translate(0,0) scale(0); opacity: 1; }
  100%{ transform: translate(30px,-80px) scale(1); opacity: 0; }
}
@keyframes glowPulse {
  0%,100% { opacity: 0.6; transform: scale(1); }
  50%     { opacity: 1;   transform: scale(1.3); }
}
@keyframes floatUp {
  0%   { transform: translateY(0);   opacity: 1; }
  100% { transform: translateY(-80px); opacity: 0; }
}
@keyframes lidOpen {
  0%   { transform: perspective(400px) rotateX(0deg)    translateY(0); }
  40%  { transform: perspective(400px) rotateX(-90deg)  translateY(-8px); }
  100% { transform: perspective(400px) rotateX(-130deg) translateY(-12px); }
}
@keyframes bgPulse {
  0%,100% { opacity: 0.4; }
  50%     { opacity: 0.7; }
}
`;

/* ─── Box color schemes ──────────────────────────────────────── */
const BOX_SCHEMES = [
  { body: '#dc2626', bodyDark: '#991b1b', ribbon: '#fbbf24', bow: '#f59e0b',  glow: 'rgba(220,38,38,0.6)'  }, // red
  { body: '#16a34a', bodyDark: '#14532d', ribbon: '#fbbf24', bow: '#f59e0b',  glow: 'rgba(22,163,74,0.6)'  }, // green
  { body: '#7c3aed', bodyDark: '#4c1d95', ribbon: '#f9a8d4', bow: '#f472b6',  glow: 'rgba(124,58,237,0.6)' }, // purple
  { body: '#0369a1', bodyDark: '#0c4a6e', ribbon: '#fde68a', bow: '#fbbf24',  glow: 'rgba(3,105,161,0.6)'  }, // blue
  { body: '#c2410c', bodyDark: '#7c2d12', ribbon: '#86efac', bow: '#4ade80',  glow: 'rgba(194,65,12,0.6)'  }, // orange
];

const SPARKLE_ANIMS = [
  'sparkleOut1', 'sparkleOut2', 'sparkleOut3',
  'sparkleOut4', 'sparkleOut5', 'sparkleOut6', 'sparkleOut7',
];
const SPARKLE_CHARS = ['✨', '⭐', '💫', '✦', '★', '✨', '💛'];

/* ─── GiftBox Component ──────────────────────────────────────── */
function GiftBox({ index, phase, isOther }) {
  const c = BOX_SCHEMES[index % BOX_SCHEMES.length];

  const isShaking  = phase === 'shaking';
  const isOpening  = phase === 'opening';
  const isOpened   = phase === 'opened';
  const isActive   = isShaking || isOpening || isOpened;

  const scale   = isActive ? 1.12 : isOther ? 0.88 : 1;
  const opacity = isOther ? 0.4 : 1;

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        transformOrigin: 'center bottom',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        animation: isShaking ? 'shake 0.3s ease' : 'none',
      }}
    >
      {/* Box wrapper */}
      <div style={{ perspective: '600px', position: 'relative', width: 96, height: 110 }}>

        {/* ── Lid ── */}
        <div
          style={{
            transformOrigin: 'bottom center',
            width: '100%',
            height: 36,
            position: 'absolute',
            top: 0,
            zIndex: 10,
            animation: isOpening || isOpened ? 'lidOpen 0.6s ease forwards' : 'none',
          }}
        >
          {/* Lid top surface */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '100%',
            borderRadius: '10px 10px 0 0',
            background: `linear-gradient(180deg, ${c.bodyDark} 0%, ${c.body} 100%)`,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
          }}/>

          {/* Lid ribbon vertical */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 14,
            height: '100%',
            background: c.ribbon,
            opacity: 0.9,
            bottom: 0,
          }}/>

          {/* Bow */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: -14, width: 60, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
            {/* Left loop */}
            <div style={{
              width: 26, height: 16,
              background: c.bow,
              borderRadius: '50% 0 0 50%',
              transform: 'rotate(-20deg)',
              marginRight: -6,
              opacity: 0.95,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}/>
            {/* Center knot */}
            <div style={{
              width: 14, height: 14,
              borderRadius: '50%',
              background: c.bow,
              zIndex: 2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              flexShrink: 0,
            }}/>
            {/* Right loop */}
            <div style={{
              width: 26, height: 16,
              background: c.bow,
              borderRadius: '0 50% 50% 0',
              transform: 'rotate(20deg)',
              marginLeft: -6,
              opacity: 0.95,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}/>
          </div>

          {/* Lid shine */}
          <div style={{
            position: 'absolute',
            top: 6, left: 10,
            width: 24, height: 5,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.25)',
          }}/>
        </div>

        {/* ── Body ── */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: 78,
          borderRadius: '0 0 12px 12px',
          background: `linear-gradient(180deg, ${c.body} 0%, ${c.bodyDark} 100%)`,
          boxShadow: '4px 6px 16px rgba(0,0,0,0.35)',
        }}>
          {/* Vertical ribbon */}
          <div style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 14,
            height: '100%',
            background: c.ribbon,
            opacity: 0.85,
            borderRadius: '0 0 8px 8px',
          }}/>
          {/* Horizontal ribbon */}
          <div style={{
            position: 'absolute',
            top: '42%',
            width: '100%',
            height: 14,
            background: c.ribbon,
            opacity: 0.85,
          }}/>
          {/* Body shine */}
          <div style={{
            position: 'absolute',
            top: 8, left: 8,
            width: 18, height: 4,
            borderRadius: 2,
            background: 'rgba(255,255,255,0.18)',
          }}/>
          {/* Question mark (idle) */}
          {!isActive && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.45)',
              pointerEvents: 'none',
            }}>?</div>
          )}
          {/* Shadow at bottom */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 72,
            height: 10,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.2)',
          }}/>
        </div>

        {/* ── Glow (opened phase) ── */}
        {isOpened && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: c.glow,
            filter: 'blur(16px)',
            animation: 'glowPulse 0.8s ease-in-out infinite',
            zIndex: 1,
            pointerEvents: 'none',
          }}/>
        )}

        {/* ── Sparkles (opening / opened phases) ── */}
        {(isOpening || isOpened) && SPARKLE_ANIMS.map((anim, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '30%',
              left: '50%',
              transform: 'translate(-50%,-50%)',
              fontSize: 14 + (i % 3) * 4,
              animation: `${anim} 0.7s ease-out forwards`,
              animationDelay: `${i * 0.05}s`,
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {SPARKLE_CHARS[i]}
          </div>
        ))}

      </div>
    </div>
  );
}

/* ─── Floating star BG decorations ──────────────────────────── */
const BG_STARS = [
  { top: 7,  left: 10, size: 18, delay: 0    },
  { top: 14, left: 82, size: 12, delay: 0.3  },
  { top: 25, left: 4,  size: 20, delay: 0.6  },
  { top: 72, left: 90, size: 14, delay: 0.2  },
  { top: 85, left: 18, size: 16, delay: 0.5  },
  { top: 50, left: 94, size: 10, delay: 0.8  },
  { top: 4,  left: 52, size: 22, delay: 0.4  },
  { top: 92, left: 63, size: 12, delay: 0.7  },
];

/* ════════════════════════════════════════════════════════════════
   BOXES PAGE
════════════════════════════════════════════════════════════════ */
function BoxesPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const state      = location.state;

  // phase: 'idle' | 'shaking' | 'opening' | 'opened'
  const [selected, setSelected]   = useState(null);   // box number
  const [phase, setPhase]         = useState('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!state?.boxes) {
    navigate(`/v/${slug}`, { replace: true });
    return null;
  }

  const { boxes, code_id, campaign_id, name, phone, campaign_name } = state;

  async function pickBox(boxNumber) {
    if (phase !== 'idle' || isSubmitting) return;

    setSelected(boxNumber);
    setPhase('shaking');

    // Phase 1: shaking (300ms)
    await new Promise(r => setTimeout(r, 300));
    setPhase('opening');

    // Fire API call in parallel with animation
    setIsSubmitting(true);
    const apiPromise = apiService("POST", "/api/public/voucher/redeem", {
      data: { code_id, campaign_id, name, phone, selected_box: boxNumber, boxes }
    });

    // Phase 2: opening (600ms)
    await new Promise(r => setTimeout(r, 600));
    setPhase('opened');

    // Await API result
    const res = await apiPromise;
    setIsSubmitting(false);

    if (res.status === 200 && res.data?.success) {
      // Phase 3: opened (1500ms) then navigate
      await new Promise(r => setTimeout(r, 1500));
      navigate(`/v/${slug}/result`, {
        state: { ...res.data, name, phone, campaign_name },
        replace: true,
      });
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.data?.message || "Terjadi kesalahan, coba lagi.",
        icon: "error",
        confirmButtonColor: "#7c3aed",
      });
      setSelected(null);
      setPhase('idle');
    }
  }

  const topBoxes    = boxes.slice(0, 2);
  const bottomBoxes = boxes.slice(2, 5);

  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #1e1b4b 100%)' }}
      >
        {/* Top colorful bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400"/>

        {/* BG animated pulse orbs */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 400, height: 400,
            top: '-10%', left: '-10%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
            animation: 'bgPulse 4s ease-in-out infinite',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 350, height: 350,
            bottom: '-8%', right: '-8%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
            animation: 'bgPulse 5s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 200, height: 200,
            top: '40%', left: '5%',
            background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 70%)',
            animation: 'bgPulse 3.5s ease-in-out infinite',
            animationDelay: '0.8s',
          }}
        />

        {/* Floating star decorations */}
        {BG_STARS.map((s, i) => (
          <div
            key={i}
            className="absolute pointer-events-none select-none"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              fontSize: s.size,
              color: 'rgba(255,255,255,0.15)',
              animationDelay: `${s.delay}s`,
            }}
          >
            ✦
          </div>
        ))}

        {/* Header */}
        <div className="relative z-10 text-center mb-8">
          {campaign_name && (
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
              ⚡ {campaign_name}
            </div>
          )}
          <h1 className="text-white text-3xl font-extrabold drop-shadow-lg">
            {phase === 'idle' ? 'Pilih 1 Kotak Hadiah!' : phase === 'opened' ? '🎉 Hadiahmu Terungkap!' : 'Membuka Kotak...'}
          </h1>
          <p className="text-white/60 text-sm mt-1.5">
            {phase === 'idle'
              ? 'Klik salah satu kotak di bawah untuk membukanya'
              : phase === 'opened'
              ? 'Hadiahmu sedang disiapkan ✨'
              : 'Tunggu sebentar...'}
          </p>
        </div>

        {/* Gift boxes */}
        <div className="relative z-10 flex flex-col items-center gap-6">

          {/* Top row — 2 boxes */}
          <div className="flex gap-8 justify-center">
            {topBoxes.map((box, i) => {
              const isSelected = selected === box.box;
              const isOther    = selected !== null && !isSelected;
              const boxPhase   = isSelected ? phase : 'idle';
              return (
                <button
                  key={box.box}
                  onClick={() => pickBox(box.box)}
                  disabled={phase !== 'idle'}
                  className="focus:outline-none disabled:cursor-not-allowed flex flex-col items-center gap-1"
                  title={`Kotak ${box.box}`}
                >
                  <GiftBox index={i} phase={boxPhase} isOther={isOther} />
                  <p className={`text-xs font-semibold mt-0 transition-all
                    ${isSelected ? 'text-amber-300' : isOther ? 'text-white/25' : 'text-white/60'}`}>
                    Kotak {box.box}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Bottom row — 3 boxes */}
          <div className="flex gap-6 justify-center">
            {bottomBoxes.map((box, i) => {
              const isSelected = selected === box.box;
              const isOther    = selected !== null && !isSelected;
              const boxPhase   = isSelected ? phase : 'idle';
              return (
                <button
                  key={box.box}
                  onClick={() => pickBox(box.box)}
                  disabled={phase !== 'idle'}
                  className="focus:outline-none disabled:cursor-not-allowed flex flex-col items-center gap-1"
                  title={`Kotak ${box.box}`}
                >
                  <GiftBox index={i + 2} phase={boxPhase} isOther={isOther} />
                  <p className={`text-xs font-semibold mt-0 transition-all
                    ${isSelected ? 'text-amber-300' : isOther ? 'text-white/25' : 'text-white/60'}`}>
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
                  className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p className="text-white/60 text-sm">Sedang membuka kotak...</p>
          </div>
        )}

        {/* Instruction (idle state only) */}
        {phase === 'idle' && (
          <p className="relative z-10 mt-8 text-white/35 text-xs text-center">
            Hanya bisa memilih 1 kotak — pilih dengan hati!
          </p>
        )}

        {/* User info chip */}
        <div className="relative z-10 mt-6 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-2">
          <svg className="w-4 h-4 text-violet-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
          <span className="text-white/80 text-xs font-medium">{name}</span>
        </div>
      </div>
    </>
  );
}

export default BoxesPage;
