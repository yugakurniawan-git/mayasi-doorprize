<?php

namespace App\Http\Controllers\Voucher;

use App\Http\Controllers\Controller;
use App\Models\Voucher\VoucherCampaign;
use App\Models\Voucher\VoucherPrizeTier;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VoucherCampaignController extends Controller
{
  public function index()
  {
    return VoucherCampaign::list();
  }

  public function store(Request $request)
  {
    $data = $request->validate([
      'id'          => 'nullable|string',
      'name'        => 'required|string|max:100',
      'description' => 'sometimes|nullable|string',
      'start_date'  => 'sometimes|nullable|date',
      'end_date'    => 'sometimes|nullable|date|after_or_equal:start_date',
      'is_active'   => 'sometimes|boolean',
    ]);

    if (empty($data['id'])) {
      $data['slug'] = Str::slug($data['name']) . '-' . Str::random(6);
    }

    $campaign = VoucherCampaign::updateOrCreate(['id' => $request->id], $data);

    return $campaign->load('prizeTiers');
  }

  public function show(Request $request, VoucherCampaign $voucherCampaign)
  {
    if ($request->has('include') && is_array($request->query('include'))) {
      $voucherCampaign->load($request->query('include'));
    }
    return $voucherCampaign->load('prizeTiers');
  }

  public function destroy(VoucherCampaign $voucherCampaign)
  {
    $voucherCampaign->prizeTiers()->delete();
    $voucherCampaign->codes()->delete();
    $voucherCampaign->redemptions()->delete();
    $voucherCampaign->delete();
    return ['message' => 'Voucher campaign deleted successfully.'];
  }

  // --- Prize Tier Management ---

  public function storePrizeTier(Request $request, VoucherCampaign $voucherCampaign)
  {
    $data = $request->validate([
      'id'          => 'nullable|string',
      'name'        => 'required|string|max:100',
      'amount'      => 'required|integer|min:0',
      'daily_limit' => 'required|integer|min:0',
      'is_active'   => 'sometimes|boolean',
      'sort_order'  => 'sometimes|integer|min:0',
    ]);

    $data['voucher_campaign_id'] = $voucherCampaign->id;

    $tier = VoucherPrizeTier::updateOrCreate(['id' => $request->id], $data);

    return $tier;
  }

  public function destroyPrizeTier(VoucherCampaign $voucherCampaign, VoucherPrizeTier $prizeTier)
  {
    $prizeTier->delete();
    return ['message' => 'Prize tier deleted successfully.'];
  }

  public function stats(VoucherCampaign $voucherCampaign)
  {
    $today = now()->timezone('Asia/Jakarta')->toDateString();
    $tiers = $voucherCampaign->prizeTiers()->with(['dailyQuotas' => function ($q) use ($today) {
      $q->where('date', $today);
    }])->get();

    return [
      'total_codes'       => $voucherCampaign->codes()->count(),
      'used_codes'        => $voucherCampaign->codes()->where('is_used', true)->count(),
      'total_redemptions' => $voucherCampaign->redemptions()->count(),
      'prize_tiers'       => $tiers->map(fn($tier) => [
        'id'              => $tier->id,
        'name'            => $tier->name,
        'amount'          => $tier->amount,
        'daily_limit'     => $tier->daily_limit,
        'today_used'      => $tier->dailyQuotas->first()?->count ?? 0,
        'today_remaining' => $tier->today_remaining,
      ]),
    ];
  }
}
