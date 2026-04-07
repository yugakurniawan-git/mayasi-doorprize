import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

/* ─── Floating geometric decorations (left panel) ───────────── */
const FLOAT_SHAPES = [
  { w: 64,  h: 64,  top: 5,  left: 88, color: 'rgba(139,92,246,0.08)',  shape: 'circle'  },
  { w: 40,  h: 40,  top: 20, left: 92, color: 'rgba(168,85,247,0.06)',  shape: 'circle'  },
  { w: 80,  h: 80,  top: 78, left: 2,  color: 'rgba(99,102,241,0.07)',  shape: 'circle'  },
  { w: 50,  h: 50,  top: 90, left: 85, color: 'rgba(139,92,246,0.05)',  shape: 'square'  },
  { w: 30,  h: 30,  top: 45, left: 95, color: 'rgba(217,70,239,0.06)',  shape: 'circle'  },
  { w: 55,  h: 55,  top: 60, left: 0,  color: 'rgba(99,102,241,0.05)',  shape: 'circle'  },
];

/* ─── Right panel decorative orbs ───────────────────────────── */
const RIGHT_ORBS = [
  { w: 180, h: 180, top: -5,  left: -8,  color: 'rgba(255,255,255,0.04)' },
  { w: 120, h: 120, top: 60,  left: 70,  color: 'rgba(255,255,255,0.05)' },
  { w: 80,  h: 80,  top: 30,  left: 85,  color: 'rgba(255,255,255,0.06)' },
  { w: 100, h: 100, top: 80,  left: 5,   color: 'rgba(255,255,255,0.04)' },
  { w: 60,  h: 60,  top: 15,  left: 55,  color: 'rgba(251,191,36,0.08)'  },
  { w: 45,  h: 45,  top: 50,  left: 20,  color: 'rgba(251,191,36,0.06)'  },
];

const PRIZE_ICONS = ["🏆", "💰", "🥇", "🥈", "🎖️", "🎁", "💵", "✨"];
const PRIZE_COLORS = [
  "from-amber-400 to-yellow-500",
  "from-emerald-400 to-green-500",
  "from-sky-400 to-blue-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
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
        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all
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
  const [campaign, setCampaign] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", code: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreePrivacy, setAgreePrivacy] = useState(true);

  useEffect(() => { loadCampaign(); }, [slug]);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-2xl font-bold text-gray-600">Program Tidak Ditemukan</p>
        <p className="text-gray-400 mt-2 text-sm">Pastikan link yang kamu akses sudah benar.</p>
      </div>
    </div>
  );

  /* ── Loading ─────────────────────────────────────────────── */
  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-violet-600"/>
        <p className="text-violet-700 text-sm font-medium">Memuat program...</p>
      </div>
    </div>
  );

  const hasDates  = campaign.start_date && campaign.end_date;
  const hasPrizes = campaign.prize_tiers?.length > 0;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ════ LEFT PANEL — Form ════════════════════════════════ */}
      <div className="relative flex-1 bg-white flex flex-col items-center justify-start overflow-hidden pt-0 pb-12 px-6">

        {/* Top colorful gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400 z-20"/>

        {/* Floating geometric shapes */}
        {FLOAT_SHAPES.map((s, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              width: s.w,
              height: s.h,
              top: `${s.top}%`,
              left: `${s.left}%`,
              backgroundColor: s.color,
              borderRadius: s.shape === 'circle' ? '50%' : '12px',
            }}
          />
        ))}

        {/* Campaign header */}
        <div className="relative z-20 text-center mt-10 mb-6 w-full max-w-sm">

          {/* Eyebrow label */}
          <div className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-600 text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-wider uppercase">
            <span>⚡</span> Event Promo Digital
          </div>

          {/* Gradient heading */}
          <h1
            className="text-2xl font-extrabold leading-tight mb-1"
            style={{
              background: 'linear-gradient(135deg, #7c3aed 0%, #a21caf 50%, #db2777 100%)',
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
          <div className="inline-block bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl px-5 py-2 shadow-lg shadow-violet-200 mb-2">
            <p className="text-white font-bold text-sm tracking-wide leading-tight">
              {campaign.name}
            </p>
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
          <div>
            <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all
              ${errors?.name
                ? 'border-red-400 bg-red-50'
                : 'border-purple-200 bg-white focus-within:border-violet-500 focus-within:shadow-sm focus-within:shadow-violet-100'}`}>
              <div className="flex items-center px-3 py-3 bg-violet-50 border-r-2 border-purple-200 flex-shrink-0">
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
          <div>
            <div className={`flex border-2 rounded-xl overflow-hidden transition-all
              ${errors?.phone
                ? 'border-red-400 bg-red-50'
                : 'border-purple-200 focus-within:border-violet-500 focus-within:shadow-sm focus-within:shadow-violet-100'}`}>
              <div className="flex items-center gap-1.5 px-3 py-3 bg-violet-50 border-r-2 border-purple-200 flex-shrink-0">
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

          {/* Code + submit button */}
          <div>
            <div className={`flex border-2 rounded-xl overflow-hidden transition-all
              ${errors?.code
                ? 'border-red-400 bg-red-50'
                : 'border-purple-200 focus-within:border-violet-500'}`}>
              <div className="flex items-center px-3 py-3 bg-violet-50 border-r-2 border-purple-200 flex-shrink-0">
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
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700
                           active:from-violet-800 active:to-indigo-800 text-white font-bold px-5 text-sm
                           transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
          <div className="space-y-2.5 pt-1">
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
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #4338ca 100%)' }}
      >

        {/* Top colorful gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-[5px] bg-gradient-to-r from-violet-500 via-pink-500 to-amber-400"/>

        {/* Decorative orbs */}
        {RIGHT_ORBS.map((o, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: o.w, height: o.h,
              top: `${o.top}%`, left: `${o.left}%`,
              backgroundColor: o.color,
            }}
          />
        ))}

        {/* Floating money decorations */}
        <div className="absolute top-6 left-6 text-3xl opacity-20 pointer-events-none select-none">💰</div>
        <div className="absolute top-10 right-8 text-2xl opacity-15 pointer-events-none select-none">✨</div>
        <div className="absolute bottom-10 left-10 text-2xl opacity-15 pointer-events-none select-none">💵</div>
        <div className="absolute bottom-16 right-6 text-3xl opacity-20 pointer-events-none select-none">💰</div>
        <div className="absolute top-1/3 right-3 text-xl opacity-15 pointer-events-none select-none">✨</div>

        {/* Content */}
        <div className="relative z-10 text-center w-full max-w-sm">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[11px] font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
            ✦ GRAND PRIZE ✦
          </div>

          <h2 className="text-white font-extrabold text-2xl lg:text-3xl leading-tight drop-shadow-lg mb-1">
            Hadiah Menanti<br/>Kamu!
          </h2>
          <p className="text-white/60 text-xs mb-4">
            Klaim kode unikmu &amp; pilih kotak berhadiah
          </p>

          {hasDates && (
            <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[11px] font-bold px-4 py-1.5 rounded-full mb-5">
              PERIODE {formatDateID(campaign.start_date)} — {formatDateID(campaign.end_date)}
            </div>
          )}

          {/* Prize tiers */}
          {hasPrizes ? (
            <div className="space-y-2.5 mt-2 text-left">
              {campaign.prize_tiers.map((tier, i) => (
                <div
                  key={i}
                  className="relative flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm
                             rounded-xl px-4 py-3 border border-white/20 transition-all overflow-hidden
                             shadow-lg shadow-black/10"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                >
                  {/* Colored left accent */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b ${PRIZE_COLORS[i % PRIZE_COLORS.length]}`}/>
                  <span className="text-2xl flex-shrink-0 ml-1">{PRIZE_ICONS[i] ?? "🎁"}</span>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm leading-tight">{tier.name}</p>
                    <p className="text-amber-300 font-bold text-base mt-0.5">
                      Rp {Number(tier.amount).toLocaleString("id-ID")}
                    </p>
                  </div>
                  {/* Subtle glow dot */}
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/30 flex-shrink-0"/>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 bg-white/10 rounded-2xl p-6 border border-white/20"
                 style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
              <div className="text-5xl mb-3">🎁</div>
              <p className="text-white/80 text-sm leading-relaxed">
                Klaim kode unikmu sekarang dan menangkan hadiah spesial!
              </p>
            </div>
          )}

          {/* Bottom decoration */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {["💰", "💵", "✨", "💵", "💰"].map((s, i) => (
              <span key={i} className="text-lg opacity-50">{s}</span>
            ))}
          </div>

          <p className="text-white/40 text-[11px] mt-4 leading-relaxed">
            Scan stiker QR pada kemasan produk<br/>untuk mendapatkan kode unik
          </p>
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
