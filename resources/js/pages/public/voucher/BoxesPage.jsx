import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { apiService } from "../../../services/api.services";
import Swal from "sweetalert2";

const GIFT_EMOJI = ["🎁", "🎀", "🎊", "🎉", "✨"];

function BoxesPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;

  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // Guard: if no state, redirect back
  if (!state?.boxes) {
    navigate(`/v/${slug}`, { replace: true });
    return null;
  }

  const { boxes, code_id, campaign_id, name, phone } = state;

  async function pickBox(boxNumber) {
    if (revealed || isSubmitting) return;
    setSelected(boxNumber);
    setIsSubmitting(true);

    const res = await apiService("POST", "/api/public/voucher/redeem", {
      data: {
        code_id,
        campaign_id,
        name,
        phone,
        selected_box: boxNumber,
        boxes,
      }
    });

    setIsSubmitting(false);

    if (res.status === 200 && res.data?.success) {
      setResult(res.data);
      setRevealed(true);
      setTimeout(() => {
        navigate(`/v/${slug}/result`, {
          state: { ...res.data, name, phone },
          replace: true
        });
      }, 2500);
    } else {
      Swal.fire({ title: "Gagal", text: res.data?.message || "Terjadi kesalahan.", icon: "error", confirmButtonColor: "#16a34a" });
      setSelected(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-green-800 mb-2">Pilih 1 Hadiah!</h1>
        <p className="text-gray-500 text-sm mb-10">
          {revealed ? "Membuka hadiahmu..." : "Pilih salah satu kotak di bawah ini"}
        </p>

        {/* 5 Gift Boxes */}
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          {boxes.map((box, i) => {
            const isSelected = selected === box.box;
            const isOther = selected !== null && !isSelected;

            return (
              <button
                key={box.box}
                onClick={() => pickBox(box.box)}
                disabled={revealed || isSubmitting || selected !== null}
                className={`
                  relative w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center
                  transition-all duration-300 select-none
                  ${isSelected
                    ? "border-green-500 bg-green-50 scale-110 shadow-lg shadow-green-200"
                    : isOther
                      ? "border-gray-200 bg-gray-50 opacity-40 scale-95"
                      : "border-yellow-400 bg-yellow-50 hover:scale-105 hover:shadow-md cursor-pointer"
                  }
                  ${i === 1 ? "col-start-1" : ""}
                `}
              >
                <span className="text-4xl">{isSelected && isSubmitting ? "⏳" : GIFT_EMOJI[i]}</span>
                <span className="text-xs text-gray-500 mt-1">Kotak {box.box}</span>
              </button>
            );
          })}
        </div>

        {isSubmitting && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <p className="text-gray-500 text-sm">Membuka kotak...</p>
          </div>
        )}

        {!revealed && !isSubmitting && (
          <p className="mt-10 text-xs text-gray-400">Klik kotak untuk membuka hadiahmu</p>
        )}
      </div>
    </div>
  );
}

export default BoxesPage;
