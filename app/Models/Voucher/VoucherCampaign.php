<?php

namespace App\Models\Voucher;

use App\Models\BaseModel;
use App\Models\CustomSoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class VoucherCampaign extends Model
{
  use BaseModel, CustomSoftDeletes;

  protected $table     = 'voucher_campaigns';
  public $incrementing = false;
  protected $keyType   = 'string';

  protected $fillable = [
    'name',
    'slug',
    'description',
    'start_date',
    'end_date',
    'is_active',
    'created_by',
    'updated_by',
    'deleted_by',
  ];

  protected $casts = [
    'is_active'  => 'boolean',
    'start_date' => 'date',
    'end_date'   => 'date',
  ];

  public function prizeTiers()
  {
    return $this->hasMany(VoucherPrizeTier::class, 'voucher_campaign_id', 'id')
      ->orderBy('sort_order')
      ->orderBy('amount', 'desc');
  }

  public function codes()
  {
    return $this->hasMany(VoucherCode::class, 'voucher_campaign_id', 'id');
  }

  public function redemptions()
  {
    return $this->hasMany(VoucherRedemption::class, 'voucher_campaign_id', 'id');
  }

  public function generateCodes(int $quantity): void
  {
    for ($i = 0; $i < $quantity; $i++) {
      do {
        $code = strtoupper(
          substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 4) . '-' .
          substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 4) . '-' .
          substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 4)
        );
      } while (VoucherCode::where('code', $code)->exists());

      $this->codes()->create([
        'code'       => $code,
        'created_by' => auth()->id(),
      ]);
    }
  }
}
