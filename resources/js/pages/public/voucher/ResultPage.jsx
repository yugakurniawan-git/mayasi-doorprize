import { useLocation, useParams, useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";

/* ─── CSS Animations ─────────────────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes confettiFall {
  0%   { transform: translateY(-10px) rotate(0deg) scale(1); opacity: 1; }
  80%  { opacity: 0.8; }
  100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 0; }
}
@keyframes trophyFloat {
  0%,100% { transform: translateY(0) scale(1) rotate(0deg); }
  33%     { transform: translateY(-12px) scale(1.05) rotate(-3deg); }
  66%     { transform: translateY(-6px) scale(1.02) rotate(2deg); }
}
@keyframes shimmerSweep {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 30px rgba(251,191,36,0.3), 0 8px 32px rgba(0,0,0,0.4); }
  50%     { box-shadow: 0 0 60px rgba(251,191,36,0.6), 0 8px 48px rgba(0,0,0,0.4); }
}
@keyframes expandRing {
  0%   { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(3);   opacity: 0; }
}
@keyframes countUp {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes slideInUp {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes gradientPulse {
  0%,100% { background-position: 0% 50%; }
  50%     { background-position: 100% 50%; }
}
@keyframes headShake {
  0%,100% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-8px) rotate(-5deg); }
  30% { transform: translateX(8px) rotate(5deg); }
  45% { transform: translateX(-5px) rotate(-3deg); }
  60% { transform: translateX(5px) rotate(3deg); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

/* ─── Expanding ring component ───────────────────────────────── */
function ExpandRing({ delay, color }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: 120, height: 120,
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        border: `2px solid ${color}`,
        animation: `expandRing 2.5s ease-out ${delay}s infinite`,
      }}
    />
  );
}

/* ─── Confetti piece ─────────────────────────────────────────── */
function ConfettiPiece({ left, delay, duration, color, size, rotate, isCircle }) {
  return (
    <div
      className="absolute pointer-events-none top-0"
      style={{
        left: `${left}%`,
        width: size, height: size,
        backgroundColor: color,
        borderRadius: isCircle ? '50%' : '2px',
        transform: `rotate(${rotate}deg)`,
        animation: `confettiFall ${duration}s linear ${delay}s both infinite`,
        zIndex: 0,
      }}
    />
  );
}

/* ─── Count-up hook ──────────────────────────────────────────── */
function useCountUp(target, startDelay = 600, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!target || target <= 0) return;
    let raf;
    const timer = setTimeout(() => {
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, startDelay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [target, startDelay, duration]);

  return count;
}

/* ════════════════════════════════════════════════════════════════
   RESULT PAGE
════════════════════════════════════════════════════════════════ */
function ResultPage() {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const state      = location.state;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!state) { navigate(`/v/${slug}`, { replace: true }); return; }
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  /* Deterministic confetti — 30 pieces */
  const confetti = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left:     (i * 3.4) % 100,
    delay:    (i * 0.11) % 2.5,
    duration: 2.8 + (i % 5) * 0.35,
    color:    ['#f59e0b','#8b5cf6','#10b981','#f472b6','#60a5fa','#fbbf24','#fb7185','#34d399'][i % 8],
    size:     5 + (i % 5) * 2,
    rotate:   (i * 47) % 360,
    isCircle: i % 3 === 0,
  })), []);

  if (!state) return null;

  const { is_winner, prize_name, prize_amount, name, phone, campaign_name } = state;

  // Hook must always be called unconditionally (rules of hooks)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const counted = useCountUp(is_winner ? (Number(prize_amount) || 0) : 0, 600, 1500);

  /* ════════════════════════════════════════════════════════════
     WINNER SCREEN
  ════════════════════════════════════════════════════════════ */
  if (is_winner) {
    return (
      <>
        <style>{ANIMATION_STYLES}</style>

        <div
          className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(-45deg, #0f172a, #1e1b4b, #0f172a, #13111c)',
            backgroundSize: '300% 300%',
            animation: 'gradientPulse 8s ease infinite',
          }}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 h-[5px] z-10"
               style={{ background: 'linear-gradient(90deg, #7c3aed, #d946ef, #f59e0b)' }}/>

          {/* Confetti rain */}
          {confetti.map(c => <ConfettiPiece key={c.id} {...c} />)}

          {/* Expanding rings behind trophy */}
          <div className="absolute pointer-events-none" style={{ top: '28%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <ExpandRing delay={0}   color="rgba(124,58,237,0.4)" />
            <ExpandRing delay={0.5} color="rgba(251,191,36,0.35)" />
            <ExpandRing delay={1.0} color="rgba(124,58,237,0.25)" />
          </div>

          {/* Central BG glow */}
          <div className="absolute rounded-full pointer-events-none" style={{
            width: 500, height: 500,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(251,191,36,0.07) 0%, transparent 65%)',
          }}/>

          {/* Content */}
          <div
            className="relative z-10 w-full max-w-sm text-center"
            style={{
              opacity: show ? 1 : 0,
              transform: show ? 'translateY(0)' : 'translateY(32px)',
              transition: 'opacity 0.7s ease, transform 0.7s ease',
            }}
          >
            {/* Trophy */}
            <div
              className="text-7xl mb-1 inline-block drop-shadow-2xl"
              style={{ animation: 'trophyFloat 3s ease-in-out infinite' }}
            >🏆</div>

            {/* Shimmer heading */}
            <div className="mb-1">
              <span
                className="text-4xl font-black"
                style={{
                  background: 'linear-gradient(90deg, #fbbf24, #f9a8d4, #fbbf24)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'shimmerSweep 2.5s linear infinite',
                }}
              >
                SELAMAT!
              </span>
            </div>

            <h1 className="text-white text-xl font-extrabold drop-shadow-lg mb-1">
              Kamu Menang!
            </h1>
            {campaign_name && (
              <p className="text-white/45 text-xs mb-5">{campaign_name}</p>
            )}

            {/* Prize card */}
            <div
              className="rounded-2xl p-5 mb-4 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24, #f97316)',
                backgroundSize: '200% 200%',
                animation: 'pulseGlow 2s ease-in-out infinite',
              }}
            >
              {/* Shimmer overlay */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  background: 'linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                  backgroundSize: '200% auto',
                  animation: 'shimmerSweep 3s linear infinite',
                }}
              />
              <p className="text-amber-900/65 font-bold text-[11px] uppercase tracking-widest mb-1 relative z-10">
                Hadiah Kamu
              </p>
              <p className="text-amber-900 font-extrabold text-lg leading-tight relative z-10">
                {prize_name}
              </p>
              {prize_amount > 0 && (
                <p
                  className="text-amber-900 font-black text-4xl mt-1 drop-shadow relative z-10"
                  style={{ animation: 'countUp 0.4s ease 0.6s both' }}
                >
                  Rp {counted.toLocaleString("id-ID")}
                </p>
              )}
            </div>

            {/* Winner info card */}
            <div
              className="rounded-xl p-4 text-left mb-3 border"
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(12px)',
                borderColor: 'rgba(255,255,255,0.1)',
                animation: 'slideInUp 0.5s ease 0.3s both',
              }}
            >
              <p className="text-white/40 text-[11px] uppercase tracking-wider font-semibold mb-2">
                Data Pemenang
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white font-medium text-sm">{name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                  </svg>
                  <span className="text-white font-medium text-sm">+62{phone}</span>
                </div>
              </div>
            </div>

            {/* Delivery info card */}
            <div
              className="rounded-xl p-4 text-left mb-6 border"
              style={{
                background: 'rgba(251,191,36,0.07)',
                borderColor: 'rgba(251,191,36,0.18)',
                backdropFilter: 'blur(8px)',
                animation: 'slideInUp 0.5s ease 0.6s both',
              }}
            >
              <div className="flex items-start gap-2">
                <span className="text-amber-300 text-base flex-shrink-0 mt-0.5">ℹ️</span>
                <div>
                  <p className="text-amber-200 font-bold text-xs mb-1">Informasi Pengiriman Hadiah</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Voucher e-money akan dikirim ke nomor HP kamu dalam{" "}
                    <strong className="text-amber-300">1×24 jam kerja</strong>.
                    Pastikan nomor HP aktif dan terhubung dengan akun e-money (GoPay / OVO / Dana / dll).
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/v/${slug}`)}
              className="text-white/35 hover:text-white/65 text-xs transition-colors duration-200"
              style={{ animation: 'slideInUp 0.5s ease 0.9s both' }}
            >
              ← Kembali ke halaman utama
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ════════════════════════════════════════════════════════════
     LOSER SCREEN
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px]"
             style={{ background: 'linear-gradient(90deg, #334155, #475569, #334155)' }}/>

        {/* Subtle BG orbs */}
        <div className="absolute rounded-full pointer-events-none" style={{
          width: 320, height: 320,
          top: '10%', left: '-10%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}/>
        <div className="absolute rounded-full pointer-events-none" style={{
          width: 260, height: 260,
          bottom: '5%', right: '-5%',
          background: 'radial-gradient(circle, rgba(100,116,139,0.08) 0%, transparent 70%)',
        }}/>

        {/* Content */}
        <div
          className="relative z-10 w-full max-w-sm text-center"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(32px)',
            transition: 'opacity 0.7s ease, transform 0.7s ease',
          }}
        >
          {/* Box with head-shake */}
          <div
            className="text-6xl mb-4 inline-block"
            style={{ animation: 'headShake 1s ease 0.5s both' }}
          >🎁</div>

          <h1 className="text-white text-2xl font-extrabold mb-2">
            Belum Beruntung
          </h1>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            Sayang sekali, kali ini kamu belum beruntung.<br/>
            Jangan menyerah, coba lagi dengan produk lain!
          </p>

          {/* Consolation card */}
          <div
            className="rounded-2xl p-5 mb-5 border"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.07)',
              animation: 'slideInUp 0.5s ease 0.3s both',
            }}
          >
            <p className="text-slate-300 text-sm leading-relaxed">
              Terima kasih sudah berpartisipasi,{" "}
              <strong className="text-white">{name}</strong>!
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Masih ada kesempatan di produk-produk lainnya. Semangat!
            </p>
          </div>

          {campaign_name && (
            <p className="text-slate-600 text-xs mb-5">{campaign_name}</p>
          )}

          {/* CTA button */}
          <button
            onClick={() => navigate(`/v/${slug}`)}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full text-white"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              transition: 'box-shadow 0.25s ease, transform 0.2s ease',
              animation: 'slideInUp 0.5s ease 0.6s both',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.55)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Coba Produk Lain
          </button>
        </div>
      </div>
    </>
  );
}

export default ResultPage;
