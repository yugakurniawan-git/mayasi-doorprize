<?php

namespace App\Http\Controllers\Voucher;

use App\Http\Controllers\Controller;
use App\Models\Voucher\VoucherRedemption;
use Illuminate\Http\Request;

class VoucherRedemptionController extends Controller
{
  public function index()
  {
    return VoucherRedemption::with(['campaign', 'prizeTier', 'voucherCode'])->list();
  }

  public function show(VoucherRedemption $voucherRedemption)
  {
    return $voucherRedemption->load(['campaign', 'prizeTier', 'voucherCode']);
  }

  public function update(Request $request, VoucherRedemption $voucherRedemption)
  {
    $data = $request->validate([
      'status' => 'required|integer|in:0,1,2,3',
      'notes'  => 'sometimes|nullable|string',
    ]);

    $voucherRedemption->update($data);

    return $voucherRedemption->fresh(['campaign', 'prizeTier']);
  }

  public function bulkUpdate(Request $request)
  {
    $data = $request->validate([
      'ids'    => 'required|array',
      'ids.*'  => 'string|exists:voucher_redemptions,id',
      'status' => 'required|integer|in:0,1,2,3',
    ]);

    VoucherRedemption::whereIn('id', $data['ids'])->update(['status' => $data['status']]);

    return ['message' => 'Redemptions updated successfully.'];
  }

  public function destroy(VoucherRedemption $voucherRedemption)
  {
    $voucherRedemption->delete();
    return ['message' => 'Redemption deleted successfully.'];
  }
}
