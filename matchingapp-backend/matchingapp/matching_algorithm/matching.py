import pandas as pd
import math
from collections import Counter
import logging # Use logging for better output control

# Django Imports (needed when called from manage.py)
from django.core.exceptions import ObjectDoesNotExist
from userprofile.models import UserProfile
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__) # Setup logger

# --- Helper Function to Safely Split Text Fields ---
def split_text_field(text_value):
    """Splits a comma-separated string into a list of stripped strings."""
    if not text_value or not isinstance(text_value, str):
        return []
    return [item.strip() for item in text_value.split(',') if item.strip()]

# --- Core Matching Logic (mostly unchanged, uses dicts/Series) ---
def compute_match_score(person1_data, person2_data, weights):
    """
    Computes a match score based on shared attributes and complementarity.
    Args:
        person1_data (dict or pd.Series): Data for the first person (with lists).
        person2_data (dict or pd.Series): Data for the second person (with lists).
        weights (dict): Dictionary defining weights for different factors.
    Returns:
        float: A score between 0 and 1 (potentially higher if weights sum > 1).
    """
    score = 0.0

    # --- 1. Skill Complementarity ---
    # Use .get() with default empty list for safety
    p1_categories = set(person1_data.get("skill_categories", []))
    p2_categories = set(person2_data.get("skill_categories", []))
    union_categories = p1_categories | p2_categories
    intersection_categories = p1_categories & p2_categories
    complementarity_score = len(union_categories) - len(intersection_categories)
    max_possible_categories = 4 # Technical, Business, Management, Design (adjust if needed)
    normalized_complementarity = complementarity_score / max_possible_categories if max_possible_categories else 0
    score += weights.get("skill_complementarity", 0.3) * normalized_complementarity

    # --- 2. Shared Interests ---
    p1_interests = set(person1_data.get("interests", []))
    p2_interests = set(person2_data.get("interests", []))
    shared_interests = p1_interests & p2_interests
    union_interests = p1_interests | p2_interests
    interest_similarity = len(shared_interests) / len(union_interests) if union_interests else 0
    score += weights.get("shared_interests", 0.2) * interest_similarity

    # --- 3. Shared Startup Industries ---
    p1_industries = set(person1_data.get("startup_industries", []))
    p2_industries = set(person2_data.get("startup_industries", []))
    shared_industries = p1_industries & p2_industries
    union_industries = p1_industries | p2_industries
    industry_similarity = len(shared_industries) / len(union_industries) if union_industries else 0
    score += weights.get("shared_industries", 0.2) * industry_similarity

    # --- 4. Aligned Startup Goals ---
    p1_goals = set(person1_data.get("startup_goals", []))
    p2_goals = set(person2_data.get("startup_goals", []))
    shared_goals = p1_goals & p2_goals
    avg_num_goals = (len(p1_goals) + len(p2_goals)) / 2
    goal_alignment = len(shared_goals) / avg_num_goals if avg_num_goals else 0
    score += weights.get("goal_alignment", 0.2) * goal_alignment

    # --- 5. Experience Level Compatibility ---
    levels = {"Junior": 1, "Mid-level": 2, "Senior": 3} # Consider making this case-insensitive
    p1_level = levels.get(person1_data.get("experience_level", ""), 0)
    p2_level = levels.get(person2_data.get("experience_level", ""), 0)
    level_diff = abs(p1_level - p2_level)
    experience_compatibility = max(0, 1 - level_diff / 2.0) if p1_level > 0 and p2_level > 0 else 0
    score += weights.get("experience_compatibility", 0.1) * experience_compatibility

    return score

# --- Main Algorithm Runner ---
def run_matching_for_user(target_user_id, weights, top_n=10):
    """
    Finds the best matches for a given user ID using database data.
    Args:
        target_user_id (int): The Django User ID of the user to find matches for.
        weights (dict): Weights for the scoring function.
        top_n (int): Number of top matches to return.
    Returns:
        tuple: (target_user_data, list_of_matches)
               target_user_data (dict): Processed data for the target user.
               list_of_matches (list): A list of tuples (match_user_id, match_name, score) sorted by score.
               Returns (None, []) if the target user is not found.
    """
    logger.info(f"Starting matching for user ID: {target_user_id}")

    # Define fields to retrieve and corresponding split function if needed
    fields_to_fetch = {
        'user_id': None, # Will get from user.id
        'name': None, # Will get from user.get_full_name() or username/email
        'email': None, # user.email
        'city': None,
        'country_code': None,
        'region': None,
        'position': None,
        'experience_level': None,
        'skills': split_text_field,
        'skill_categories': split_text_field,
        'interests': split_text_field,
        'startup_industries': split_text_field,
        'startup_goals': split_text_field,
        # Add other fields from UserProfile if needed by the algorithm
    }

    # Fetch all potentially relevant profiles efficiently
    all_profiles = UserProfile.objects.select_related('user').filter(user__is_active=True)
    # Use .values() to get dictionaries, potentially more efficient
    # profile_values = all_profiles.values(
    #     'user_id', 'user__email', 'user__first_name', 'user__last_name',
    #     'city', 'country_code', ... # list all needed fields
    # )

    processed_profiles = {} # Store processed data (with lists) keyed by user_id

    logger.info(f"Processing {all_profiles.count()} active profiles...")
    for profile in all_profiles:
        user_data = {}
        profile_user = profile.user
        user_id = profile_user.id

        for field, processor in fields_to_fetch.items():
            value = None
            if field == 'user_id':
                value = user_id
            elif field == 'name':
                value = profile_user.get_full_name() or profile_user.email # Fallback to email
            elif field == 'email':
                value = profile_user.email
            elif hasattr(profile, field):
                value = getattr(profile, field)
                if processor: # Apply splitting function if defined
                    value = processor(value)
            user_data[field] = value

        processed_profiles[user_id] = user_data

    # Find the target user's processed data
    target_user_data = processed_profiles.get(target_user_id)

    if not target_user_data:
        logger.error(f"Target user ID {target_user_id} not found among processed profiles.")
        return None, []

    matches = []
    logger.info(f"Calculating scores against {len(processed_profiles) - 1} other profiles...")
    for other_user_id, other_data in processed_profiles.items():
        if other_user_id == target_user_id:
            continue # Skip self-comparison

        score = compute_match_score(target_user_data, other_data, weights)

        # Optional: Apply score threshold
        # threshold = 0.2
        # if score >= threshold:
        matches.append((other_user_id, other_data.get('name', 'N/A'), score))

    # Sort by score descending
    matches.sort(key=lambda x: x[2], reverse=True)

    logger.info(f"Found {len(matches)} potential matches. Returning top {top_n}.")
    return target_user_data, matches[:top_n]


# Note: The old main execution block reading from CSV is removed.
# This script now primarily exports the run_matching_for_user function.