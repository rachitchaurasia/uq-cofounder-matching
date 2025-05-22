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
- [Android Studio/ Xcode (MacOS)] (run on emulator)

## 🏁 Getting Started

#### 1. Clone the Repository

```bash
git clone git@github.com:rachitchaurasia/uq-cofounder-matching.git
cd uq-cofounder-matching
```
### Frontend Setup
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

##### On Your Phone (Ensure the SDK version is Expo 52)
- **iOS**: Scan the QR code with your iPhone's camera
- **Android**: Scan the QR code using the Expo Go app 

##### On Emulator/Simulator
- Press `a` - to open on Android emulator
- Press `i` - to open on iOS simulator
- Press `w` - to open in web browser

## 🛠️ Available Scripts

### Frontend

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator
- `npm run ios` - Start the app on iOS simulator
- `npm run web` - Start the app in web browser

## Run Project on Emulator

After running `npx expo start`:

### Android Studio
1. Open Android Studio
2. Start AVD (Android Virtual Device)Manager → Launch emulator
3. In terminal, press `a`

### Xcode (iOS Simulator)
1. Open Xcode
2. Go to Xcode → Open Developer Tool → Simulator
3. In terminal, press `i`

### Requirements
- Expo SDK 52
- Android Studio with AVD setup
- Xcode with iOS Simulator (Mac only)


### Web-Dashboard Setup
#### 2. Install Web Dashboard Dependencies

```bash
cd web-dashboard
npm install
```

#### 3. Start the Web Dashboard Development Server

```bash
npm start
```

This will start the bundler and launch the dashboard in your browser from localhost.

Login into web dashboard using (remember only this login works as it has admin rights):
- email: admin@uqcofounder.com
- password: admin@1234

## 📁 Project Structure

```
uq-cofounder-matching/
├── QR/
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
└── web-dashboard/
      ├── public/            # index page
      ├── src/           # source folder
         ├── components/
         ├── contexts/   
         ├── App.css
         ├── App.css
```

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


#### Permission Errors
Ensure you have proper file permissions in your project directory.

## ⚙️ Environment Setup

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- React Native Tools
- TypeScript React code snippets
- Python

### IDE Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```
