import csv
import random
import sys
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from userprofile.models import UserProfile
from django.db import IntegrityError, transaction
from django.db.models.signals import post_save
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Imports user profiles from a specified CSV file with option to delete existing data.'

    def add_arguments(self, parser):
        parser.add_argument('csv_file_path', type=str, help='The path to the CSV file to import.')
        parser.add_argument(
            '--delete-existing',
            action='store_true',
            help='Delete all existing profiles and users before import',
        )
        parser.add_argument(
            '--no-prompt',
            action='store_true',
            help='Do not prompt for confirmation before deletion',
        )

    def handle(self, *args, **options):
        file_path = options['csv_file_path']
        delete_existing = options['delete_existing']
        no_prompt = options['no_prompt']
        
        # Temporarily disconnect the post_save signal that creates profiles
        from userprofile.models import create_or_update_user_profile
        post_save.disconnect(create_or_update_user_profile, sender=settings.AUTH_USER_MODEL)
        
        self.stdout.write(self.style.SUCCESS(f'Starting import process from {file_path}'))
        
        # Delete existing data if requested
        if delete_existing:
            if not no_prompt:
                confirm = input('⚠️ WARNING: This will delete ALL existing user profiles and users. Are you sure? (yes/no): ')
                if confirm.lower() != 'yes':
                    self.stdout.write(self.style.WARNING('Operation canceled by user.'))
                    # Reconnect signal before exiting
                    post_save.connect(create_or_update_user_profile, sender=settings.AUTH_USER_MODEL)
                    return
            
            try:
                with transaction.atomic():
                    # Delete all profiles first (due to foreign key constraints)
                    profile_count = UserProfile.objects.count()
                    UserProfile.objects.all().delete()
                    
                    # Delete all users
                    user_count = User.objects.count()
                    User.objects.all().delete()
                    
                    self.stdout.write(self.style.SUCCESS(f'Deleted {profile_count} profiles and {user_count} users'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error deleting existing data: {e}'))
                # Reconnect signal before exiting
                post_save.connect(create_or_update_user_profile, sender=settings.AUTH_USER_MODEL)
                return

        imported_count = 0
        skipped_count = 0
        error_count = 0

        try:
            with open(file_path, mode='r', encoding='utf-8') as csvfile:
                # Use DictReader for easier access by header name
                reader = csv.DictReader(csvfile)
                
                # Store all rows for validation before processing
                rows = list(reader)
                
                if not rows:
                    self.stdout.write(self.style.WARNING('CSV file is empty or could not be read properly.'))
                    # Reconnect signal before exiting
                    post_save.connect(create_or_update_user_profile, sender=settings.AUTH_USER_MODEL)
                    return
                
                # --- IMPORTANT: Verify Headers ---
                # Check if required headers are present
                required_headers = ['id', 'name']
                if not all(header in reader.fieldnames for header in required_headers):
                    missing = set(required_headers) - set(reader.fieldnames or [])
                    raise CommandError(f"CSV file is missing required headers: {', '.join(missing)}")
                
                self.stdout.write(self.style.SUCCESS(f'CSV headers verified. Found {len(rows)} records to process.'))
                
                # Optional progress bar handling
                import_total = len(rows)
                
                for i, row in enumerate(rows):
                    # Display progress
                    progress = (i / import_total) * 100
                    sys.stdout.write(f"\rImporting: {progress:.1f}% ({i+1}/{import_total})")
                    sys.stdout.flush()
                    
                    try:
                        # --- Data Extraction and Cleaning ---
                        user_id_csv = row.get('id', '').strip()
                        full_name = row.get('name', '').strip()
                        
                        if not user_id_csv:
                            skipped_count += 1
                            continue
                        
                        # Generate a placeholder email
                        email = f"{user_id_csv}@example.com"
                        
                        # Extract first/last name (simple split)
                        name_parts = full_name.split(' ') if full_name else [f"User_{user_id_csv}"]
                        first_name = name_parts[0]
                        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
                        
                        # --- Create User and Profile within a Transaction ---
                        with transaction.atomic():
                            # Create the User
                            user = User.objects.create_user(
                                username=email,
                                email=email,
                                first_name=first_name,
                                last_name=last_name
                            )
                            # Set a temporary password
                            user.set_password('12345678')
                            user.save()
                            
                            # --- Create Profile with all available fields ---
                            profile = UserProfile.objects.create(
                                user=user,
                                city=row.get('city', '').strip() or None,
                                country_code=row.get('country_code', '').strip() or '+61',
                                region=row.get('region', '').strip() or 'Australia',
                                about=row.get('about', '').strip() or None,
                                avatar=row.get('avatar', '').strip() or None,
                                url=row.get('url', '').strip() or None,
                                position=row.get('position', '').strip() or random.choice(['CO-FOUNDER', 'INVESTOR', 'ENTREPRENEUR', 'DEVELOPER', 'STARTUP']),
                                current_company_name=row.get('current_company:name', '').strip() or None,
                                current_company_id=row.get('current_company:company_id', '').strip() or None,
                                experience_details=row.get('experience', '').strip() or None,
                                experience_level=row.get('experience_level', '').strip() or None,
                                education_summary=row.get('education', '').strip() or None,
                                education_details=row.get('educations_details', '').strip() or None,
                                skills=row.get('skills', '').strip() or None,
                                skill_categories=row.get('skill_categories', '').strip() or None,
                                languages=row.get('languages', '').strip() or None,
                                interests=row.get('interests', '').strip() or random.choice(["AI", "Machine Learning", "Healthcare", "Climate change", "Energy", "Heavy Metal", "House Parties", "Gin Tonic", "Gymnastics", "Cloud","Hot Yoga", "Meditation", "Spotify", "Sushi", "Hockey", "Basketball","Slam Poetry", "Home Workout", "Theater", "Cafe Hopping", "Aquarium", "Sneakers"]),
                                startup_industries=row.get('startup_industries', '').strip() or random.choice(['Tech', 'Finance', 'Healthcare', 'Education', 'Retail', 'Entertainment', 'Other']),
                                startup_goals=row.get('startup_goals', '').strip() or random.choice(['Grow revenue', 'Expand market', 'Develop new product', 'Improve customer service', 'Find Co-Founder', 'Improve customer satisfaction', 'Increase customer engagement', 'Increase customer loyalty', 'Increase customer retention', 'Increase customer satisfaction', 'Increase customer engagement', 'Increase customer loyalty']),
                                certifications=row.get('certifications', '').strip() or None,
                                courses=row.get('courses', '').strip() or None,
                                recommendations_count=int(row.get('recommendations_count', 0)) if row.get('recommendations_count', '').strip() else 0,
                                volunteer_experience=row.get('volunteer_experience', '').strip() or None,
                                phone=row.get('phone', '').strip() or "1234567898",
                            )
                            
                        imported_count += 1
                        
                    except IntegrityError as e:
                        self.stdout.write(self.style.ERROR(f"\nIntegrityError for row {i+1}: {e}"))
                        error_count += 1
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"\nError processing row {i+1}: {e}"))
                        error_count += 1
                
                # End progress line
                sys.stdout.write("\n")

        except FileNotFoundError:
            raise CommandError(f'File "{file_path}" does not exist.')
        except Exception as e:
            raise CommandError(f'An unexpected error occurred: {e}')
        finally:
            # Always reconnect the signal when done
            post_save.connect(create_or_update_user_profile, sender=settings.AUTH_USER_MODEL)

        self.stdout.write(self.style.SUCCESS(f'\nImport finished!'))
        self.stdout.write(self.style.SUCCESS(f'Successfully imported: {imported_count}'))
        self.stdout.write(self.style.WARNING(f'Skipped rows: {skipped_count}'))
        self.stdout.write(self.style.ERROR(f'Rows with errors: {error_count}'))
        
        # Add instructions for after import
        self.stdout.write(self.style.SUCCESS('\nNext Steps:'))
        self.stdout.write('1. Run migrations if needed: python manage.py migrate')
        self.stdout.write('2. Create a superuser if needed: python manage.py createsuperuser')
        self.stdout.write('3. Check the imported data in Django admin')
