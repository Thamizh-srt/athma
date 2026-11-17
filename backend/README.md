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
    