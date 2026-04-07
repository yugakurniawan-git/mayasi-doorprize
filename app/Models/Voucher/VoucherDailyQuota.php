<?php

namespace App\Models\Voucher;

use Illuminate\Database\Eloquent\Model;

class VoucherDailyQuota extends Model
{
  protected $table = 'voucher_daily_quotas';

  protected $fillable = [
    'voucher_prize_tier_id',
    'date',
    'count',
  ];

  protected $casts = [
    'date'  => 'date',
    'count' => 'integer',
  ];

  public function prizeTier()
  {
    return $this->belongsTo(VoucherPrizeTier::class, 'voucher_prize_tier_id', 'id');
  }

  public static function incrementToday(string $prizeTierId): void
  {
    $today = now()->timezone('Asia/Jakarta')->toDateString();
    static::updateOrCreate(
      ['voucher_prize_tier_id' => $prizeTierId, 'date' => $today],
      ['count' => 0]
    );
    static::where('voucher_prize_tier_id', $prizeTierId)
      ->where('date', $today)
      ->increment('count');
  }
}
