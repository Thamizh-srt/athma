<?php

namespace App\Mail;

use App\Models\Patient;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PatientWelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Patient $patient
    ) {}

    public function build()
    {
        return $this->subject('Welcome to ' . config('app.name'))
            ->markdown('emails.patient-welcome', [
                'name' => $this->patient->full_name,
                'hospital' => config('app.name'),
                'loginUrl' => url(env('FRONTEND_URL').'/login'),
            ]);
    }
}