<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
  /**
   * Run the database seeds.
   */
  public function run(): void
  {
    $this->roleSuperAdmin();
    $this->roleAdmin();
  }

  private function roleSuperAdmin()
  {
    createRoleWithPermissions('Super Admin', [
      // users
      'view list users',
      'create user',
      'view user',
      'edit user',
      'delete user',

      // roles
      'view list roles',
      'create role',
      'view role',
      'edit role',
      'delete role',

      // permissions
      'view list permissions',
      'create permission',
      'view permission',
      'edit permission',
      'delete permission',

      // activity logs
      'view list activity logs',
      'view activity log',

      // doorprizes
      'view list doorprizes',
      'create doorprize',
      'view doorprize',
      'edit doorprize',
      'delete doorprize',

      // doorprize images
      'view list doorprize images',
      'create doorprize image',
      'view doorprize image',
      'edit doorprize image',
      'delete doorprize image',

      // winners
      "view list winners",
      "export winners",
      'create winner',
      'view winner',
      'edit winner',
      'delete winner',

      // voucher campaigns
      'view list voucher campaigns',
      'create voucher campaign',
      'view voucher campaign',
      'edit voucher campaign',
      'delete voucher campaign',
      'manage voucher prize tiers',
      'generate voucher codes',

      // voucher redemptions
      'view list voucher redemptions',
      'edit voucher redemption',
      'delete voucher redemption',
    ]);
  }

  private function roleAdmin()
  {
    createRoleWithPermissions('Admin', [
      // users
      'view list users',
      'create user',
      'view user',
      'edit user',
      'delete user',

      // doorprizes
      'view list doorprizes',
      'create doorprize',
      'view doorprize',
      'edit doorprize',
      'delete doorprize',

      // doorprize images
      'view list doorprize images',
      'create doorprize image',
      'view doorprize image',
      'edit doorprize image',
      'delete doorprize image',

      // winners
      "view list winners",
      "export winners",
      'create winner',
      'view winner',
      'edit winner',
      'delete winner',

      // voucher campaigns
      'view list voucher campaigns',
      'create voucher campaign',
      'view voucher campaign',
      'edit voucher campaign',
      'delete voucher campaign',
      'manage voucher prize tiers',
      'generate voucher codes',

      // voucher redemptions
      'view list voucher redemptions',
      'edit voucher redemption',
      'delete voucher redemption',
    ]);
  }
}
