# 31C: UQ Ventures Co-Founder Matching (The Last of Us)
### Connecting Innovators to Build Startups  

A mobile application to help UQ students find potential co-founders for their startup ideas.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version >= 18.0.0)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Python](https://www.python.org/) (version >= 3.9)
- [pip](https://pip.pypa.io/en/stable/installation/) (Python package manager)
- [Expo Go](https://expo.dev/client) app on your mobile device
- [VS Code](https://code.visualstudio.com/) (recommended IDE)

## 🏁 Getting Started

### Frontend Setup

#### 1. Clone the Repository

```bash
git clone git@github.com:rachitchaurasia/uq-cofounder-matching.git
cd uq-cofounder-matching
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

#### 3. Start the Frontend Development Server

```bash
npx expo start
```

This will start the Metro bundler and show a QR code in your terminal.

#### 4. Running the Frontend App

##### On Your Phone
- **iOS**: Scan the QR code with your iPhone's camera
- **Android**: Scan the QR code using the Expo Go app

##### On Emulator/Simulator
- Press `a` - to open on Android emulator
- Press `i` - to open on iOS simulator
- Press `w` - to open in web browser

### Backend Setup

#### 1. Set Up Python Environment (Recommended)

```bash
# Using conda (recommended)
conda create -n uq-matcher python=3.9
conda activate uq-matcher

# Alternatively using venv
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

#### 2. Install Backend Dependencies

```bash
cd matchingapp-backend/matchingapp
pip install -r requirements.txt
```

#### 3. Run the Django Backend Server

```bash
python manage.py runserver
```

The backend will be available at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

## 🛠️ Available Scripts

### Frontend

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator
- `npm run ios` - Start the app on iOS simulator
- `npm run web` - Start the app in web browser

### Backend

- `python manage.py runserver` - Start the Django development server
- `python manage.py migrate` - Apply database migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py makemigrations` - Create new migrations based on model changes

## 📁 Project Structure

```
uq-cofounder-matching/
├── frontend/
│   ├── src/
│   │   ├── assets/         # Images, fonts, and other static files
│   │   ├── components/     # Reusable components
│   │   ├── navigation/     # Navigation configuration
│   │   ├── screens/        # Screen components
│   │   ├── services/       # API services
│   │   └── data/           # Sample data and constants
│   ├── App.tsx             # Root component
│   ├── app.json            # Expo configuration
│   ├── package.json        # Frontend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
└── matchingapp-backend/
    └── matchingapp/
        ├── api/            # API endpoints
        ├── chat/           # Chat functionality
        ├── chatbot/        # Chatbot functionality
        ├── matching/       # Matching functionality
        ├── matching_algorithm/  # Matching algorithm logic
        ├── user_management/     # User management
        ├── userprofile/    # User profile functionality
        ├── manage.py       # Django management script
        └── requirements.txt     # Backend dependencies
```

## 💻 Development Guidelines

### Frontend

1. **TypeScript**
   - Use TypeScript for all new files
   - Ensure proper type definitions

2. **Code Style**
   - Follow existing code formatting
   - Use functional components
   - Use hooks for state management

3. **Navigation**
   - Add new screens in `src/navigation/types.ts`
   - Update navigation files for new routes

4. **Assets**
   - Place all images in `src/assets`
   - Use proper naming conventions

### Backend

1. **Django Models**
   - Define clear models with proper relationships
   - Use Django's ORM features

2. **API Endpoints**
   - Create RESTful endpoints
   - Use Django REST Framework serializers
   - Document API endpoints

3. **Security**
   - Use proper authentication
   - Validate all inputs
   - Use environment variables for sensitive data

## 🔍 Common Issues & Solutions

### Frontend Issues

#### Metro Bundler Issues
If you encounter bundler issues:
```bash
npx expo start -c
```
This clears the Metro bundler cache.

#### Dependencies Issues
If you face dependency-related errors:
```bash
rm -rf node_modules
npm install
```

#### Expo Go Connection Issues
1. Ensure your phone and computer are on the same network
2. Try switching between tunnel, LAN, and local connection modes
3. Restart the Expo development server

### Backend Issues

#### Missing Dependencies
If you see errors about missing modules:
```bash
pip install -r requirements.txt
```

#### Database Migration Issues
If you have database errors:
```bash
python manage.py migrate
```

#### Permission Errors
Ensure you have proper file permissions in your project directory.

## ⚙️ Environment Setup

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- React Native Tools
- TypeScript React code snippets
- Python
- Django

### IDE Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 🤝 Contributing

1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit using conventional commits
   ```bash
   git commit -m "(scope): description"
   ```

3. Push your changes and create a pull request

## ❓ Troubleshooting

If you encounter any issues:

1. Check if Expo Go is up to date
2. Verify Node.js and Python version compatibility
3. Clear Metro bundler cache
4. Check for any conflicting dependencies
5. Ensure all environment variables are set correctly
6. Check Django debug logs for backend errors

## 🔐 Backend Admin Access

After running the server, you can access the Django admin interface:

1. Create a superuser if you haven't already:
   ```bash
   python manage.py createsuperuser
   ```

2. Navigate to [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/)

3. Login with your superuser credentials 
