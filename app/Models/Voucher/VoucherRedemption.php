<?php

namespace App\Models\Voucher;

use App\Models\BaseModel;
use App\Models\CustomSoftDeletes;
use Illuminate\Database\Eloquent\Model;

class VoucherRedemption extends Model
{
  use BaseModel, CustomSoftDeletes;

  protected $table     = 'voucher_redemptions';
  public $incrementing = false;
  protected $keyType   = 'string';

  protected $fillable = [
    'voucher_code_id',
    'voucher_campaign_id',
    'name',
    'phone',
    'boxes',
    'selected_box',
    'voucher_prize_tier_id',
    'status',
    'notes',
    'redeemed_at',
  ];

  protected $casts = [
    'boxes'        => 'array',
    'selected_box' => 'integer',
    'status'       => 'integer',
    'redeemed_at'  => 'datetime',
  ];

  public $appends = ['status_detail', 'prize_amount'];

  public function voucherCode()
  {
    return $this->belongsTo(VoucherCode::class, 'voucher_code_id', 'id');
  }

  public function campaign()
  {
    return $this->belongsTo(VoucherCampaign::class, 'voucher_campaign_id', 'id');
  }

  public function prizeTier()
  {
    return $this->belongsTo(VoucherPrizeTier::class, 'voucher_prize_tier_id', 'id');
  }

  public function getStatusDetailAttribute(): array
  {
    return match ($this->status) {
      0 => ['label' => 'Pending',    'class' => 'yellow'],
      1 => ['label' => 'Processing', 'class' => 'blue'],
      2 => ['label' => 'Sent',       'class' => 'green'],
      3 => ['label' => 'Cancelled',  'class' => 'red'],
      default => ['label' => 'Unknown', 'class' => 'gray'],
    };
  }

  public function getPrizeAmountAttribute(): int
  {
    return $this->prizeTier?->amount ?? 0;
  }
}
