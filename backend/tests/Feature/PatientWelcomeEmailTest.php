<?php

namespace Tests\Feature;

use App\Events\PatientRegistered;
use App\Listeners\SendPatientWelcomeEmail;
use App\Mail\PatientWelcomeMail;
use App\Models\Patient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PatientWelcomeEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_dispatches_event(): void
    {
        Event::fake([PatientRegistered::class]);

        $this->postJson('/api/auth/register', [
            'full_name' => 'Test Patient', 'phone' => '9876543210', 'email' => 'test@example.com',
            'address' => '12 Main Street, Chennai', 'city' => 'Chennai', 'state' => 'Tamil Nadu',
            'pincode' => '600116', 'location' => 'Chennai',
            'password' => 'secret12', 'password_confirmation' => 'secret12', 'consent' => true,
        ])->assertCreated();

        Event::assertDispatched(PatientRegistered::class, fn ($e) => $e->patient->email === 'test@example.com');
    }

    public function test_listener_is_queued_and_sends_the_welcome_mail(): void
    {
        $this->assertInstanceOf(ShouldQueue::class, new SendPatientWelcomeEmail());

        Mail::fake();
        $patient = Patient::create([
            'full_name' => 'Test Patient', 'phone' => '9876543210', 'email' => 'test@example.com',
            'address' => '12 Main Street, Chennai', 'city' => 'Chennai', 'state' => 'Tamil Nadu',
            'pincode' => '600116', 'location' => 'Chennai', 'password' => 'secret12',
        ]);

        (new SendPatientWelcomeEmail())->handle(new PatientRegistered($patient));

        Mail::assertSent(PatientWelcomeMail::class, fn ($m) => $m->hasTo('test@example.com'));
    }
}
