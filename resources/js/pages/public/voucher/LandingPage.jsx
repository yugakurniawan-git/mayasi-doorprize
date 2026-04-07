import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

function LandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", code: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadCampaign();
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

    const newErrors = {};
    if (!form.name.trim()) newErrors.name = ["Nama harus diisi."];
    if (!form.phone.trim()) newErrors.phone = ["No HP harus diisi."];
    if (!form.code.trim()) newErrors.code = ["Kode unik harus diisi."];
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
        }
      });
    } else {
      const message = res.data?.message || res.data?.errors?.code?.[0] || "Kode tidak valid.";
      Swal.fire({ title: "Gagal", text: message, icon: "error", confirmButtonColor: "#16a34a" });
    }
  }

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-2xl font-bold text-gray-400">Program tidak ditemukan</p>
        <p className="text-gray-400 mt-2">Pastikan link yang kamu akses sudah benar.</p>
      </div>
    </div>
  );

  if (!campaign) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Campaign Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-gray-500 mt-2 text-sm">{campaign.description}</p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <p className="text-center text-gray-600 mb-6 text-sm">
            Masukkan data kamu dan kode unik dari stiker untuk mengetahui hadiahmu!
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Budi Santoso"
                className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {errors?.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-500 text-sm">+62</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="812345678"
                  className="flex-1 border rounded-r-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Pastikan nomor HP terhubung dengan akun e-money kamu</p>
              {errors?.phone && <p className="text-red-500 text-xs mt-1">{errors.phone[0]}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Unik</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full border rounded-lg px-4 py-3 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                maxLength={14}
              />
              {errors?.code && <p className="text-red-500 text-xs mt-1">{errors.code[0]}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Mengecek..." : "Cek Hadiah Saya!"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Dengan berpartisipasi, kamu menyetujui syarat dan ketentuan yang berlaku.
        </p>
      </div>
    </div>
  );
}

export default LandingPage;
