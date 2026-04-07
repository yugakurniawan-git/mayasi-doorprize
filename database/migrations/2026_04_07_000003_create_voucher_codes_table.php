<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('voucher_codes', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->uuid('voucher_campaign_id');
      $table->string('code')->unique();
      $table->boolean('is_used')->default(false);
      $table->timestamp('used_at')->nullable();
      $table->timestamps();
      $table->uuid('created_by')->nullable();
      $table->foreign('voucher_campaign_id')->references('id')->on('voucher_campaigns')->onDelete('cascade');
      $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('voucher_codes');
  }
};
