<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterPatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */

    protected function prepareForValidation(): void
    {
        $this->merge(['email' => strtolower(trim((string) $this->email))]);
    }

    public function rules(): array
    {
        return [
            'full_name'      => ['required', 'string', 'min:2', 'max:100', "regex:/^[A-Za-z .'-]+$/"],
            'age'            => ['nullable', 'integer', 'between:1,120'],
            'gender'         => ['nullable', 'in:Male,Female,Other,Prefer not to say'],
            'phone'          => ['required', 'regex:/^[6-9]\d{9}$/'],
            'email'          => ['required', 'email', 'max:255', 'unique:patients,email'],
            'address'        => ['required', 'string', 'min:10', 'max:255'],
            'city'           => ['required', 'string', 'min:2', 'max:60'],
            'state'          => ['required', 'string', 'min:2', 'max:60'],
            'pincode'        => ['required', 'regex:/^\d{6}$/'],
            'location'       => ['required', 'string', 'min:2', 'max:80'],
            'marital_status' => ['nullable', 'in:Single,Married,Divorced,Widowed,Separated'],
            'education'      => ['nullable', 'string', 'max:100'],
            'occupation'     => ['nullable', 'string', 'max:100'],
            'referred_by'    => ['nullable', 'string', 'max:100'],
            'password'       => ['required', 'string', 'min:6', 'max:64', 'confirmed'],
            'consent'        => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.regex'    => 'Enter a valid 10-digit mobile number.',
            'pincode.regex'  => 'Enter a 6-digit pincode.',
            'email.unique'   => 'An account with this email already exists.',
            'consent.accepted' => 'Please confirm to continue.',
        ];
    }
}
