<?php

namespace App\Listeners;

use App\Events\PatientRegistered;
use App\Mail\PatientWelcomeMail;
use Illuminate\Support\Facades\Mail;

class SendPatientWelcomeEmail
{
    public function handle(PatientRegistered $event): void
    {
        $patient = $event->patient;

        Mail::to($patient->email)
            ->send(new PatientWelcomeMail($patient));
    }
}