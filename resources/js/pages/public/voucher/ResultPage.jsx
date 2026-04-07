import { useLocation, useParams, useNavigate } from "react-router";
import { useEffect, useState, useMemo } from "react";

/* ─── CSS Animations ─────────────────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes confettiFall {
  0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1; }
  100% { transform: translateY(110vh)  rotate(720deg); opacity: 0; }
}
@keyframes trophyBounce {
  0%,100% { transform: scale(1)   rotate(0deg);  }
  30%     { transform: scale(1.3) rotate(-5deg); }
  60%     { transform: scale(1.1) rotate(4deg);  }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes pulseGlow {
  0%,100% { box-shadow: 0 0 20px rgba(251,191,36,0.3), 0 0 60px rgba(251,191,36,0.1); }
  50%     { box-shadow: 0 0 40px rgba(251,191,36,0.6), 0 0 80px rgba(251,191,36,0.25); }
}
@keyframes headShake {
  0%,100% { transform: translateX(0) rotate(0); }
  15%     { transform: translateX(-8px) rotate(-5deg); }
  30%     { transform: translateX(8px)  rotate(5deg);  }
  45%     { transform: translateX(-5px) rotate(-3deg); }
  60%     { transform: translateX(5px)  rotate(3deg);  }
}
@keyframes bgPulse {
  0%,100% { opacity: 0.4; }
  50%     { opacity: 0.7; }
}
`;

/* ─── Confetti piece component ───────────────────────────────── */
function ConfettiPiece({ left, delay, duration, color, size, rotate }) {
  return (
    <div
      className="absolute pointer-events-none top-0"
      style={{
        left: `${left}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: size > 10 ? '2px' : '50%',
        transform: `rotate(${rotate}deg)`,
        animation: `confettiFall ${duration}s linear ${delay}s both infinite`,
        zIndex: 0,
      }}
    />
  );
}

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

  /* Deterministic confetti: useMemo so values are stable */
  const confetti = useMemo(() => Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left:     (i * 4.1) % 100,
    delay:    (i * 0.13) % 2.5,
    duration: 2.5 + (i % 5) * 0.4,
    color:    ['#f59e0b', '#8b5cf6', '#10b981', '#f472b6', '#60a5fa', '#fbbf24'][i % 6],
    size:     6 + (i % 5) * 2,
    rotate:   (i * 47) % 360,
  })), []);

  if (!state) return null;

  const { is_winner, prize_name, prize_amount, name, phone, campaign_name } = state;
  const formattedAmount = prize_amount > 0
    ? `Rp ${Number(prize_amount).toLocaleString("id-ID")}`
    : null;

  /* ════════════════════════════════════════════════════════════
     WINNER SCREEN
  ════════════════════════════════════════════════════════════ */
  if (is_winner) return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #0f172a 100%)' }}
      >
        {/* Top colorful bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 z-10"/>

        {/* Confetti rain */}
        {confetti.map(c => <ConfettiPiece key={c.id} {...c} />)}

        {/* BG glow orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 450, height: 450,
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)',
            animation: 'bgPulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 300, height: 300,
            top: '-5%', right: '-5%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
            animation: 'bgPulse 4s ease-in-out infinite',
            animationDelay: '1s',
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 w-full max-w-sm text-center transition-all duration-700"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(32px)',
          }}
        >
          {/* Trophy */}
          <div
            className="text-7xl mb-2 drop-shadow-2xl inline-block"
            style={{ animation: 'trophyBounce 2s ease-in-out infinite' }}
          >
            🏆
          </div>

          {/* Confetti emoji row */}
          <div className="flex justify-center gap-1.5 mb-4">
            {["🎉", "✨", "🎊", "✨", "🎉"].map((e, i) => (
              <span
                key={i}
                className="text-xl animate-pulse"
                style={{ animationDelay: `${i * 0.15}s` }}
              >{e}</span>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-1">
            <span
              className="text-4xl font-black"
              style={{
                background: 'linear-gradient(90deg, #fbbf24, #a3e635, #fbbf24)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 2.5s linear infinite',
              }}
            >
              SELAMAT! 🎉
            </span>
          </div>
          <h1 className="text-white text-xl font-extrabold drop-shadow-lg mb-1">
            Kamu Menang!
          </h1>
          {campaign_name && (
            <p className="text-white/50 text-xs mb-5">{campaign_name}</p>
          )}

          {/* Prize card */}
          <div
            className="rounded-2xl p-5 mb-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f97316 100%)',
              animation: 'pulseGlow 2s ease-in-out infinite',
            }}
          >
            {/* Decorative shimmer overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 2s linear infinite',
              }}
            />
            {/* Corner decorations */}
            <div className="absolute top-2 right-3 text-3xl opacity-20 pointer-events-none">⭐</div>
            <div className="absolute bottom-2 left-3 text-2xl opacity-20 pointer-events-none">✨</div>

            <p className="text-amber-900/70 font-bold text-[11px] uppercase tracking-widest mb-1 relative z-10">
              Hadiah Kamu
            </p>
            <p className="text-amber-900 font-extrabold text-lg leading-tight relative z-10">
              {prize_name}
            </p>
            {formattedAmount && (
              <p className="text-amber-900 font-black text-4xl mt-1 drop-shadow relative z-10">
                {formattedAmount}
              </p>
            )}
          </div>

          {/* Winner info card — glassmorphism */}
          <div
            className="rounded-xl p-4 text-left mb-4 border"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              borderColor: 'rgba(255,255,255,0.12)',
            }}
          >
            <p className="text-white/45 text-[11px] uppercase tracking-wider font-semibold mb-2">
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
              background: 'rgba(251,191,36,0.08)',
              borderColor: 'rgba(251,191,36,0.2)',
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-amber-300 text-lg flex-shrink-0">ℹ️</span>
              <div>
                <p className="text-amber-200 font-bold text-xs mb-1">Informasi Pengiriman Hadiah</p>
                <p className="text-white/65 text-xs leading-relaxed">
                  Voucher e-money akan dikirim ke nomor HP kamu dalam{" "}
                  <strong className="text-amber-300">1×24 jam kerja</strong>.
                  Pastikan nomor HP aktif dan terhubung dengan akun e-money (GoPay / OVO / Dana / dll).
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/v/${slug}`)}
            className="text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            ← Kembali ke halaman utama
          </button>
        </div>
      </div>
    </>
  );

  /* ════════════════════════════════════════════════════════════
     LOSER SCREEN
  ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{ANIMATION_STYLES}</style>

      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600"/>

        {/* Subtle BG orbs */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 320, height: 320,
            top: '10%', left: '-10%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 260, height: 260,
            bottom: '5%', right: '-5%',
            background: 'radial-gradient(circle, rgba(100,116,139,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Content */}
        <div
          className="relative z-10 w-full max-w-sm text-center transition-all duration-700"
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(32px)',
          }}
        >
          {/* Box emoji with head-shake */}
          <div
            className="text-6xl mb-4 inline-block"
            style={{ animation: 'headShake 1.5s ease-in-out 0.5s both' }}
          >
            🎁
          </div>

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
              borderColor: 'rgba(255,255,255,0.08)',
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

          {/* Motivational icons */}
          <div className="flex justify-center gap-3 text-2xl mb-6">
            {["💪", "🌟", "🎯"].map((e, i) => (
              <span
                key={i}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              >{e}</span>
            ))}
          </div>

          {campaign_name && (
            <p className="text-slate-600 text-xs mb-4">{campaign_name}</p>
          )}

          <button
            onClick={() => navigate(`/v/${slug}`)}
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full transition-all"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 28px rgba(124,58,237,0.55)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.35)'}
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
