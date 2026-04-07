import { useLocation, useParams, useNavigate } from "react-router";
import { useEffect } from "react";

function ResultPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  useEffect(() => {
    if (!state) navigate(`/v/${slug}`, { replace: true });
  }, []);

  if (!state) return null;

  const { is_winner, prize_name, prize_amount, name, phone } = state;
  const formattedAmount = prize_amount > 0
    ? `Rp ${Number(prize_amount).toLocaleString("id-ID")}`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">

        {is_winner ? (
          <>
            {/* Winner */}
            <div className="text-7xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-3xl font-bold text-green-700 mb-2">Selamat!</h1>
            <p className="text-gray-600 mb-4">Kamu mendapatkan</p>
            <div className="bg-green-600 text-white rounded-2xl p-6 shadow-lg mb-6">
              <p className="text-lg font-semibold">{prize_name}</p>
              {formattedAmount && (
                <p className="text-4xl font-bold mt-2">{formattedAmount}</p>
              )}
            </div>

            <div className="bg-white rounded-xl border p-4 text-left text-sm text-gray-600 mb-6 space-y-2">
              <p><span className="font-medium">Nama:</span> {name}</p>
              <p><span className="font-medium">No HP:</span> {phone}</p>
              <p className="text-xs text-gray-400">Voucher e-money akan dikirim ke nomor HP di atas dalam 1x24 jam kerja.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
              <p className="font-semibold mb-1">Penting!</p>
              <p>Pastikan nomor HP kamu aktif dan terhubung dengan akun e-money (GoPay/OVO/Dana/dll).</p>
            </div>
          </>
        ) : (
          <>
            {/* Loser */}
            <div className="text-7xl mb-6">😔</div>
            <h1 className="text-2xl font-bold text-gray-700 mb-2">Belum Beruntung</h1>
            <p className="text-gray-500 mb-6">
              Sayang sekali, kali ini kamu belum beruntung.<br />
              Coba lagi dengan produk lain!
            </p>
            <div className="bg-gray-50 rounded-xl border p-4 text-sm text-gray-500">
              <p>Terima kasih, <strong>{name}</strong>! Tetap semangat dan coba lagi. 😊</p>
            </div>
          </>
        )}

        <button
          onClick={() => navigate(`/v/${slug}`)}
          className="mt-8 text-sm text-green-600 hover:underline"
        >
          ← Kembali ke halaman utama
        </button>
      </div>
    </div>
  );
}

export default ResultPage;
