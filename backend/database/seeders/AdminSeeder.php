<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrNew(['email' => env('ADMIN_EMAIL', 'admin@gmail.com')]);

        $admin->forceFill([
            'name'     => env('ADMIN_NAME', 'Athma Admin'),
            'password' => Hash::make(env('ADMIN_PASSWORD', 'admin@123')),
            'is_admin' => true,
        ])->save();
    }
}