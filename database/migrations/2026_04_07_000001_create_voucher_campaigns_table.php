<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
  public function up(): void
  {
    Schema::create('voucher_campaigns', function (Blueprint $table) {
      $table->uuid('id')->primary();
      $table->string('name');
      $table->string('slug')->unique();
      $table->text('description')->nullable();
      $table->date('start_date')->nullable();
      $table->date('end_date')->nullable();
      $table->boolean('is_active')->default(true);
      $table->timestamps();
      $table->softDeletes();
      $table->uuid('created_by')->nullable();
      $table->uuid('updated_by')->nullable();
      $table->uuid('deleted_by')->nullable();
      $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
      $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
      $table->foreign('deleted_by')->references('id')->on('users')->onDelete('set null');
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('voucher_campaigns');
  }
};
