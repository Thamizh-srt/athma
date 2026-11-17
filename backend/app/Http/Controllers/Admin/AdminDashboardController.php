<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Patient;

class AdminDashboardController extends Controller
{
    //
    public function overview(){
        $totalpatients = Patient::count();
        $thisMonthPatients = Patient::whereMonth('created_at', now()->month)
        ->whereYear('created_at', now()->year)
        ->count();

        $stats = [ 'assessments_week' => 351, 'assessments_change'=> 12, 'patients'=> $totalpatients, 'patients_month'=> $thisMonthPatients, 'high_risk'=> 14, 'high_risk_waiting'=> 5 ];
        $by_day = [
            ["day" => "Mon", "count"=> 42 ], [ "day"=> "Tue", "count"=> 58 ], [ "day" => "Wed", "count" => 51 ], [ "day"=> "Thu", "count"=> 73 ],
            [ "day" => "Fri", "count"=> 66 ], [ "day"=> "Sat", "count"=> 34 ], [ "day" => "Sun", "count" => 27 ],
        ];
        $risk = [ 'low' => 542, 'moderate' => 344, 'high' => 156 ];
        return response()->json([
            'stats' => $stats,
            'by_day' => $by_day,
            'risk' => $risk
        ]);
    }

    public function patient(){
        $patient = Patient::select('full_name','phone','location','created_at')->paginate(env('PAGINATION_LIMIT', 20));

        return response()->json([
            'patients' => $patient
        ]);
    }
}
