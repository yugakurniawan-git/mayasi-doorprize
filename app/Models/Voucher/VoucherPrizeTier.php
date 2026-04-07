<?php

namespace App\Models\Voucher;

use App\Models\BaseModel;
use App\Models\CustomSoftDeletes;
use Illuminate\Database\Eloquent\Model;

class VoucherPrizeTier extends Model
{
  use BaseModel, CustomSoftDeletes;

  protected $table     = 'voucher_prize_tiers';
  public $incrementing = false;
  protected $keyType   = 'string';

  protected $fillable = [
    'voucher_campaign_id',
    'name',
    'amount',
    'daily_limit',
    'is_active',
    'sort_order',
    'created_by',
    'updated_by',
    'deleted_by',
  ];

  protected $casts = [
    'amount'      => 'integer',
    'daily_limit' => 'integer',
    'is_active'   => 'boolean',
    'sort_order'  => 'integer',
  ];

  public $appends = ['today_remaining', 'is_prize'];

  public function campaign()
  {
    return $this->belongsTo(VoucherCampaign::class, 'voucher_campaign_id', 'id');
  }

  public function dailyQuotas()
  {
    return $this->hasMany(VoucherDailyQuota::class, 'voucher_prize_tier_id', 'id');
  }

  public function getTodayRemainingAttribute(): int
  {
    if ($this->daily_limit === 0) return 0; // belum beruntung = selalu 0 remaining
    $used = VoucherDailyQuota::where('voucher_prize_tier_id', $this->id)
      ->where('date', now()->timezone('Asia/Jakarta')->toDateString())
      ->value('count') ?? 0;
    return max(0, $this->daily_limit - $used);
  }

  public function getIsPrizeAttribute(): bool
  {
    return $this->amount > 0;
  }
}
