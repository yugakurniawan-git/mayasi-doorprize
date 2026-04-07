import { useLocation, useParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";

/* ─── Pre-defined confetti pieces for winner screen ─────────── */
const CONFETTI_PIECES = [
  { x: 10,  y: 5,  size: 10, color: '#fbbf24', shape: 'circle',  delay: 0   },
  { x: 25,  y: 10, size: 8,  color: '#f472b6', shape: 'square',  delay: 0.2 },
  { x: 45,  y: 3,  size: 12, color: '#34d399', shape: 'circle',  delay: 0.4 },
  { x: 65,  y: 8,  size: 9,  color: '#60a5fa', shape: 'square',  delay: 0.1 },
  { x: 80,  y: 5,  size: 11, color: '#fbbf24', shape: 'circle',  delay: 0.3 },
  { x: 90,  y: 12, size: 7,  color: '#f87171', shape: 'square',  delay: 0.5 },
  { x: 5,   y: 20, size: 8,  color: '#a78bfa', shape: 'circle',  delay: 0.6 },
  { x: 55,  y: 15, size: 10, color: '#fbbf24', shape: 'square',  delay: 0.2 },
  { x: 35,  y: 8,  size: 6,  color: '#f472b6', shape: 'circle',  delay: 0.7 },
  { x: 72,  y: 18, size: 9,  color: '#34d399', shape: 'square',  delay: 0.4 },
  { x: 15,  y: 30, size: 7,  color: '#60a5fa', shape: 'circle',  delay: 0.3 },
  { x: 88,  y: 25, size: 11, color: '#fbbf24', shape: 'square',  delay: 0.1 },
];

function ConfettiPiece({ x, y, size, color, shape, delay }) {
  return (
    <div
      className="absolute pointer-events-none animate-bounce"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape === 'circle' ? '50%' : '2px',
        animationDelay: `${delay}s`,
        animationDuration: `${1.2 + delay}s`,
        opacity: 0.85,
      }}
    />
  );
}

/* ─── Lantern for decoration ─────────────────────────────────── */
const MiniLantern = ({ color = "#d97706" }) => (
  <svg width="16" height="34" viewBox="0 0 16 34" fill="none">
    <line x1="8" y1="0" x2="8" y2="4" stroke="#78350f" strokeWidth="1.2"/>
    <ellipse cx="8" cy="5.5" rx="4" ry="1.5" fill="#78350f"/>
    <path d="M4 5.5 Q1 14 2.5 22 Q4.5 27 8 28 Q11.5 27 13.5 22 Q15 14 12 5.5 Z" fill={color}/>
    <ellipse cx="8" cy="28" rx="3.5" ry="1.3" fill="#78350f"/>
    <line x1="8" y1="29.3" x2="8" y2="33" stroke="#78350f" strokeWidth="1"/>
  </svg>
);

function ResultPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!state) { navigate(`/v/${slug}`, { replace: true }); return; }
    // Trigger entrance animation
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!state) return null;

  const { is_winner, prize_name, prize_amount, name, phone, campaign_name } = state;
  const formattedAmount = prize_amount > 0
    ? `Rp ${Number(prize_amount).toLocaleString("id-ID")}`
    : null;

  /* ── WINNER ─────────────────────────────────────────────────── */
  if (is_winner) return (
    <div className="min-h-screen bg-gradient-to-b from-green-600 via-green-700 to-green-900
                    flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Rope */}
      <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800"/>

      {/* Confetti */}
      {CONFETTI_PIECES.map((p, i) => <ConfettiPiece key={i} {...p}/>)}

      {/* Decorative mini lanterns at corners */}
      <div className="absolute top-0 left-6 opacity-60"><MiniLantern color="#f59e0b"/></div>
      <div className="absolute top-0 left-20 opacity-50"><MiniLantern color="#fbbf24"/></div>
      <div className="absolute top-0 right-6 opacity-60"><MiniLantern color="#f59e0b"/></div>
      <div className="absolute top-0 right-20 opacity-50"><MiniLantern color="#fbbf24"/></div>

      {/* Glow circle behind content */}
      <div className="absolute w-80 h-80 rounded-full bg-amber-400/10 blur-3xl pointer-events-none"/>

      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-sm text-center transition-all duration-700
          ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        {/* Trophy animation */}
        <div className="text-7xl mb-2 animate-bounce drop-shadow-2xl">🏆</div>
        <div className="flex justify-center gap-1 mb-4">
          {["🎉","✨","🎊","✨","🎉"].map((e, i) => (
            <span key={i} className="text-xl animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </div>

        <p className="text-amber-300 text-xs font-bold tracking-widest uppercase mb-1">
          ✦ SELAMAT ✦
        </p>
        <h1 className="text-white text-3xl font-extrabold drop-shadow-lg mb-1">
          Kamu Menang!
        </h1>
        {campaign_name && (
          <p className="text-white/60 text-xs mb-5">{campaign_name}</p>
        )}

        {/* Prize card */}
        <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-5 shadow-2xl shadow-amber-500/30 mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 text-4xl">⭐</div>
            <div className="absolute bottom-2 left-2 text-3xl">✨</div>
          </div>
          <p className="text-amber-900 font-bold text-xs uppercase tracking-wider mb-1 opacity-80">
            Hadiah Kamu
          </p>
          <p className="text-amber-900 font-extrabold text-lg leading-tight">{prize_name}</p>
          {formattedAmount && (
            <p className="text-amber-900 font-black text-4xl mt-1 drop-shadow">{formattedAmount}</p>
          )}
        </div>

        {/* Winner info card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/15 p-4 text-left mb-4">
          <p className="text-white/50 text-[11px] uppercase tracking-wider font-semibold mb-2">Data Pemenang</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
              </svg>
              <span className="text-white font-medium text-sm">{name}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
              </svg>
              <span className="text-white font-medium text-sm">+62{phone}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl p-4 text-left mb-6">
          <div className="flex items-start gap-2">
            <span className="text-amber-300 text-lg flex-shrink-0">ℹ️</span>
            <div>
              <p className="text-amber-200 font-bold text-xs mb-1">Informasi Pengiriman Hadiah</p>
              <p className="text-white/70 text-xs leading-relaxed">
                Voucher e-money akan dikirim ke nomor HP kamu dalam <strong className="text-amber-300">1×24 jam kerja</strong>.
                Pastikan nomor HP aktif dan terhubung dengan akun e-money (GoPay / OVO / Dana / dll).
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/v/${slug}`)}
          className="text-white/50 hover:text-white/80 text-xs transition-colors"
        >
          ← Kembali ke halaman utama
        </button>
      </div>
    </div>
  );

  /* ── LOSER ──────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900
                    flex flex-col items-center justify-center p-6 relative overflow-hidden">

      {/* Rope */}
      <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-slate-600 via-slate-500 to-slate-600"/>

      {/* Subtle decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 pointer-events-none"/>
      <div className="absolute bottom-20 right-8 w-24 h-24 rounded-full bg-white/5 pointer-events-none"/>

      <div
        className={`relative z-10 w-full max-w-sm text-center transition-all duration-700
          ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        <div className="text-6xl mb-4">🎁</div>

        <h1 className="text-white text-2xl font-extrabold mb-2">
          Belum Beruntung
        </h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Sayang sekali, kali ini kamu belum beruntung.<br/>
          Jangan menyerah, coba lagi dengan produk lain!
        </p>

        {/* Consolation card */}
        <div className="bg-white/8 border border-white/10 rounded-2xl p-5 mb-6">
          <p className="text-slate-300 text-sm leading-relaxed">
            Terima kasih sudah berpartisipasi,{" "}
            <strong className="text-white">{name}</strong>! 🙏
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Masih ada kesempatan di produk-produk lainnya. Semangat!
          </p>
        </div>

        {/* Motivational quote */}
        <div className="flex justify-center gap-2 text-2xl mb-6">
          {["💪","🌟","🎯"].map((e, i) => (
            <span key={i} className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
          ))}
        </div>

        {campaign_name && (
          <p className="text-slate-500 text-xs mb-4">{campaign_name}</p>
        )}

        <button
          onClick={() => navigate(`/v/${slug}`)}
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white/80 hover:text-white
                     text-sm font-medium px-5 py-2.5 rounded-full transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Kembali ke halaman utama
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
