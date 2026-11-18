After created project the steps follows:

# Step 1:
   I've installed Sanctum and routes/api.php using (php artisan install:api).
   # why :
    1. In frontend is built based on bearer token system.
    2. By using auth/sanctum and it's middleware it reads the bearer token from the header.

# Step 2:
    1. Edited the users table migration according to the requirement because it already created while installing api.
    2. Created Patient table and it's model.

# Step 3: 
    1. Ran the admin seeder for admin user.

# Step 4:
    1. Created separate middleware for admin and patient.
    2. Registered both middleware in app.php
   # why:
    Sanctum tokens work for any model, so a patient token must not open admin routes.
    
# Step 5:
    1. Created register and login form request for backend validation same as used in frontend.

# Step 6: 
    1. Created Adminauth and Patientauth controller, for handling auth related functions.
    2. Then added admin and patient routes in api.php with prefix value.
    3. Then changed the allowed origin value in cors.php.

## Patient assessments

Assessment categories, versioned subcategories, questions, scored answer options,
score dimensions/bands, patient attempts, and answer snapshots are stored in the
assessment tables created by the assessment migration. Published subcategory
versions should be treated as immutable; create a new version instead of changing
questions or scoring for an assessment that patients have started.

Patient-only endpoints are protected by Sanctum and the `patient` middleware:

- `GET /api/assessments` lists published categories and a patient's progress.
- `GET /api/assessments/subcategories/{id}` returns published instructions,
  questions, and answer labels (not scores).
- `POST /api/assessments/subcategories/{id}/attempts` creates or resumes an attempt.
- `PUT /api/assessments/attempts/{id}/responses` saves answer option IDs.
- `POST /api/assessments/attempts/{id}/submit` validates required answers and
  calculates server-side scores and configured score bands.
- `GET /api/assessments/attempts/{id}` returns the patient's progress or result.

The client never submits scores. Each selected option's configured score is
snapshotted with the answer; score dimensions aggregate mapped questions by sum
or mean, then apply configured score bands. A total score is returned only when
the subcategory configures a total dimension; assessments with separate traits,
such as BFI-10, do not report an unconfigured composite score.

`AssessmentCatalogSeeder` seeds the verified BEIS-10 and BFI-10 catalogs and is
included in `DatabaseSeeder`. Run `php artisan db:seed --class=AssessmentCatalogSeeder`
to seed or refresh only those catalogs. Add further instruments only after their
question text and scoring mappings have been verified against their references.
    