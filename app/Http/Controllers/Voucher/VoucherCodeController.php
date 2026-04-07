<?php

namespace App\Http\Controllers\Voucher;

use App\Http\Controllers\Controller;
use App\Models\Voucher\VoucherCampaign;
use App\Models\Voucher\VoucherCode;
use Illuminate\Http\Request;

class VoucherCodeController extends Controller
{
  public function index(Request $request, VoucherCampaign $voucherCampaign)
  {
    return VoucherCode::where('voucher_campaign_id', $voucherCampaign->id)->list();
  }

  public function generate(Request $request, VoucherCampaign $voucherCampaign)
  {
    $data = $request->validate([
      'quantity' => 'required|integer|min:1|max:1000',
    ]);

    $voucherCampaign->generateCodes($data['quantity']);

    return response()->json([
      'success' => true,
      'message' => "{$data['quantity']} codes generated successfully.",
    ]);
  }

  public function destroy(VoucherCampaign $voucherCampaign, VoucherCode $voucherCode)
  {
    if ($voucherCode->is_used) {
      return response()->json(['message' => 'Cannot delete a code that has already been used.'], 422);
    }
    $voucherCode->delete();
    return ['message' => 'Voucher code deleted successfully.'];
  }
}
