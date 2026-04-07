<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DoorprizeController;
use App\Http\Controllers\DoorprizeImageController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WinnerController;
use App\Http\Controllers\Voucher\VoucherCampaignController;
use App\Http\Controllers\Voucher\VoucherCodeController;
use App\Http\Controllers\Voucher\VoucherRedemptionController;
use App\Http\Controllers\Voucher\PublicVoucherController;
use Illuminate\Support\Facades\Route;

Route::middleware('api_key')->group(function () {
  Route::post('/login', [AuthController::class, 'login'])->name('login');
  Route::middleware('auth')->group(function () {
    // Account
    Route::get('/profile', [AuthController::class, 'profile'])->name('profile');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::post('/profile', [AuthController::class, 'updateProfile'])->name('profile.update');
    Route::put('/password', [AuthController::class, 'changePassword'])->name('password.update');

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index'])->middleware('can:view list activity logs');
    Route::get('/activity-logs/{activityLog}', [ActivityLogController::class, 'show'])->middleware('can:view activity log');

    // Users
    Route::get('/users', [UserController::class, 'index'])->middleware('can:view list users');
    Route::post('/users', [UserController::class, 'store'])->middleware('can:create user');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('can:view user');
    Route::delete ('/users/{user}', [UserController::class, 'destroy'])->middleware('can:delete user');

    // Roles
    Route::get('/roles', [RoleController::class, 'index'])->middleware('can:view list roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('can:create role');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('can:view role');
    Route::delete ('/roles/{role}', [RoleController::class, 'destroy'])->middleware('can:delete role');

    // Permissions
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('can:view list permissions');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('can:create permission');
    Route::get('/permissions/{permission}', [PermissionController::class, 'show'])->middleware('can:view permission');
    Route::delete ('/permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('can:delete permission');

    // Doorprizes
    Route::get('/doorprizes', [DoorprizeController::class, 'index'])->middleware('can:view list doorprizes');
    Route::post('/doorprizes', [DoorprizeController::class, 'store'])->middleware('can:create doorprize');
    Route::get('/doorprizes/{doorprize}', [DoorprizeController::class, 'show'])->middleware('can:view doorprize');
    Route::delete ('/doorprizes/{doorprize}', [DoorprizeController::class, 'destroy'])->middleware('can:delete doorprize');

    // Doorprize Images
    Route::get('/doorprize-images', [DoorprizeImageController::class, 'index'])->middleware('can:view list doorprize images');
    Route::post('/doorprize-images', [DoorprizeImageController::class, 'store'])->middleware('can:create doorprize image');
    Route::get('/doorprize-images/{doorprizeImage}', [DoorprizeImageController::class, 'show'])->middleware('can:view doorprize image');
    Route::delete ('/doorprize-images/{doorprizeImage}', [DoorprizeImageController::class, 'destroy'])->middleware('can:delete doorprize image');

    // Winners
    Route::get('/winners', [WinnerController::class, 'index'])->middleware('can:view list winners');
    Route::post('/winners', [WinnerController::class, 'store'])->withoutMiddleware('auth');
    Route::put('/winners', [WinnerController::class, 'bulkUpdate'])->middleware('can:edit winner');
    Route::put('/winners/{winner}', [WinnerController::class, 'update'])->middleware('can:edit winner');
    Route::get('/winners/{winner}', [WinnerController::class, 'show'])->withoutMiddleware('auth');
    Route::delete ('/winners/{winner}', [WinnerController::class, 'destroy'])->middleware('can:delete winner');

    // Voucher Campaigns
    Route::get('/voucher-campaigns', [VoucherCampaignController::class, 'index'])->middleware('can:view list voucher campaigns');
    Route::post('/voucher-campaigns', [VoucherCampaignController::class, 'store'])->middleware('can:create voucher campaign');
    Route::get('/voucher-campaigns/{voucherCampaign}', [VoucherCampaignController::class, 'show'])->middleware('can:view voucher campaign');
    Route::delete('/voucher-campaigns/{voucherCampaign}', [VoucherCampaignController::class, 'destroy'])->middleware('can:delete voucher campaign');
    Route::get('/voucher-campaigns/{voucherCampaign}/stats', [VoucherCampaignController::class, 'stats'])->middleware('can:view voucher campaign');
    Route::post('/voucher-campaigns/{voucherCampaign}/prize-tiers', [VoucherCampaignController::class, 'storePrizeTier'])->middleware('can:manage voucher prize tiers');
    Route::delete('/voucher-campaigns/{voucherCampaign}/prize-tiers/{prizeTier}', [VoucherCampaignController::class, 'destroyPrizeTier'])->middleware('can:manage voucher prize tiers');

    // Voucher Codes
    Route::get('/voucher-campaigns/{voucherCampaign}/codes', [VoucherCodeController::class, 'index'])->middleware('can:view list voucher campaigns');
    Route::post('/voucher-campaigns/{voucherCampaign}/codes/generate', [VoucherCodeController::class, 'generate'])->middleware('can:generate voucher codes');
    Route::delete('/voucher-campaigns/{voucherCampaign}/codes/{voucherCode}', [VoucherCodeController::class, 'destroy'])->middleware('can:generate voucher codes');

    // Voucher Redemptions
    Route::get('/voucher-redemptions', [VoucherRedemptionController::class, 'index'])->middleware('can:view list voucher redemptions');
    Route::get('/voucher-redemptions/{voucherRedemption}', [VoucherRedemptionController::class, 'show'])->middleware('can:view list voucher redemptions');
    Route::put('/voucher-redemptions', [VoucherRedemptionController::class, 'bulkUpdate'])->middleware('can:edit voucher redemption');
    Route::put('/voucher-redemptions/{voucherRedemption}', [VoucherRedemptionController::class, 'update'])->middleware('can:edit voucher redemption');
    Route::delete('/voucher-redemptions/{voucherRedemption}', [VoucherRedemptionController::class, 'destroy'])->middleware('can:delete voucher redemption');
  });

  // Public Voucher (no auth required)
  Route::get('/public/voucher/{slug}', [PublicVoucherController::class, 'campaign']);
  Route::post('/public/voucher/check-code', [PublicVoucherController::class, 'checkCode']);
  Route::post('/public/voucher/redeem', [PublicVoucherController::class, 'redeem']);
});
