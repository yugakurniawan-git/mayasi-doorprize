import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

/* ─── CSS Keyframe Animations ───────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes bobUpDown {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-8px); }
}
@keyframes glowIdle {
  0%,100% { box-shadow: 0 0 12px rgba(255,255,255,0.1); }
  50%     { box-shadow: 0 0 24px rgba(255,255,255,0.25); }
}
@keyframes shake {
  0%,100% { transform: translateX(0) rotate(0); }
  20% { transform: translateX(-6px) rotate(-3deg); }
  40% { transform: translateX(6px) rotate(3deg); }
  60% { transform: translateX(-4px) rotate(-2deg); }
  80% { transform: translateX(4px) rotate(2deg); }
}
@keyframes lidOpen {
  0%   { transform: perspective(500px) rotateX(0deg) translateY(0); }
  40%  { transform: perspective(500px) rotateX(-100deg) translateY(-10px); }
  100% { transform: perspective(500px) rotateX(-140deg) translateY(-16px); }
}
@keyframes sparkleOut1 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-55px,-75px) scale(1.3);opacity:0} }
@keyframes sparkleOut2 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(55px,-75px) scale(1.3);opacity:0} }
@keyframes sparkleOut3 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-75px,-35px) scale(1.1);opacity:0} }
@keyframes sparkleOut4 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(75px,-35px) scale(1.1);opacity:0} }
@keyframes sparkleOut5 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(0,-100px) scale(1.4);opacity:0} }
@keyframes sparkleOut6 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(-35px,-90px) scale(1);opacity:0} }
@keyframes sparkleOut7 { 0%{transform:translate(0,0) scale(0);opacity:1} 100%{transform:translate(35px,-90px) scale(1);opacity:0} }
@keyframes lightBeam {
  0%   { transform: scaleY(0) translateY(0); opacity: 0.9; }
  60%  { transform: scaleY(1) translateY(-40px); opacity: 0.6; }
  100% { transform: scaleY(1.2) translateY(-60px); opacity: 0; }
}
@keyframes innerGlow {
  0%,100% { opacity: 0.5; transform: scale(0.8); }
  50%     { opacity: 1;   transform: scale(1.1); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes floatParticle {
  0%   { transform: translateY(0) rotate(0deg);   opacity: 0.8; }
  100% { transform: translateY(-200px) rotate(360deg); opacity: 0; }
}
`;

/* ─── Box color schemes ──────────────────────────────────────── */
const BOX_SCHEMES = [
  { body: '#dc2626', bodyDark: '#991b1b', ribbon: '#fbbf24', bow: '#f59e0b',  glow: 'rgba(220,38,38,0.7)'  },
  { body: '#16a34a', bodyDark: '#14532d', ribbon: '#fbbf24', bow: '#f59e0b',  glow: 'rgba(22,163,74,0.7)'  },
  { body: '#7c3aed', bodyDark: '#4c1d95', ribbon: '#f9a8d4', bow: '#f472b6',  glow: 'rgba(124,58,237,0.7)' },
  { body: '#0369a1', bodyDark: '#0c4a6e', ribbon: '#fde68a', bow: '#fbbf24',  glow: 'rgba(3,105,161,0.7)'  },
  { body: '#c2410c', bodyDark: '#7c2d12', ribbon: '#86efac', bow: '#4ade80',  glow: 'rgba(194,65,12,0.7)'  },
];

/* Bob durations per box index */
const BOB_DURATIONS = [2.0, 2.3, 2.6, 2.2, 2.5];

const SPARKLE_ANIMS = [
  'sparkleOut1','sparkleOut2','sparkleOut3',
  'sparkleOut4','sparkleOut5','sparkleOut6','sparkleOut7',
];
const SPARKLE_CHARS = ['✨','⭐','💫','✦','★','🌟','💛'];

/* ─── Ambient background particles ──────────────────────────── */
const AMBIENT_PARTICLES = [
  { size: 4, top: 8,  left: 12, delay: 0,   dur: 6   },
  { size: 5, top: 18, left: 82, delay: 0.8, dur: 7   },
  { size: 3, top: 32, left: 5,  delay: 1.6, dur: 5.5 },
  { size: 6, top: 72, left: 92, delay: 0.4, dur: 6.5 },
  { size: 4, top: 85, left: 22, delay: 1.2, dur: 7.2 },
  { size: 5, top: 55, left: 96, delay: 2.0, dur: 6   },
  { size: 3, top: 5,  left: 55, delay: 0.6, dur: 7.5 },
  { size: 4, top: 91, left: 65, delay: 1.9, dur: 5.8 },
  { size: 5, top: 42, left: 3,  delay: 2.5, dur: 6.8 },
  { size: 3, top: 65, left: 48, delay: 0.2, dur: 6.2 },
];

/* ─── GiftBox Component ──────────────────────────────────────── */
function GiftBox({ index, phase, isOther }) {
  const c = BOX_SCHEMES[index % BOX_SCHEMES.length];

  const isShaking = phase === 'shaking';
  const isOpening = phase === 'opening';
  const isOpened  = phase === 'opened';
  const isActive  = isShaking || isOpening || isOpened;

  const bobDur = BOB_DURATIONS[index % BOB_DURATIONS.length];

  const wrapperStyle = {
    transform: isActive ? 'scale(1.15)' : isOther ? 'scale(0.85)' : 'scale(1)',
    opacity: isOther ? 0.35 : 1,
    transition: 'transform 0.4s ease, opacity 0.4s ease',
    animation: isShaking ? 'shake 0.3s ease' : 'none',
  };

  return (
    <div style={wrapperStyle}>
      {/* Box wrapper with perspective */}
      <div style={{ perspective: '600px', position: 'relative', width: 104, height: 120 }}>

        {/* ── Lid ── */}
        <div
          style={{
            transformOrigin: 'bottom center',
            width: '100%',
            height: 38,
            position: 'absolute',
            top: 0,
            zIndex: 10,
            animation: isOpening || isOpened
              ? 'lidOpen 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards'
              : !isOther ? `bobUpDown ${bobDur}s ease-in-out ${index * 0.15}s infinite` : 'none',
          }}
        >
          {/* Lid surface */}
          <div style={{
            position: 'absolute', bottom: 0,
            width: '100%', height: '100%',
            borderRadius: '10px 10px 0 0',
            background: `linear-gradient(180deg, ${c.bodyDark} 0%, ${c.body} 100%)`,
            boxShadow: '0 -2px 8px rgba(0,0,0,0.3)',
          }}/>

          {/* Lid ribbon vertical */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            width: 15, height: '100%',
            background: c.ribbon, opacity: 0.9, bottom: 0,
          }}/>

          {/* Bow */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            top: -18, width: 64, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
          }}>
            {/* Left loop */}
            <div style={{
              width: 28, height: 17,
              background: c.bow,
              borderRadius: '50% 0 0 50%',
              transform: 'rotate(-20deg)',
              marginRight: -7, opacity: 0.95,
              boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
            }}/>
            {/* Center knot */}
            <div style={{
              width: 14, height: 14, borderRadius: '50%',
              background: c.bow, zIndex: 2, flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}/>
            {/* Right loop */}
            <div style={{
              width: 28, height: 17,
              background: c.bow,
              borderRadius: '0 50% 50% 0',
              transform: 'rotate(20deg)',
              marginLeft: -7, opacity: 0.95,
              boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
            }}/>
          </div>

          {/* Lid shine */}
          <div style={{
            position: 'absolute', top: 7, left: 11,
            width: 26, height: 5, borderRadius: 3,
            background: 'rgba(255,255,255,0.2)',
          }}/>
        </div>

        {/* ── Body ── */}
        <div style={{
          position: 'absolute', bottom: 0,
          width: '100%', height: 84,
          borderRadius: '0 0 12px 12px',
          background: `linear-gradient(180deg, ${c.body} 0%, ${c.bodyDark} 100%)`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
        }}>
          {/* Vertical ribbon */}
          <div style={{
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
            width: 15, height: '100%',
            background: c.ribbon, opacity: 0.85,
            borderRadius: '0 0 8px 8px',
          }}/>
          {/* Horizontal ribbon */}
          <div style={{
            position: 'absolute', top: '40%',
            width: '100%', height: 15,
            background: c.ribbon, opacity: 0.85,
          }}/>
          {/* Body shine */}
          <div style={{
            position: 'absolute', top: 8, left: 8,
            width: 20, height: 4, borderRadius: 2,
            background: 'rgba(255,255,255,0.18)',
          }}/>
          {/* Inner bottom shadow */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: 20, borderRadius: '0 0 12px 12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
          }}/>

          {/* ? mark when idle */}
          {!isActive && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 900,
              color: 'rgba(255,255,255,0.4)',
              pointerEvents: 'none',
            }}>?</div>
          )}

          {/* Inner glow when opened */}
          {isOpened && (
            <div style={{
              position: 'absolute', inset: 0,
              borderRadius: '0 0 12px 12px',
              background: `radial-gradient(circle at 50% 60%, ${c.glow} 0%, transparent 70%)`,
              animation: 'innerGlow 0.8s ease-in-out infinite',
              pointerEvents: 'none',
            }}/>
          )}

          {/* Drop shadow ellipse */}
          <div style={{
            position: 'absolute', bottom: -7, left: '50%',
            transform: 'translateX(-50%)',
            width: 78, height: 12, borderRadius: '50%',
            background: 'rgba(0,0,0,0.25)',
          }}/>
        </div>

        {/* ── Light beam ── */}
        {(isOpening || isOpened) && (
          <div style={{
            position: 'absolute', bottom: 38, left: '50%',
            transform: 'translateX(-50%)',
            width: 20, height: 80,
            background: `linear-gradient(to top, ${c.glow}, transparent)`,
            transformOrigin: 'bottom center',
            animation: 'lightBeam 0.6s ease forwards',
            zIndex: 5, pointerEvents: 'none',
            filter: 'blur(3px)',
          }}/>
        )}

        {/* ── Sparkles ── */}
        {(isOpening || isOpened) && SPARKLE_ANIMS.map((anim, i) => (
          <div
            key={i}
            style={{
              position: 'absolute', top: '30%', left: '50%',
              transform: 'translate(-50%,-50%)',
              fontSize: 14 + (i % 3) * 4,
              animation: `${anim} 0.7s ease-out forwards`,
              animationDelay: `${i * 0.05}s`,
              zIndex: 20, pointerEvents: 'none',
            }}
          >{SPARKLE_CHARS[i]}</div>
        ))}

      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   BOXES PAGE
════════════════════════════════════════════════════════════════ */
function BoxesPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const state      = location.state;

  const [selected, setSelected]         = useState(null);
  const [phase, setPhase]               = useState('idle');
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

    // Fire API immediately in parallel with animation
    setIsSubmitting(true);
    const apiStartTime = Date.now();
    const apiPromise = apiService("POST", "/api/public/voucher/redeem", {
      data: { code_id, campaign_id, name, phone, selected_box: boxNumber, boxes }
    });

    // Shaking phase — 300ms
    await new Promise(r => setTimeout(r, 300));
    setPhase('opening');

    // Opening phase — 700ms (lid animation)
    await new Promise(r => setTimeout(r, 700));
    setPhase('opened');

    // Await API result
    const res = await apiPromise;
    setIsSubmitting(false);

    if (res.status === 200 && res.data?.success) {
      // Ensure minimum 2.5s total from click before navigating
      const elapsed = Date.now() - apiStartTime;
      const minWait = 2500;
      const remaining = Math.max(0, minWait - elapsed);
      await new Promise(r => setTimeout(r, remaining));

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
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
      >
        {/* Top gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px]"
             style={{ background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f59e0b)' }}/>

        {/* BG ambient orbs */}
        <div className="absolute pointer-events-none rounded-full" style={{
          width: 420, height: 420,
          top: '-10%', left: '-10%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 70%)',
        }}/>
        <div className="absolute pointer-events-none rounded-full" style={{
          width: 360, height: 360,
          bottom: '-8%', right: '-8%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        }}/>
        <div className="absolute pointer-events-none rounded-full" style={{
          width: 200, height: 200,
          top: '42%', left: '4%',
          background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 70%)',
        }}/>

        {/* Ambient floating particles */}
        {AMBIENT_PARTICLES.map((p, i) => (
          <div
            key={i}
            className="absolute pointer-events-none rounded-full"
            style={{
              width: p.size, height: p.size,
              top: `${p.top}%`, left: `${p.left}%`,
              background: 'rgba(255,255,255,0.12)',
              animation: `floatParticle ${p.dur}s ease-in ${p.delay}s infinite`,
            }}
          />
        ))}

        {/* Header */}
        <div className="relative z-10 text-center mb-10" style={{ animation: 'fadeIn 0.6s ease both' }}>
          {campaign_name && (
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
              {campaign_name}
            </div>
          )}
          <h1 className="text-white font-black text-3xl drop-shadow-lg">
            {phase === 'idle'
              ? 'Pilih 1 Kotak Hadiah!'
              : phase === 'opened'
              ? 'Hadiahmu Terungkap!'
              : 'Membuka Kotak...'}
          </h1>
          <p className="text-white/50 text-sm mt-1.5">
            {phase === 'idle'
              ? 'Tap kotak untuk membuka hadiahmu'
              : phase === 'opened'
              ? 'Hadiahmu sedang disiapkan...'
              : 'Tunggu sebentar...'}
          </p>
        </div>

        {/* Gift boxes */}
        <div className="relative z-10 flex flex-col items-center gap-8">

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
                  className="focus:outline-none disabled:cursor-not-allowed flex flex-col items-center gap-2"
                  title={`Kotak ${box.box}`}
                >
                  <GiftBox index={i} phase={boxPhase} isOther={isOther} />
                  <p className={`text-xs font-semibold transition-all duration-300
                    ${isSelected ? 'text-amber-300' : isOther ? 'text-white/20' : 'text-white/55'}`}>
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
                  className="focus:outline-none disabled:cursor-not-allowed flex flex-col items-center gap-2"
                  title={`Kotak ${box.box}`}
                >
                  <GiftBox index={i + 2} phase={boxPhase} isOther={isOther} />
                  <p className={`text-xs font-semibold transition-all duration-300
                    ${isSelected ? 'text-amber-300' : isOther ? 'text-white/20' : 'text-white/55'}`}>
                    Kotak {box.box}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading dots */}
        {isSubmitting && (
          <div className="relative z-10 mt-8 flex flex-col items-center gap-2">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 bg-violet-400 rounded-full"
                  style={{ animation: `bobUpDown 0.8s ease-in-out ${i * 0.15}s infinite` }}
                />
              ))}
            </div>
            <p className="text-white/50 text-xs">Sedang membuka kotak...</p>
          </div>
        )}

        {/* Idle hint */}
        {phase === 'idle' && (
          <p className="relative z-10 mt-8 text-white/30 text-xs text-center">
            Hanya bisa memilih 1 kotak — pilih dengan hati!
          </p>
        )}

        {/* Player badge */}
        <div
          className="relative z-10 mt-6 flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <svg className="w-4 h-4 text-violet-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
          </svg>
          <span className="text-white/75 text-xs font-medium">{name}</span>
        </div>
      </div>
    </>
  );
}

export default BoxesPage;
