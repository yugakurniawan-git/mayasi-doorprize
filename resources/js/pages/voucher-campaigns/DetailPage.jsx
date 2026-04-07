import PrivateLayout from "../../components/layouts/PrivateLayout";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { apiService, apiServicePost, apiServiceDelete } from "../../services/api.services";
import Button from "../../components/elements/Button";
import TextInput from "../../components/elements/input/TextInput";
import { Toast } from "../../helpers";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import useAuth from "../../hooks/useAuth";

function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = useAuth();
  const [campaign, setCampaign] = useState(null);
  const [stats, setStats] = useState(null);
  const [tierForm, setTierForm] = useState({ name: "", amount: "", daily_limit: "", sort_order: 0 });
  const [tierErrors, setTierErrors] = useState({});
  const [editingTier, setEditingTier] = useState(null);
  const [generateQty, setGenerateQty] = useState(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [codes, setCodes] = useState([]);
  const [codesPage, setCodesPage] = useState(1);

  useEffect(() => {
    loadCampaign();
    loadStats();
    loadCodes();
  }, [id]);

  async function loadCampaign() {
    const res = await apiService("GET", `/api/voucher-campaigns/${id}`);
    if (res.status === 200) setCampaign(res.data);
  }

  async function loadStats() {
    const res = await apiService("GET", `/api/voucher-campaigns/${id}/stats`);
    if (res.status === 200) setStats(res.data);
  }

  async function loadCodes(page = 1) {
    const res = await apiService("GET", `/api/voucher-campaigns/${id}/codes`, {
      params: { page, per_page: 20 }
    });
    if (res.status === 200) setCodes(res.data);
  }

  async function saveTier(e) {
    e.preventDefault();
    const payload = editingTier ? { ...tierForm, id: editingTier.id } : tierForm;
    const res = await apiServicePost(`/api/voucher-campaigns/${id}/prize-tiers`, payload);
    if ([200, 201].includes(res.status)) {
      Toast.fire({ icon: "success", title: "Prize tier saved" });
      setTierForm({ name: "", amount: "", daily_limit: "", sort_order: 0 });
      setEditingTier(null);
      setTierErrors({});
      loadCampaign();
      loadStats();
    } else {
      setTierErrors(res.data?.errors || {});
    }
  }

  async function deleteTier(tier) {
    Swal.fire({
      title: "Delete prize tier?",
      text: "This will remove the tier.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiServiceDelete(`/api/voucher-campaigns/${id}/prize-tiers/${tier.id}`);
        if (res.status === 200) {
          Toast.fire({ icon: "success", title: "Tier deleted" });
          loadCampaign();
          loadStats();
        }
      }
    });
  }

  async function generateCodes() {
    setIsGenerating(true);
    const res = await apiServicePost(`/api/voucher-campaigns/${id}/codes/generate`, { quantity: generateQty });
    setIsGenerating(false);
    if (res.status === 200) {
      Toast.fire({ icon: "success", title: res.data.message });
      loadStats();
      loadCodes();
    }
  }

  const formatRupiah = (amount) => amount === 0 ? "Belum Beruntung" : `Rp ${amount.toLocaleString("id-ID")}`;

  if (!campaign) return <PrivateLayout><div className="p-6 text-gray-400">Loading...</div></PrivateLayout>;

  return (
    <PrivateLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/voucher-campaigns")} className="text-gray-500 hover:text-gray-800">
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{campaign.name}</h1>
            <code className="text-xs text-gray-500">/v/{campaign.slug}</code>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Codes" value={stats.total_codes} />
            <StatCard label="Used Codes" value={stats.used_codes} />
            <StatCard label="Redemptions" value={stats.total_redemptions} />
            <StatCard label="Unused Codes" value={stats.total_codes - stats.used_codes} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prize Tiers */}
          <div className="bg-white rounded-lg shadow p-4 space-y-4">
            <h2 className="font-semibold text-gray-700">Prize Tiers</h2>

            {/* Today's quota overview */}
            {stats?.prize_tiers?.length > 0 && (
              <div className="space-y-2">
                {stats.prize_tiers.map(tier => (
                  <div key={tier.id} className="flex justify-between items-center text-sm border rounded px-3 py-2">
                    <span className="font-medium">{tier.name}</span>
                    <span className="text-gray-500">
                      Today: <strong>{tier.today_used}</strong> / {tier.daily_limit} &nbsp;
                      <span className={tier.today_remaining > 0 ? "text-green-600" : "text-red-500"}>
                        ({tier.today_remaining} left)
                      </span>
                    </span>
                    <div className="flex gap-1">
                      <button
                        className="text-blue-500 hover:text-blue-700 text-xs px-2"
                        onClick={() => { setEditingTier(tier); setTierForm({ name: tier.name, amount: tier.amount, daily_limit: tier.daily_limit, sort_order: tier.sort_order }); }}
                      >Edit</button>
                      <button className="text-red-500 hover:text-red-700 text-xs px-2" onClick={() => deleteTier(tier)}>Del</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Tier Form */}
            {can("manage voucher prize tiers") && (
              <form onSubmit={saveTier} className="border-t pt-4 space-y-3">
                <p className="text-sm font-semibold text-gray-600">{editingTier ? "Edit Tier" : "Add Prize Tier"}</p>
                <TextInput
                  label="Name"
                  required
                  value={tierForm.name}
                  placeholder="e.g. Voucher Rp100.000"
                  onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                  error={tierErrors?.name}
                />
                <div className="grid grid-cols-2 gap-2">
                  <TextInput
                    label="Amount (Rp)"
                    type="number"
                    required
                    value={tierForm.amount}
                    placeholder="100000"
                    onChange={(e) => setTierForm({ ...tierForm, amount: e.target.value })}
                    error={tierErrors?.amount}
                  />
                  <TextInput
                    label="Daily Limit"
                    type="number"
                    required
                    value={tierForm.daily_limit}
                    placeholder="5"
                    onChange={(e) => setTierForm({ ...tierForm, daily_limit: e.target.value })}
                    error={tierErrors?.daily_limit}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="text-sm">{editingTier ? "Update" : "Add Tier"}</Button>
                  {editingTier && (
                    <Button type="button" bg="bg-gray-400" className="text-sm" onClick={() => { setEditingTier(null); setTierForm({ name: "", amount: "", daily_limit: "", sort_order: 0 }); }}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </div>

          {/* Code Generator */}
          {can("generate voucher codes") && (
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <h2 className="font-semibold text-gray-700">Generate QR Codes</h2>
              <div className="flex gap-2 items-end">
                <TextInput
                  label="Quantity"
                  type="number"
                  value={generateQty}
                  onChange={(e) => setGenerateQty(Number(e.target.value))}
                  placeholder="100"
                />
                <Button type="button" onClick={generateCodes} disabled={isGenerating} className="mb-0.5">
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              </div>

              {/* Recent codes preview */}
              {codes?.data?.length > 0 && (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  <p className="text-xs text-gray-400">Recent codes:</p>
                  {codes.data.map(c => (
                    <div key={c.id} className="flex justify-between text-sm border rounded px-2 py-1">
                      <code className="font-mono">{c.code}</code>
                      <span className={`text-xs ${c.is_used ? "text-green-600" : "text-gray-400"}`}>
                        {c.is_used ? "Used" : "Unused"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value ?? "—"}</p>
    </div>
  );
}

export default DetailPage;
