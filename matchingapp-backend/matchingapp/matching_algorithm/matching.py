import pandas as pd
import json # Use json instead of eval for safety
import math
from collections import Counter

def compute_match_score(person1, person2, weights):
    """
    Computes a match score based on shared attributes and complementarity.
    Args:
        person1 (pd.Series): Row for the first person.
        person2 (pd.Series): Row for the second person.
        weights (dict): Dictionary defining weights for different factors.
    Returns:
        float: A score between 0 and 1 (potentially higher if weights sum > 1).
    """
    score = 0.0

    # --- 1. Skill Complementarity ---
    p1_categories = set(person1.get("skill_categories", []))
    p2_categories = set(person2.get("skill_categories", []))
    union_categories = p1_categories | p2_categories
    intersection_categories = p1_categories & p2_categories
    # Higher score if they bring different categories to the table
    complementarity_score = len(union_categories) - len(intersection_categories)
    # Normalize based on total possible unique categories (or just use raw diff?)
    # Max possible diff = len(skill_categories) from syndata.py (let's say 4)
    max_possible_categories = 4 # Technical, Business, Management, Design
    normalized_complementarity = complementarity_score / max_possible_categories if max_possible_categories else 0
    score += weights.get("skill_complementarity", 0.3) * normalized_complementarity

    # --- 2. Shared Interests ---
    p1_interests = set(person1.get("interests", []))
    p2_interests = set(person2.get("interests", []))
    shared_interests = p1_interests & p2_interests
    # Score based on number of shared interests (normalize?)
    # Max 5 interests per person -> max 5 shared. Normalize by max possible? Or average num interests?
    # Let's use Jaccard index for similarity: |A intersect B| / |A union B|
    union_interests = p1_interests | p2_interests
    interest_similarity = len(shared_interests) / len(union_interests) if union_interests else 0
    score += weights.get("shared_interests", 0.2) * interest_similarity

    # --- 3. Shared Startup Industries ---
    p1_industries = set(person1.get("startup_industries", []))
    p2_industries = set(person2.get("startup_industries", []))
    shared_industries = p1_industries & p2_industries
    union_industries = p1_industries | p2_industries
    industry_similarity = len(shared_industries) / len(union_industries) if union_industries else 0
    score += weights.get("shared_industries", 0.2) * industry_similarity

    # --- 4. Aligned Startup Goals ---
    # This requires defining 'alignment'. Simple approach: check for overlap.
    # More complex: define compatible goals (e.g., 'Found startup' + 'Join early-stage')
    p1_goals = set(person1.get("startup_goals", []))
    p2_goals = set(person2.get("startup_goals", []))
    shared_goals = p1_goals & p2_goals
    # Simple overlap score (normalized by average number of goals?)
    avg_num_goals = (len(p1_goals) + len(p2_goals)) / 2
    goal_alignment = len(shared_goals) / avg_num_goals if avg_num_goals else 0
    # TODO: Implement more sophisticated goal compatibility logic if needed
    score += weights.get("goal_alignment", 0.2) * goal_alignment

    # --- 5. Experience Level Compatibility ---
    # Score higher for similar levels? Or +/- 1 level difference?
    levels = {"Junior": 1, "Mid-level": 2, "Senior": 3}
    p1_level = levels.get(person1.get("experience_level"), 0)
    p2_level = levels.get(person2.get("experience_level"), 0)
    level_diff = abs(p1_level - p2_level)
    # Max diff is 2 (Senior vs Junior). Score higher for smaller diff.
    # Score = 1 for same level, 0.5 for diff=1, 0 for diff=2
    experience_compatibility = max(0, 1 - level_diff / 2.0) if p1_level > 0 and p2_level > 0 else 0
    score += weights.get("experience_compatibility", 0.1) * experience_compatibility

    return score

def find_matches(people_df, user_id, weights, top_n=10):
    """
    Finds the best matches for a given user.
    Args:
        people_df (pd.DataFrame): DataFrame of user profiles.
        user_id (str): The ID of the user to find matches for.
        weights (dict): Weights for the scoring function.
        top_n (int): Number of top matches to return.
    Returns:
        list: A list of tuples (match_id, match_name, score) sorted by score.
    """
    if user_id not in people_df["id"].values:
        print(f"Error: User ID {user_id} not found.")
        return []

    user = people_df[people_df["id"] == user_id].iloc[0]
    matches = []

    for _, other in people_df[people_df["id"] != user_id].iterrows():
        # Ensure the data being passed is the processed data (lists, not strings)
        score = compute_match_score(user, other, weights)

        # Only consider matches with a score above a certain threshold? Optional.
        # threshold = 0.2 # Example threshold
        # if score >= threshold:
        matches.append((other["id"], other["name"], score))

    # Sort by score descending
    matches.sort(key=lambda x: x[2], reverse=True)
    return matches[:top_n]

# --- Main Execution ---
print("Loading processed profiles...")
people_df = pd.read_csv("people_profiles_with_synthetic_data.csv")

# Define columns that were saved as JSON strings and need parsing
list_cols = ["skills", "skill_categories", "startup_industries", "interests", "startup_goals"]

print("Parsing list columns...")
for col in list_cols:
    if col in people_df.columns:
        # Use json.loads for safety; handle potential errors or empty strings
        def safe_json_loads(x):
            if isinstance(x, str) and x.startswith('['): # Basic check
                try:
                    return json.loads(x)
                except json.JSONDecodeError:
                    return [] # Return empty list if parsing fails
            return [] # Default for non-strings or non-list-like strings
        people_df[col] = people_df[col].apply(safe_json_loads)
    else:
        print(f"Warning: Expected column '{col}' not found in CSV.")

# Define weights for the matching factors (these should sum ideally to 1, but can be tuned)
match_weights = {
    "skill_complementarity": 0.30,
    "shared_interests": 0.20,
    "shared_industries": 0.15,
    "goal_alignment": 0.25, # Increased weight for goals
    "experience_compatibility": 0.10
}

# --- Example Usage ---
user_id_to_match = "catherinemcilkenny" # Replace with a valid ID from your profile.csv
print(f"\nFinding matches for user ID: {user_id_to_match}")

matches = find_matches(people_df, user_id_to_match, match_weights, top_n=5)

if matches:
    user_profile = people_df[people_df['id'] == user_id_to_match].iloc[0]
    print(f"\n--- User Profile ---")
    print(f"Name: {user_profile['name']}")
    print(f"Experience: {user_profile['experience_level']}")
    print(f"Skills: {user_profile['skills']}")
    print(f"Categories: {user_profile['skill_categories']}")
    print(f"Industries: {user_profile['startup_industries']}")
    print(f"Interests: {user_profile['interests']}")
    print(f"Goals: {user_profile['startup_goals']}")


    print(f"\n--- Top {len(matches)} Matches ---")
    for match_id, match_name, score in matches:
        print(f"- {match_name} (ID: {match_id}, Score: {score:.3f})")

        # Optional: Print details of the match for comparison
        match_profile = people_df[people_df['id'] == match_id].iloc[0]
        print(f"    Experience: {match_profile['experience_level']}")
        print(f"    Categories: {match_profile['skill_categories']}")
        print(f"    Industries: {match_profile['startup_industries']}")
        print(f"    Interests: {match_profile['interests']}")
        print(f"    Goals: {match_profile['startup_goals']}")

else:
    print(f"No matches found for {user_id_to_match}.")