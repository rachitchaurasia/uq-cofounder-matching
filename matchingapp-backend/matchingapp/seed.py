import os
import random
import uuid
from datetime import datetime, timezone
from faker import Faker
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions

# --- START CONFIGURATION ---
SUPABASE_URL = "https://oebbdjlfnnjivqsspcuf.supabase.co"
SUPABASE_SERVICE_KEY = "put-service-key-here"
# --- END CONFIGURATION ---

fake = Faker()

# Predefined lists for realistic data (Keep as is)
SKILLS_LIST = [
    "Python", "JavaScript", "React", "Node.js", "AWS", "Marketing", "Sales", 
    "UI/UX Design", "Product Management", "Data Analysis", "TypeScript", "Django", 
    "Supabase", "SQL", "NoSQL", "DevOps", "Mobile Development", "Project Management", 
    "Business Strategy", "Financial Modeling", "Agile Methodologies", "Growth Hacking",
    "Content Creation", "SEO/SEM", "Public Speaking", "Networking", "Java", "C++", "Ruby",
    "PHP", "Swift", "Kotlin", "Go", "Rust", "Docker", "Kubernetes", "Terraform", "Jenkins",
    "GraphQL", "REST APIs", "Cybersecurity", "Machine Learning", "Deep Learning", "NLP"
]
INTERESTS_LIST = [
    "AI Ethics", "Sustainable Tech", "Biohacking", "Quantum Computing", "Decentralized Finance", 
    "Augmented Reality", "Virtual Reality", "Space Colonization", "Urban Farming", "Minimalism", 
    "Stoicism", "Indie Game Development", "Competitive Programming", "Open Source Contribution", 
    "Podcasting", "Film Making", "Photography", "Creative Writing", "Learning New Languages"
]
INDUSTRIES_LIST = [
    "Artificial Intelligence", "Biotechnology", "CleanTech", "Cybersecurity", "Digital Health",
    "EdTech", "FinTech", "FoodTech", "Gaming", "IoT", "Logistics & Supply Chain",
    "Manufacturing Tech", "Marketing Tech", "Media & Entertainment", "Mobility Tech",
    "Nanotechnology", "PropTech", "RetailTech", "Robotics", "SaaS", "SpaceTech", "SportsTech"
]
EDUCATION_SUMMARY_LIST = ["High School Diploma", "Bachelor of Science", "Bachelor of Arts", "Master of Business Administration", "Master of Science", "PhD in Computer Science", "Vocational Certificate", "Self-Taught Specialist", "Associate Degree in Engineering"]
STARTUP_GOALS_LIST = [
    "Secure Series A Funding", "Achieve $1M ARR", "Expand to International Markets", 
    "Build a Recognizable Brand", "Foster a Positive Company Culture", "Develop Patented Technology", 
    "Acquire Key Competitors", "Reach 100,000 Active Users", "Become Carbon Neutral",
    "Partner with Industry Leaders"
]
ROLES_LIST = [
    "Founder", "Co-founder", "Chief Executive Officer (CEO)", "Chief Technology Officer (CTO)", 
    "Chief Operating Officer (COO)", "Chief Marketing Officer (CMO)", "Chief Financial Officer (CFO)",
    "VP of Engineering", "VP of Product", "VP of Sales", "Lead Developer", "Senior Software Engineer",
    "Product Designer", "Growth Manager", "Data Scientist", "Investor Relations", "Advisor", "Mentor"
]
LOOKING_FOR_ELEMENTS = SKILLS_LIST + ["Seed Funding", "Angel Investment", "VC Funding", "Strategic Partnerships", "Mentorship", "Co-founder (Technical)", "Co-founder (Business)", "Early Adopters", "Beta Testers", "Board Members"]
OFFERS_ELEMENTS = ["Mentorship in Deep Tech", "Expertise in B2B Sales", "Network in [Specific Industry]", "Pre-seed Investment", "Strategic Advice on Scaling", "Technical Prototyping Skills", "UI/UX Design Services", "Product Validation Feedback", "Access to a Global Network of Entrepreneurs", "Early Access to Disruptive Technology"]
LANGUAGES_LIST = ["English", "Spanish", "Mandarin", "Hindi", "French", "Arabic", "Bengali", "Russian", "Portuguese", "German", "Japanese", "Korean"]
SKILL_CATEGORIES_EXAMPLES = {
    "Technical": ["Python", "JavaScript", "AWS", "SQL", "Docker", "Machine Learning"],
    "Business": ["Marketing", "Sales", "Business Strategy", "Financial Modeling", "Project Management"],
    "Design": ["UI/UX Design", "Prototyping", "User Research"],
    "Soft Skills": ["Public Speaking", "Networking", "Leadership", "Teamwork"]
}

def generate_skill_categories(selected_skills):
    categories = {}
    for skill in selected_skills:
        found_category = None
        for cat, cat_skills in SKILL_CATEGORIES_EXAMPLES.items():
            if skill in cat_skills:
                found_category = cat
                break
        if found_category:
            if found_category not in categories:
                categories[found_category] = []
            categories[found_category].append(skill)
        else: # Default category if not found
            if "Other Technical" not in categories:
                 categories["Other Technical"] = []
            categories["Other Technical"].append(skill)
    return categories


def generate_profile_data():
    """Generates a dictionary of fake profile data matching the new schema."""
    selected_skills = random.sample(SKILLS_LIST, k=random.randint(4, 10))
    
    profile = {
        "full_name": fake.name(),
        "avatar_url": f"https://i.pravatar.cc/300?u={uuid.uuid4()}",
        "city": fake.city(),
        "country_code": fake.country_code(),
        "region": fake.state() if fake.country_code() == "US" else fake.city(),
        "about": fake.paragraph(nb_sentences=random.randint(2,5)),
        "url": fake.url() if random.random() > 0.3 else None, 
        "position": fake.job(),
        
        "current_company_name": fake.company() if random.random() > 0.2 else None,
        "current_company_id": str(uuid.uuid4()) if random.random() > 0.5 else None,
        
        "experience_details": fake.text(max_nb_chars=500),
        "experience_level": f"{random.randint(0,20)}+ years", 
        
        "education_summary": random.choice(EDUCATION_SUMMARY_LIST),
        "education_details": fake.text(max_nb_chars=300),
        
        "skills": selected_skills, 
        "skill_categories": generate_skill_categories(selected_skills), 
        
        "languages": ", ".join(random.sample(LANGUAGES_LIST, k=random.randint(1,3))), 
        "interests": ", ".join(random.sample(INTERESTS_LIST, k=random.randint(3, 7))), 
        "startup_industries": random.sample(INDUSTRIES_LIST, k=random.randint(1, 4)), 
        "startup_goals": random.choice(STARTUP_GOALS_LIST),
        
        "certifications": fake.sentence(nb_words=random.randint(3,6)) if random.random() > 0.6 else None,
        "courses": fake.sentence(nb_words=random.randint(4,7)) if random.random() > 0.5 else None,
        "recommendations_count": random.randint(0, 25),
        "volunteer_experience": fake.text(max_nb_chars=200) if random.random() > 0.7 else None,
        
        "role": random.choice(ROLES_LIST),
        "show_role_on_profile": random.choice([True, False]),
        "looking_for": ", ".join(random.sample(LOOKING_FOR_ELEMENTS, k=random.randint(1, 5))), 
        "offers": ", ".join(random.sample(OFFERS_ELEMENTS, k=random.randint(1, 4))), 
        "phone": fake.phone_number() if random.random() > 0.4 else None,
        
        "onboarding_completed": True,
        "updated_at": datetime.now(timezone.utc).isoformat() 
    }
    return profile

def main():
    try:
        # Create Supabase client with default options
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print(f"Successfully connected to Supabase: {SUPABASE_URL}")
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        import traceback
        traceback.print_exc()
        return

    num_users_to_create = 1234 # Start with a small number for testing
    print(f"Attempting to create and profile {num_users_to_create} users...")

    # ... (rest of your main loop for creating users remains the same)
    for i in range(num_users_to_create):
        print(f"\nProcessing user {i+1}/{num_users_to_create}...")
        
        generated_full_name = fake.name() 
        user_email = fake.unique.email() 
        user_password = fake.password(length=12, special_chars=True, digits=True, upper_case=True, lower_case=True)

        try:
            user_attr = {
                "email": user_email,
                "password": user_password,
                "email_confirm": True, 
                "user_metadata": {"full_name": generated_full_name} 
            }
            auth_response = supabase.auth.admin.create_user(user_attr)
            
            if hasattr(auth_response, 'user') and auth_response.user and hasattr(auth_response.user, 'id'):
                user_id = auth_response.user.id
                print(f"  User created in auth.users: ID {user_id}, Email: {user_email}")

                profile_data_to_update = generate_profile_data()
                
                update_response = supabase.table("profiles").update(profile_data_to_update).eq("id", user_id).execute()

                if update_response.data: 
                    print(f"  Profile updated for user ID {user_id}.")
                else:
                    error_info = getattr(update_response, 'error', None)
                    if error_info:
                        print(f"  Error updating profile for user ID {user_id}: {error_info}")
                    else:
                        print(f"  Profile update for user ID {user_id} completed, but no data returned. Response: {update_response}")
            else:
                error_message = "Unknown error during user creation."
                if hasattr(auth_response, 'message'): 
                    error_message = auth_response.message
                elif hasattr(auth_response, 'error') and hasattr(auth_response.error, 'message'): 
                    error_message = auth_response.error.message
                
                print(f"  Failed to create user {user_email}. Error: {error_message}. Full response: {auth_response}")

        except Exception as e:
            print(f"  An unexpected error occurred while processing user {user_email}: {e}")
            import traceback
            traceback.print_exc()


    print(f"\nFinished processing {num_users_to_create} users.")

if __name__ == "__main__":
    main()