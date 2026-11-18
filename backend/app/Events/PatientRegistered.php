<?php

namespace App\Events;

use App\Models\Patient;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** Fired once a patient account has been created. Add more listeners (SMS, admin alert...) without touching the controller. */
class PatientRegistered
{
    use Dispatchable, SerializesModels;

    public function __construct(public Patient $patient)
    {
    }
}
