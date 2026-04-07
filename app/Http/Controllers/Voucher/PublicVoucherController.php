<?php

namespace App\Http\Controllers\Voucher;

use App\Http\Controllers\Controller;
use App\Models\Voucher\VoucherCampaign;
use App\Models\Voucher\VoucherCode;
use App\Models\Voucher\VoucherDailyQuota;
use App\Models\Voucher\VoucherRedemption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PublicVoucherController extends Controller
{
  /**
   * Check code validity and generate 5 mystery boxes.
   */
  public function checkCode(Request $request)
  {
    $data = $request->validate([
      'code' => 'required|string',
      'slug' => 'required|string|exists:voucher_campaigns,slug',
    ]);

    $campaign = VoucherCampaign::where('slug', $data['slug'])->firstOrFail();

    if (!$campaign->is_active) {
      return response()->json(['success' => false, 'message' => 'Program ini sudah tidak aktif.'], 422);
    }

    $today = now()->timezone('Asia/Jakarta')->toDateString();
    if ($campaign->start_date && $today < $campaign->start_date->toDateString()) {
      return response()->json(['success' => false, 'message' => 'Program belum dimulai.'], 422);
    }
    if ($campaign->end_date && $today > $campaign->end_date->toDateString()) {
      return response()->json(['success' => false, 'message' => 'Program sudah berakhir.'], 422);
    }

    $code = VoucherCode::where('code', strtoupper(trim($data['code'])))
      ->where('voucher_campaign_id', $campaign->id)
      ->first();

    if (!$code) {
      return response()->json(['success' => false, 'message' => 'Kode tidak ditemukan.'], 422);
    }

    if ($code->is_used) {
      return response()->json(['success' => false, 'message' => 'Kode ini sudah pernah digunakan.'], 422);
    }

    // Generate 5 mystery boxes
    $boxes = $this->generateBoxes($campaign);

    return response()->json([
      'success'     => true,
      'campaign_id' => $campaign->id,
      'code_id'     => $code->id,
      'boxes'       => $boxes, // array of 5, prize_tier_id hidden from frontend until picked
    ]);
  }

  /**
   * Submit the selected box and save winner data.
   */
  public function redeem(Request $request)
  {
    $data = $request->validate([
      'code_id'      => 'required|string|exists:voucher_codes,id',
      'campaign_id'  => 'required|string|exists:voucher_campaigns,id',
      'name'         => 'required|string|max:100',
      'phone'        => 'required|string|max:20',
      'selected_box' => 'required|integer|min:1|max:5',
      'boxes'        => 'required|array|size:5',
      'boxes.*.box'           => 'required|integer',
      'boxes.*.prize_tier_id' => 'nullable|string',
    ]);

    $code = VoucherCode::find($data['code_id']);

    if ($code->is_used) {
      return response()->json(['success' => false, 'message' => 'Kode ini sudah pernah digunakan.'], 422);
    }

    return DB::transaction(function () use ($data, $code) {
      // Find the selected box
      $selectedBox = collect($data['boxes'])->firstWhere('box', $data['selected_box']);
      $prizeTierId = $selectedBox['prize_tier_id'] ?? null;

      // Verify daily limit is still valid for the selected prize
      if ($prizeTierId) {
        $remaining = \App\Models\Voucher\VoucherPrizeTier::find($prizeTierId)?->today_remaining ?? 0;
        if ($remaining <= 0) {
          // Limit reached after box was shown — downgrade to no prize
          $prizeTierId = null;
        } else {
          VoucherDailyQuota::incrementToday($prizeTierId);
        }
      }

      // Mark code as used
      $code->update([
        'is_used' => true,
        'used_at' => now(),
      ]);

      // Save redemption
      $redemption = VoucherRedemption::create([
        'voucher_code_id'      => $code->id,
        'voucher_campaign_id'  => $data['campaign_id'],
        'name'                 => $data['name'],
        'phone'                => $data['phone'],
        'boxes'                => $data['boxes'],
        'selected_box'         => $data['selected_box'],
        'voucher_prize_tier_id' => $prizeTierId,
        'status'               => 0,
        'redeemed_at'          => now(),
      ]);

      $prize = $prizeTierId
        ? \App\Models\Voucher\VoucherPrizeTier::find($prizeTierId)
        : null;

      return response()->json([
        'success'    => true,
        'is_winner'  => $prizeTierId !== null,
        'prize_name' => $prize?->name ?? 'Belum Beruntung',
        'prize_amount' => $prize?->amount ?? 0,
        'redemption_id' => $redemption->id,
      ]);
    });
  }

  /**
   * Get campaign info by slug (for landing page).
   */
  public function campaign(string $slug)
  {
    $campaign = VoucherCampaign::where('slug', $slug)
      ->where('is_active', true)
      ->with(['prizeTiers' => function ($q) {
        $q->where('is_active', true)
          ->where('amount', '>', 0)
          ->orderBy('amount', 'desc');
      }])
      ->firstOrFail();

    return response()->json([
      'success'     => true,
      'id'          => $campaign->id,
      'name'        => $campaign->name,
      'description' => $campaign->description,
      'start_date'  => $campaign->start_date,
      'end_date'    => $campaign->end_date,
      'prize_tiers' => $campaign->prizeTiers->map(fn($t) => [
        'name'   => $t->name,
        'amount' => $t->amount,
      ])->values(),
    ]);
  }

  /**
   * Generate 5 mystery boxes with prizes based on daily limits.
   * Minimal 1 box = "belum beruntung".
   */
  private function generateBoxes(VoucherCampaign $campaign): array
  {
    $today = now()->timezone('Asia/Jakarta')->toDateString();

    // Get active prize tiers that still have quota today
    $availableTiers = $campaign->prizeTiers()
      ->where('is_active', true)
      ->where('amount', '>', 0) // only real prizes
      ->get()
      ->filter(fn($tier) => $tier->today_remaining > 0)
      ->values();

    // Build a pool of 5 prizes
    // Min 1 "belum beruntung", max 4 real prizes
    $maxPrizes = min(4, $availableTiers->count());
    $prizeCount = $maxPrizes > 0 ? rand(1, $maxPrizes) : 0;

    // Randomly pick prizes (no duplicates from same tier unless enough quota)
    $selectedPrizes = $availableTiers->shuffle()->take($prizeCount)->pluck('id')->toArray();

    // Fill remaining slots with null (belum beruntung)
    $pool = array_merge($selectedPrizes, array_fill(0, 5 - count($selectedPrizes), null));

    // Shuffle and assign to boxes 1-5
    shuffle($pool);

    return array_map(fn($i, $prize) => [
      'box'           => $i + 1,
      'prize_tier_id' => $prize,
    ], array_keys($pool), $pool);
  }
}
