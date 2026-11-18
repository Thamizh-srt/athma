<x-mail::message>
# Welcome, {{ $name }}

Thank you for registering with {{ $hospital }}. Your account has been created successfully.

Please sign in to complete the assessments assigned to you. Take your time and answer honestly; there are no right or wrong answers.

<x-mail::button :url="$loginUrl">
Sign in
</x-mail::button>

If you did not create this account, please contact the hospital.

Regards,<br>
{{ $hospital }}
</x-mail::message>
