<?php

namespace Tests\Unit;

use App\Models\AssessmentQuestion;
use App\Support\AssessmentPresenter;
use Illuminate\Database\Eloquent\Collection;
use PHPUnit\Framework\TestCase;

class AssessmentPresenterTest extends TestCase
{
    public function test_question_scale_type_is_included_for_patient_and_admin_responses(): void
    {
        $question = new AssessmentQuestion([
            'number' => 1,
            'type' => 'choice',
            'scale_type' => 'Scale: A',
            'text' => 'Example question',
        ]);
        $question->setRelation('options', new Collection());

        foreach ([false, true] as $admin) {
            $this->assertSame(
                'Scale: A',
                AssessmentPresenter::question($question, admin: $admin)['scale_type']
            );
        }
    }
}
