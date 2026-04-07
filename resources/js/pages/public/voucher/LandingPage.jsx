import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

/* ─── Injected CSS ───────────────────────────────────────────── */
const ANIMATION_STYLES = `
@keyframes gradientMove {
  0%,100% { background-position: 0% 50%; }
  50%      { background-position: 100% 50%; }
}
@keyframes particleRise {
  0%   { transform: translateY(0) scale(1);   opacity: 0.6; }
  100% { transform: translateY(-120px) scale(0.5); opacity: 0; }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes shimmerSweep {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes pulseRing {
  0%   { transform: scale(1);   opacity: 0.6; }
  100% { transform: scale(2.5); opacity: 0;   }
}
@keyframes floatY {
  0%,100% { transform: translateY(0px); }
  50%     { transform: translateY(-10px); }
}
`;

/* ─── Right panel floating particles ────────────────────────── */
const RIGHT_PARTICLES = [
  { size: 5, top: 12, left: 8,  delay: 0,    dur: 4.5 },
  { size: 4, top: 28, left: 78, delay: 0.7,  dur: 5.2 },
  { size: 6, top: 55, left: 15, delay: 1.4,  dur: 4.8 },
  { size: 4, top: 70, left: 88, delay: 0.3,  dur: 5.5 },
  { size: 7, top: 40, left: 92, delay: 1.1,  dur: 4.2 },
  { size: 5, top: 85, left: 35, delay: 0.9,  dur: 5.0 },
  { size: 4, top: 18, left: 60, delay: 2.1,  dur: 4.7 },
  { size: 6, top: 62, left: 50, delay: 1.7,  dur: 5.3 },
];

/* ─── Right panel glow orbs ──────────────────────────────────── */
const RIGHT_ORBS = [
  { w: 300, h: 300, top: -10, left: -10, color: 'rgba(124,58,237,0.12)' },
  { w: 200, h: 200, top: 60,  left: 65,  color: 'rgba(99,102,241,0.10)' },
  { w: 150, h: 150, top: 80,  left: 5,   color: 'rgba(251,191,36,0.08)' },
];

/* ─── Left panel soft blobs ──────────────────────────────────── */
const LEFT_BLOBS = [
  { w: 140, h: 140, top:  2, left: 80, color: 'rgba(139,92,246,0.06)' },
  { w: 100, h: 100, top: 70, left: -2, color: 'rgba(99,102,241,0.05)' },
  { w:  80, h:  80, top: 88, left: 82, color: 'rgba(139,92,246,0.04)' },
];

const PRIZE_ICONS   = ["🏆", "💰", "🥇", "🥈", "🎖️", "🎁", "💵", "✨"];
const PRIZE_ACCENTS = [
  'linear-gradient(180deg,#f59e0b,#fbbf24)',
  'linear-gradient(180deg,#10b981,#34d399)',
  'linear-gradient(180deg,#3b82f6,#60a5fa)',
  'linear-gradient(180deg,#f472b6,#fb7185)',
  'linear-gradient(180deg,#8b5cf6,#a78bfa)',
];

const formatDateID = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
};

/* ─── Custom checkbox ────────────────────────────────────────── */
function CheckBox({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <div
        onClick={onChange}
        style={{ transition: 'all 0.2s ease' }}
        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer
          ${checked ? 'bg-green-500 border-green-500' : 'bg-white border-purple-300 group-hover:border-violet-400'}`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        )}
      </div>
      <span className="text-xs text-gray-500 leading-relaxed">{children}</span>
    </label>
  );
}

/* ════════════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════════════ */
function LandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign]     = useState(null);
  const [form, setForm]             = useState({ name: "", phone: "", code: "" });
  const [errors, setErrors]         = useState({});
  const [isLoading, setIsLoading]   = useState(false);
  const [notFound, setNotFound]     = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);
  const [mounted, setMounted]       = useState(false);

  useEffect(() => {
    loadCampaign();
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, [slug]);

  async function loadCampaign() {
    const res = await apiService("GET", `/api/public/voucher/${slug}`);
    if (res.status === 200 && res.data?.success) {
      setCampaign(res.data);
      document.title = res.data.name;
    } else {
      setNotFound(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});

    if (!agreeTerms || !agreePrivacy) {
      Swal.fire({
        title: "Perhatian",
        text: "Harap centang persetujuan syarat & ketentuan terlebih dahulu.",
        icon: "warning",
        confirmButtonColor: "#7c3aed",
      });
      return;
    }

    const newErrors = {};
    if (!form.name.trim())  newErrors.name  = ["Nama harus diisi."];
    if (!form.phone.trim()) newErrors.phone = ["No HP harus diisi."];
    if (!form.code.trim())  newErrors.code  = ["Kode unik harus diisi."];
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setIsLoading(true);
    const res = await apiService("POST", "/api/public/voucher/check-code", {
      data: { name: form.name, phone: form.phone, code: form.code, slug }
    });
    setIsLoading(false);

    if (res.status === 200 && res.data?.success) {
      navigate(`/v/${slug}/boxes`, {
        state: {
          boxes: res.data.boxes,
          code_id: res.data.code_id,
          campaign_id: res.data.campaign_id,
          name: form.name,
          phone: form.phone,
          campaign_name: campaign.name,
        }
      });
    } else {
      const message = res.data?.message || res.data?.errors?.code?.[0] || "Kode tidak valid.";
      Swal.fire({ title: "Gagal", text: message, icon: "error", confirmButtonColor: "#7c3aed" });
    }
  }

  /* ── Not found ───────────────────────────────────────────── */
  if (notFound) return (
    <>
      <style>{ANIMATION_STYLES}</style>
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
        <div className="text-center p-8" style={{ animation: 'fadeInUp 0.6s ease both' }}>
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-2xl font-bold text-white/80">Program Tidak Ditemukan</p>
          <p className="text-white/40 mt-2 text-sm">Pastikan link yang kamu akses sudah benar.</p>
        </div>
      </div>
    </>
  );

  /* ── Loading ─────────────────────────────────────────────── */
  if (!campaign) return (
    <>
      <style>{ANIMATION_STYLES}</style>
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full h-10 w-10 border-4 border-violet-800 border-t-violet-400" style={{ animation: 'spin 0.9s linear infinite' }}/>
          <p className="text-violet-300 text-sm font-medium">Memuat program...</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );

  const hasDates  = campaign.start_date && campaign.end_date;
  const hasPrizes = campaign.prize_tiers?.length > 0;

  /* ── Staggered form field style ── */
  const fadeField = (delay) => ({
    animation: mounted ? `fadeInUp 0.5s ease ${delay}s both` : 'none',
  });

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <>
      <style>{ANIMATION_STYLES}</style>
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ════ LEFT PANEL — Form ════════════════════════════════ */}
        <div className="relative flex-1 bg-white flex flex-col items-center justify-start overflow-hidden pt-0 pb-12 px-6">

          {/* Top gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-[5px] z-20"
               style={{ background: 'linear-gradient(90deg, #7c3aed, #d946ef, #ec4899)' }}/>

          {/* Soft blobs */}
          {LEFT_BLOBS.map((b, i) => (
            <div
              key={i}
              className="absolute pointer-events-none rounded-full"
              style={{ width: b.w, height: b.h, top: `${b.top}%`, left: `${b.left}%`, backgroundColor: b.color }}
            />
          ))}

          {/* Campaign header */}
          <div className="relative z-20 text-center mt-10 mb-6 w-full max-w-sm" style={fadeField(0.05)}>

            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-600 text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-wider uppercase">
              <span>⚡</span> EVENT PROMO BERHADIAH
            </div>

            {/* Gradient heading */}
            <h1
              className="text-2xl font-extrabold leading-tight mb-1"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #a21caf, #db2777)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🎁 Event Promo Berhadiah
            </h1>
            <p className="text-gray-500 text-sm font-medium mb-2">
              Menangkan E-Money hingga Jutaan Rupiah!
            </p>

            {/* Campaign name badge */}
            <div
              className="inline-block rounded-xl px-5 py-2 mb-2"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
              }}
            >
              <p className="text-white font-bold text-sm tracking-wide leading-tight">{campaign.name}</p>
            </div>

            {hasDates && (
              <div className="inline-flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-[11px] font-bold px-4 py-1.5 rounded-full mt-2">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                </svg>
                PERIODE {formatDateID(campaign.start_date)} — {formatDateID(campaign.end_date)}
              </div>
            )}

            {campaign.description && (
              <p className="text-gray-400 mt-2 text-xs leading-relaxed max-w-xs mx-auto">
                {campaign.description}
              </p>
            )}
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="relative z-20 w-full max-w-sm space-y-3">

            {/* Nama */}
            <div style={fadeField(0.1)}>
              <div className={`flex items-center border-2 rounded-xl overflow-hidden
                ${errors?.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white focus-within:border-violet-500 focus-within:shadow-sm focus-within:shadow-violet-100'}`}
                   style={{ transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
                <div className="flex items-center px-3 py-3 bg-violet-50 border-r-2 border-gray-200 flex-shrink-0">
                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Lengkap (Contoh: Budi Santoso)"
                  className="flex-1 px-4 py-3 text-sm focus:outline-none bg-transparent placeholder-gray-400"
                />
              </div>
              {errors?.name && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.name[0]}</p>}
            </div>

            {/* Phone */}
            <div style={fadeField(0.2)}>
              <div className={`flex border-2 rounded-xl overflow-hidden
                ${errors?.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-violet-500 focus-within:shadow-sm focus-within:shadow-violet-100'}`}
                   style={{ transition: 'border-color 0.3s ease, box-shadow 0.3s ease' }}>
                <div className="flex items-center gap-1.5 px-3 py-3 bg-violet-50 border-r-2 border-gray-200 flex-shrink-0">
                  <span className="text-base leading-none">🇮🇩</span>
                  <span className="text-sm font-semibold text-gray-700">+62</span>
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="No HP (Contoh: 812345678)"
                  className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white placeholder-gray-400"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 ml-1">
                Pastikan nomor HP terhubung dengan WhatsApp dan Akun e-money
              </p>
              {errors?.phone && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.phone[0]}</p>}
            </div>

            {/* Code + submit */}
            <div style={fadeField(0.3)}>
              <div className={`flex border-2 rounded-xl overflow-hidden
                ${errors?.code ? 'border-red-400 bg-red-50' : 'border-gray-200 focus-within:border-violet-500'}`}
                   style={{ transition: 'border-color 0.3s ease' }}>
                <div className="flex items-center px-3 py-3 bg-violet-50 border-r-2 border-gray-200 flex-shrink-0">
                  <svg className="w-4 h-4 text-violet-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="Masukkan Kode Unik"
                  className="flex-1 px-4 py-3 text-sm font-mono uppercase focus:outline-none bg-transparent placeholder-gray-400 tracking-wider"
                  maxLength={14}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
                    transition: 'all 0.25s ease',
                  }}
                  onMouseEnter={e => !isLoading && (e.currentTarget.style.background = 'linear-gradient(135deg, #6d28d9, #3730a3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #7c3aed, #4338ca)')}
                  className="text-white font-bold px-5 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                    </span>
                  ) : "KIRIM"}
                </button>
              </div>
              {errors?.code && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.code[0]}</p>}
            </div>

            {/* Checkboxes */}
            <div className="space-y-2.5 pt-1" style={fadeField(0.4)}>
              <CheckBox checked={agreeTerms} onChange={() => setAgreeTerms(!agreeTerms)}>
                Saya berusia lebih dari 18 tahun. Saya menyetujui syarat dan ketentuan yang berlaku.
              </CheckBox>
              <CheckBox checked={agreePrivacy} onChange={() => setAgreePrivacy(!agreePrivacy)}>
                Saya menyetujui penggunaan data pribadi saya (nama lengkap, dan nomor HP) untuk keperluan program ini.
              </CheckBox>
            </div>
          </form>
        </div>

        {/* ════ RIGHT PANEL — Prize Showcase ══════════════════════ */}
        <div
          className="flex-1 relative flex flex-col items-center justify-center p-8 overflow-hidden min-h-72 lg:min-h-screen"
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #0f172a)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 8s ease infinite',
          }}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 h-[5px]"
               style={{ background: 'linear-gradient(90deg, #7c3aed, #d946ef, #ec4899)' }}/>

          {/* Glow orbs */}
          {RIGHT_ORBS.map((o, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: o.w, height: o.h,
                top: `${o.top}%`, left: `${o.left}%`,
                background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
                filter: 'blur(2px)',
              }}
            />
          ))}

          {/* Floating particles */}
          {RIGHT_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: p.size, height: p.size,
                top: `${p.top}%`, left: `${p.left}%`,
                backgroundColor: 'rgba(255,255,255,0.15)',
                animation: `particleRise ${p.dur}s ease-in ${p.delay}s infinite`,
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 text-center w-full max-w-sm">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
              HADIAH UTAMA
            </div>

            {/* Main headline with floating gift */}
            <div>
              <span
                className="text-5xl inline-block mb-1"
                style={{ animation: 'floatY 3s ease-in-out infinite' }}
              >🎁</span>
              <h2 className="text-white font-black text-3xl leading-tight drop-shadow-lg mb-1">
                Raih E-Money<br/>Hingga Jutaan!
              </h2>
            </div>

            {hasDates && (
              <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/25 text-amber-300 text-[11px] font-bold px-4 py-1.5 rounded-full mb-4 mt-1">
                PERIODE {formatDateID(campaign.start_date)} — {formatDateID(campaign.end_date)}
              </div>
            )}

            {/* Prize tier cards */}
            {hasPrizes ? (
              <div className="space-y-2.5 mt-3 text-left">
                {campaign.prize_tiers.map((tier, i) => (
                  <div
                    key={i}
                    className="relative flex items-center gap-3 rounded-xl px-4 py-3 overflow-hidden cursor-default"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backdropFilter: 'blur(10px)',
                      animation: `slideInRight ${0.4 + i * 0.1}s ease both`,
                      transition: 'background 0.25s ease, transform 0.25s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-l-xl"
                      style={{ width: 3, background: PRIZE_ACCENTS[i % PRIZE_ACCENTS.length] }}
                    />
                    <span className="text-2xl flex-shrink-0 ml-1">{PRIZE_ICONS[i] ?? "🎁"}</span>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm leading-tight">{tier.name}</p>
                      <p className="text-amber-300 font-bold text-base mt-0.5">
                        Rp {Number(tier.amount).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="ml-auto w-2 h-2 rounded-full bg-white/25 flex-shrink-0"/>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="mt-5 rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <p className="text-white/70 text-sm leading-relaxed">
                  Klaim kode unikmu sekarang dan menangkan hadiah spesial!
                </p>
              </div>
            )}

            {/* Bottom note */}
            <p className="text-white/30 text-[11px] mt-5 leading-relaxed">
              Scan stiker QR pada kemasan untuk mendapatkan kode
            </p>
          </div>
        </div>

      </div>
    </>
  );
}

export default LandingPage;
