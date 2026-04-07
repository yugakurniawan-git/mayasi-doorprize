<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('voucher_daily_quotas', function (Blueprint $table) {
      $table->id();
      $table->uuid('voucher_prize_tier_id');
      $table->date('date');
      $table->unsignedInteger('count')->default(0);
      $table->timestamps();
      $table->unique(['voucher_prize_tier_id', 'date']);
      $table->foreign('voucher_prize_tier_id')->references('id')->on('voucher_prize_tiers')->onDelete('cascade');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('voucher_daily_quotas');
  }
};
