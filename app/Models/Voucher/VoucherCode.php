<?php

namespace App\Models\Voucher;

use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Model;

class VoucherCode extends Model
{
  use BaseModel;

  protected $table     = 'voucher_codes';
  public $incrementing = false;
  protected $keyType   = 'string';

  protected $fillable = [
    'voucher_campaign_id',
    'code',
    'is_used',
    'used_at',
    'created_by',
  ];

  protected $casts = [
    'is_used' => 'boolean',
    'used_at' => 'datetime',
  ];

  public function campaign()
  {
    return $this->belongsTo(VoucherCampaign::class, 'voucher_campaign_id', 'id');
  }

  public function redemption()
  {
    return $this->hasOne(VoucherRedemption::class, 'voucher_code_id', 'id');
  }
}
