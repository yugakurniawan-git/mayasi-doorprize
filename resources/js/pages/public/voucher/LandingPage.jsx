import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

/* ─── Decorative SVG Lantern ────────────────────────────────── */
const Lantern = ({ height = 90 }) => (
  <svg width={height * 0.4} height={height} viewBox="0 0 36 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="18" y1="0" x2="18" y2="9" stroke="#92400e" strokeWidth="2"/>
    <ellipse cx="18" cy="12" rx="8" ry="3" fill="#78350f"/>
    <path d="M10 12 Q4 32 7 56 Q11 68 18 70 Q25 68 29 56 Q32 32 26 12 Z" fill="#d97706"/>
    <path d="M13 17 Q7 36 10 54 Q14 65 18 67 Q22 65 26 54 Q29 36 23 17 Z" fill="#fbbf24" opacity="0.75"/>
    <line x1="16" y1="22" x2="20" y2="22" stroke="#92400e" strokeWidth="0.8" opacity="0.5"/>
    <line x1="14" y1="35" x2="22" y2="35" stroke="#92400e" strokeWidth="0.8" opacity="0.5"/>
    <line x1="13" y1="48" x2="23" y2="48" stroke="#92400e" strokeWidth="0.8" opacity="0.5"/>
    <ellipse cx="18" cy="70" rx="6.5" ry="2.5" fill="#78350f"/>
    <line x1="18" y1="72.5" x2="18" y2="79" stroke="#92400e" strokeWidth="1.5"/>
    <line x1="16" y1="76" x2="14" y2="87" stroke="#92400e" strokeWidth="1"/>
    <line x1="18" y1="77" x2="18" y2="89" stroke="#92400e" strokeWidth="1"/>
    <line x1="20" y1="76" x2="22" y2="87" stroke="#92400e" strokeWidth="1"/>
  </svg>
);

/* ─── Decorative corner mandala (top-right of left panel) ───── */
const CornerOrnament = () => (
  <svg className="absolute top-0 right-0 opacity-[0.07] pointer-events-none" width="200" height="200" viewBox="0 0 200 200">
    {[20, 40, 60, 80, 110, 145].map((r, i) => (
      <circle key={i} cx="200" cy="0" r={r} stroke="#78350f" strokeWidth="1.2" fill="none"/>
    ))}
    <path d="M200 0 L120 80" stroke="#78350f" strokeWidth="0.8"/>
    <path d="M200 0 L100 60" stroke="#78350f" strokeWidth="0.8"/>
    <path d="M200 0 L150 100" stroke="#78350f" strokeWidth="0.8"/>
    <path d="M200 0 L80 80" stroke="#78350f" strokeWidth="0.8"/>
    <path d="M200 0 L60 120" stroke="#78350f" strokeWidth="0.8"/>
  </svg>
);

const CornerOrnamentBottomLeft = () => (
  <svg className="absolute bottom-0 left-0 opacity-[0.07] pointer-events-none" width="160" height="160" viewBox="0 0 160 160">
    {[20, 40, 60, 90, 120].map((r, i) => (
      <circle key={i} cx="0" cy="160" r={r} stroke="#78350f" strokeWidth="1.2" fill="none"/>
    ))}
  </svg>
);

/* ─── Pre-defined confetti for right panel (no Math.random in render) ─ */
const CONFETTI = [
  { w: 80,  h: 80,  top: 4,  left: 8,  color: 'rgba(251,191,36,0.18)' },
  { w: 50,  h: 50,  top: 15, left: 78, color: 'rgba(255,255,255,0.12)' },
  { w: 120, h: 120, top: 45, left: 82, color: 'rgba(134,239,172,0.10)' },
  { w: 40,  h: 40,  top: 72, left: 18, color: 'rgba(251,191,36,0.15)' },
  { w: 70,  h: 70,  top: 88, left: 58, color: 'rgba(255,255,255,0.09)' },
  { w: 90,  h: 90,  top: 28, left: 42, color: 'rgba(251,191,36,0.08)' },
  { w: 35,  h: 35,  top: 58, left: 4,  color: 'rgba(255,255,255,0.14)' },
  { w: 55,  h: 55,  top: 92, left: 88, color: 'rgba(134,239,172,0.12)' },
  { w: 65,  h: 65,  top: 6,  left: 55, color: 'rgba(255,255,255,0.07)' },
  { w: 45,  h: 45,  top: 38, left: 2,  color: 'rgba(251,191,36,0.10)' },
];

const PRIZE_ICONS = ["🏆", "💰", "🥇", "🥈", "🎖️", "🎁", "💵", "✨"];
const PRIZE_COLORS = [
  "from-amber-400 to-yellow-500",
  "from-green-400 to-emerald-500",
  "from-sky-400 to-blue-500",
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-500",
];

const formatDateID = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric"
  });
};

/* ─── Custom checkbox ────────────────────────────────────────── */
function CheckBox({ checked, onChange, children }) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <div
        onClick={onChange}
        className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center cursor-pointer transition-all
          ${checked ? 'bg-green-600 border-green-600' : 'bg-white border-gray-400 group-hover:border-green-400'}`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        )}
      </div>
      <span className="text-xs text-gray-600 leading-relaxed">{children}</span>
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
        confirmButtonColor: "#16a34a",
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
      Swal.fire({ title: "Gagal", text: message, icon: "error", confirmButtonColor: "#16a34a" });
    }
  }

  /* ── Not found / Loading ─────────────────────────────────── */
  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-2xl font-bold text-gray-600">Program Tidak Ditemukan</p>
        <p className="text-gray-400 mt-2 text-sm">Pastikan link yang kamu akses sudah benar.</p>
      </div>
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600"/>
        <p className="text-green-700 text-sm font-medium">Memuat program...</p>
      </div>
    </div>
  );

  const hasDates = campaign.start_date && campaign.end_date;
  const hasPrizes = campaign.prize_tiers?.length > 0;

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ════ LEFT PANEL — Form ════════════════════════════════ */}
      <div className="relative flex-1 bg-white flex flex-col items-center justify-start overflow-hidden pt-0 pb-10 px-6">

        {/* Rope line across the top */}
        <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 z-20"/>

        {/* Hanging lanterns */}
        <div className="absolute top-0 left-0 right-0 flex justify-around z-10 pointer-events-none px-4">
          {[90, 75, 90, 75, 90].map((h, i) => (
            <div key={i} className="flex flex-col items-center" style={{ marginTop: -4 }}>
              <Lantern height={h} />
            </div>
          ))}
        </div>

        {/* Corner ornaments */}
        <CornerOrnament />
        <CornerOrnamentBottomLeft />

        {/* Campaign header */}
        <div className="relative z-20 text-center mt-20 mb-5 w-full max-w-sm">
          <div className="inline-block bg-gradient-to-br from-green-600 to-green-800 rounded-2xl px-6 py-3 shadow-lg shadow-green-200 mb-3">
            <h1 className="text-xl font-extrabold text-white tracking-wide leading-tight drop-shadow">
              {campaign.name}
            </h1>
          </div>

          {hasDates && (
            <div className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-4 py-1.5 rounded-full shadow mt-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
              </svg>
              PERIODE {formatDateID(campaign.start_date)} — {formatDateID(campaign.end_date)}
            </div>
          )}

          {campaign.description && (
            <p className="text-gray-500 mt-2 text-xs leading-relaxed max-w-xs mx-auto">
              {campaign.description}
            </p>
          )}
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="relative z-20 w-full max-w-sm space-y-3">

          {/* Nama */}
          <div>
            <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all
              ${errors?.name ? 'border-red-400 bg-red-50' : 'border-green-500 bg-white focus-within:border-green-700 focus-within:shadow-sm focus-within:shadow-green-100'}`}>
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
              ${errors?.phone ? 'border-red-400 bg-red-50' : 'border-green-500 focus-within:border-green-700 focus-within:shadow-sm focus-within:shadow-green-100'}`}>
              <div className="flex items-center gap-1.5 px-3 py-3 bg-green-50 border-r-2 border-green-500 flex-shrink-0">
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
              Pastikan nomor HP terhubung dengan WhatsApp dan Akun Gopay
            </p>
            {errors?.phone && <p className="text-red-500 text-[11px] mt-1 ml-1">{errors.phone[0]}</p>}
          </div>

          {/* Code + submit button */}
          <div>
            <div className={`flex border-2 rounded-xl overflow-hidden transition-all
              ${errors?.code ? 'border-red-400 bg-red-50' : 'border-green-500 focus-within:border-green-700'}`}>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="Kode Unik"
                className="flex-1 px-4 py-3 text-sm font-mono uppercase focus:outline-none bg-transparent placeholder-gray-400 placeholder-normal tracking-wider"
                maxLength={14}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold px-5 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
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
              <button
                type="button"
                className="bg-green-600 hover:bg-green-700 text-white px-3 flex items-center justify-center transition-colors"
                title="Scan QR Code"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h7v7H3V3zm1 1v5h5V4H4zm1 1h3v3H5V5zm8-2h7v7h-7V3zm1 1v5h5V4h-5zm1 1h3v3h-3V5zM3 14h7v7H3v-7zm1 1v5h5v-5H4zm1 1h3v3H5v-3zm11 3h-2v-2h2v2zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
                </svg>
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
      <div className="flex-1 relative bg-gradient-to-b from-green-600 via-green-700 to-green-900
                      flex flex-col items-center justify-center p-8 overflow-hidden min-h-72 lg:min-h-screen">

        {/* Decorative floating circles */}
        {CONFETTI.map((c, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: c.w, height: c.h,
              top: `${c.top}%`, left: `${c.left}%`,
              backgroundColor: c.color,
            }}
          />
        ))}

        {/* Decorative top rope for right panel */}
        <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800"/>

        {/* Hanging lanterns - right panel (smaller) */}
        <div className="absolute top-0 left-0 right-0 flex justify-around z-10 pointer-events-none px-8 opacity-60">
          {[60, 50, 60].map((h, i) => (
            <div key={i} style={{ marginTop: -4 }}>
              <Lantern height={h} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center w-full max-w-sm mt-8">

          <p className="text-amber-300 font-bold tracking-[0.25em] text-xs uppercase mb-1">
            ✦ GRAND PRIZE ✦
          </p>
          <h2 className="text-white font-extrabold text-2xl lg:text-3xl leading-tight drop-shadow-lg">
            Hadiah Menanti<br/>Kamu!
          </h2>

          {hasDates && (
            <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[11px] font-bold px-4 py-1.5 rounded-full mt-3 mb-5 shadow">
              PERIODE {formatDateID(campaign.start_date)} — {formatDateID(campaign.end_date)}
            </div>
          )}

          {/* Prize tiers */}
          {hasPrizes ? (
            <div className="space-y-2.5 mt-4 text-left">
              {campaign.prize_tiers.map((tier, i) => (
                <div
                  key={i}
                  className="relative flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-sm
                             rounded-xl px-4 py-3 border border-white/10 transition-all overflow-hidden"
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
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 bg-white/10 rounded-2xl p-6 border border-white/10">
              <div className="text-5xl mb-3">🎁</div>
              <p className="text-white/80 text-sm leading-relaxed">
                Klaim kode unikmu sekarang dan menangkan hadiah spesial!
              </p>
            </div>
          )}

          {/* Stars decoration */}
          <div className="flex justify-center items-center gap-1.5 mt-6">
            {["⭐","🌟","✨","🌟","⭐"].map((s, i) => (
              <span key={i} className="text-base opacity-90">{s}</span>
            ))}
          </div>

          <p className="text-white/50 text-[11px] mt-4 leading-relaxed">
            Scan stiker QR pada kemasan produk<br/>untuk mendapatkan kode unik
          </p>
        </div>
      </div>

    </div>
  );
}

export default LandingPage;
