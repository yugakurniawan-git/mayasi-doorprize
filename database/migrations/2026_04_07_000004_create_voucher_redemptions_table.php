<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('voucher_redemptions', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->uuid('voucher_code_id');
      $table->uuid('voucher_campaign_id');
      $table->string('name');
      $table->string('phone');
      $table->json('boxes'); // [{box: 1, prize_tier_id: "uuid"|null}, ...]
      $table->unsignedTinyInteger('selected_box'); // 1-5
      $table->uuid('voucher_prize_tier_id')->nullable(); // null = belum beruntung
      $table->unsignedTinyInteger('status')->default(0);
      // 0: pending, 1: processing, 2: sent, 3: cancelled
      $table->text('notes')->nullable();
      $table->timestamp('redeemed_at');
      $table->timestamps();
      $table->softDeletes();
      $table->foreign('voucher_code_id')->references('id')->on('voucher_codes')->onDelete('cascade');
      $table->foreign('voucher_campaign_id')->references('id')->on('voucher_campaigns')->onDelete('cascade');
      $table->foreign('voucher_prize_tier_id')->references('id')->on('voucher_prize_tiers')->onDelete('set null');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('voucher_redemptions');
  }
};
