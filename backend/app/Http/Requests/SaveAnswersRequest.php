<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveAnswersRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // PUT (save draft) needs answers; POST (submit) may send none if everything was saved already
            'answers' => [$this->isMethod('PUT') ? 'required' : 'sometimes', 'array', 'max:200'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.option_id' => ['required', 'integer'],
            'language' => ['sometimes', 'in:en,ta'],
        ];
    }
}
