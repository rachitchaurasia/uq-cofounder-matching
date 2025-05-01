import csv
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from userprofile.models import UserProfile # Import your profile model
from django.db import IntegrityError, transaction

User = get_user_model() # Get the active User model

class Command(BaseCommand):
    help = 'Imports user profiles from a specified CSV file.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The path to the CSV file to import.')

    def handle(self, *args, **options):
        file_path = options['csv_file_path']
        self.stdout.write(self.style.SUCCESS(f'Starting import from {file_path}'))

        imported_count = 0
        skipped_count = 0
        error_count = 0

        try:
            with open(file_path, mode='r', encoding='utf-8') as csvfile:
                # Use DictReader for easier access by header name
                reader = csv.DictReader(csvfile)

                # --- IMPORTANT: Verify Headers ---
                # Check if required headers are present (adapt as needed)
                required_headers = ['id', 'name', 'timestamp'] # Add other essential headers
                if not all(header in reader.fieldnames for header in required_headers):
                    missing = set(required_headers) - set(reader.fieldnames)
                    raise CommandError(f"CSV file is missing required headers: {', '.join(missing)}")
                self.stdout.write(self.style.SUCCESS('CSV headers verified.'))

                for row in reader:
                    try:
                        # --- Data Extraction and Cleaning ---
                        # Extract data, provide defaults or skip if essential data is missing
                        user_id_csv = row.get('id', '').strip()
                        full_name = row.get('name', '').strip()
                        timestamp_str = row.get('timestamp', '').strip() # Use if needed for user creation date?

                        # For User model, we need email. If not in CSV, generate or skip.
                        # Let's assume 'id' can be used to generate a unique placeholder email
                        # If you have real emails, use row.get('email_header')
                        if not user_id_csv:
                            self.stdout.write(self.style.WARNING(f"Skipping row due to missing 'id'."))
                            skipped_count += 1
                            continue

                        # Generate a placeholder email - REPLACE if you have real emails
                        email = f"user_{user_id_csv}@example.com"

                        # Extract first/last name (simple split)
                        first_name = full_name.split(' ')[0] if full_name else f"User_{user_id_csv}"
                        last_name = ' '.join(full_name.split(' ')[1:]) if ' ' in full_name else ''

                        # --- Create User and Profile within a Transaction ---
                        with transaction.atomic(): # Ensure User and Profile are created together
                            # Get or create the User
                            # Use update_or_create to handle potential reruns
                            user, created = User.objects.update_or_create(
                                # Use a unique field from CSV if available (e.g., id mapped to username?)
                                # Using generated email as the primary lookup key here
                                email=email,
                                defaults={
                                    'username': email, # Required, use email if no other username
                                    'first_name': first_name,
                                    'last_name': last_name,
                                    # Set a default password - users will need to reset it
                                    # It's insecure to derive passwords from CSV data
                                    'password': '!' # Set unusable password
                                }
                            )
                            if created:
                                user.set_unusable_password() # Ensure password is not usable
                                user.save()
                                self.stdout.write(f"Created User: {email}")
                            else:
                                self.stdout.write(f"Found existing User: {email}")


                            # --- Populate Profile Fields ---
                            # Use update_or_create for the profile as well
                            # The signal handler might have already created it if the user existed
                            profile, profile_created = UserProfile.objects.update_or_create(
                                user=user,
                                defaults={
                                    'city': row.get('city', '').strip() or None,
                                    'country_code': row.get('country_code', '').strip() or None,
                                    'region': row.get('region', '').strip() or None,
                                    'about': row.get('about', '').strip() or None,
                                    'avatar': row.get('avatar', '').strip() or None,
                                    'url': row.get('url', '').strip() or None,
                                    'position': row.get('position', '').strip() or None,
                                    'current_company_name': row.get('current_company:name', '').strip() or None,
                                    'current_company_id': row.get('current_company:company_id', '').strip() or None,
                                    'experience_details': row.get('experience', '').strip() or None, # Map 'experience' CSV to 'experience_details' model field
                                    'experience_level': row.get('experience_level', '').strip() or None,
                                    'education_summary': row.get('education', '').strip() or None, # Map 'education' CSV to 'education_summary' model field
                                    'education_details': row.get('educations_details', '').strip() or None, # Map 'educations_details' CSV
                                    'skills': row.get('skills', '').strip() or None,
                                    'skill_categories': row.get('skill_categories', '').strip() or None,
                                    'languages': row.get('languages', '').strip() or None,
                                    'interests': row.get('interests', '').strip() or None,
                                    'startup_industries': row.get('startup_industries', '').strip() or None,
                                    'startup_goals': row.get('startup_goals', '').strip() or None,
                                    # Add other fields as needed
                                }
                            )

                            if profile_created and not created:
                                 self.stdout.write(f"Created Profile for existing User: {email}")
                            elif not profile_created:
                                 self.stdout.write(f"Updated Profile for User: {email}")


                        imported_count += 1

                    except IntegrityError as e:
                        self.stdout.write(self.style.ERROR(f"IntegrityError for row (maybe duplicate email/username?): {row} - {e}"))
                        error_count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"Error processing row: {row} - {e}"))
                        error_count += 1

        except FileNotFoundError:
            raise CommandError(f'File "{file_path}" does not exist.')
        except Exception as e:
             raise CommandError(f'An unexpected error occurred: {e}')

        self.stdout.write(self.style.SUCCESS(f'Import finished.'))
        self.stdout.write(self.style.SUCCESS(f'Successfully imported/updated: {imported_count}'))
        self.stdout.write(self.style.WARNING(f'Skipped rows: {skipped_count}'))
        self.stdout.write(self.style.ERROR(f'Rows with errors: {error_count}'))
