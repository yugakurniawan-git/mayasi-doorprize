<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('voucher_prize_tiers', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->uuid('voucher_campaign_id');
      $table->string('name');
      $table->unsignedInteger('amount')->default(0); // 0 = belum beruntung
      $table->unsignedInteger('daily_limit')->default(0); // 0 = unlimited (untuk belum beruntung)
      $table->boolean('is_active')->default(true);
      $table->unsignedTinyInteger('sort_order')->default(0);
      $table->timestamps();
      $table->softDeletes();
      $table->uuid('created_by')->nullable();
      $table->uuid('updated_by')->nullable();
      $table->uuid('deleted_by')->nullable();
      $table->foreign('voucher_campaign_id')->references('id')->on('voucher_campaigns')->onDelete('cascade');
      $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
      $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
      $table->foreign('deleted_by')->references('id')->on('users')->onDelete('set null');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('voucher_prize_tiers');
  }
};
