import logging
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
# Import the function that does the work from matching.py
from matching_algorithm.matching import run_matching_for_user

User = get_user_model()
logger = logging.getLogger(__name__)

# Configure logging level for the command output
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


class Command(BaseCommand):
    help = 'Runs the co-founder matching algorithm for a specific user ID using database data.'

    def add_arguments(self, parser):
        # --- Argument for User ID ---
        parser.add_argument(
            'user_id',
            type=int,
            help='The ID of the User to find matches for.'
        )
        # --- Optional: Argument for number of matches ---
        parser.add_argument(
            '--top-n',
            type=int,
            default=10,
            help='Number of top matches to return.'
        )

    def handle(self, *args, **options):
        user_id_to_match = options['user_id']
        top_n = options['top_n']

        # --- Define Weights (Keep them here or load from settings/config) ---
        match_weights = {
            "skill_complementarity": 0.30,
            "shared_interests": 0.20,
            "shared_industries": 0.15,
            "goal_alignment": 0.25,
            "experience_compatibility": 0.10
        }
        self.stdout.write(self.style.SUCCESS(f'Triggering matching for User ID: {user_id_to_match} (Top {top_n})...'))
        self.stdout.write(f"Using weights: {match_weights}")

        try:
            # --- Call the main function from matching.py ---
            target_user_data, matches = run_matching_for_user(
                target_user_id=user_id_to_match,
                weights=match_weights,
                top_n=top_n
            )

            # --- Output the results ---
            if target_user_data is None:
                self.stdout.write(self.style.ERROR(f"Could not find active profile data for User ID: {user_id_to_match}"))
                return # Exit command if target user not found

            self.stdout.write(self.style.HTTP_INFO("\n--- Target User Profile ---"))
            self.stdout.write(f"Name: {target_user_data.get('name', 'N/A')}")
            self.stdout.write(f"Email: {target_user_data.get('email', 'N/A')}")
            self.stdout.write(f"Experience: {target_user_data.get('experience_level', 'N/A')}")
            self.stdout.write(f"Categories: {target_user_data.get('skill_categories', [])}")
            self.stdout.write(f"Industries: {target_user_data.get('startup_industries', [])}")
            self.stdout.write(f"Interests: {target_user_data.get('interests', [])}")
            self.stdout.write(f"Goals: {target_user_data.get('startup_goals', [])}")


            if matches:
                self.stdout.write(self.style.HTTP_INFO(f"\n--- Top {len(matches)} Matches ---"))
                for match_user_id, match_name, score in matches:
                     self.stdout.write(f"- {match_name} (User ID: {match_user_id}, Score: {score:.3f})")
                     # Optional: Fetch and print details of matches if needed for debugging
            else:
                 self.stdout.write(self.style.WARNING(f"No matches found meeting criteria for User ID: {user_id_to_match}."))


        except Exception as e:
            logger.exception("An error occurred during matching") # Logs traceback
            raise CommandError(f'Matching failed: {e}')

        self.stdout.write(self.style.SUCCESS('\nMatching command finished.'))
