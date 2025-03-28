# 31C: UQ Ventures Co-Founder Matching (The Last of Us)
### Connecting Innovators to Build Startups  

**Categories:**  
- Social / Collaborative Experience  
- Chatbot  
- Collaborative Experience  
- Innovation  
- Social Technology  
- AI Chatbot  
- External Industry Client / Advisor  
- UQ Ventures  

---

## 📜 Project IP  
Students undertaking this project shall assign IP to **UQ Ventures** for commercial purposes while retaining:  
- **Portfolio display rights**  
- **Moral rights**  
- **The right to be attributed as contributors**  

This ensures that students' contributions are protected and acknowledged.  

---

## 📌 Project Brief  
This platform is designed to **connect aspiring entrepreneurs with potential co-founders**, fostering an ecosystem for **collaboration and startup growth**.  

Additionally, it includes an **AI-powered chatbot** for instant guidance on **launching and funding startups**.  

By matching individuals based on **skills, interests, and shared goals**, the platform helps build diverse, complementary teams ready to launch innovative ventures.  

It also supports **live networking features**, enabling real-time connection-building at events through:  
- **Intelligent tagging**  
- **Contextual grouping**  

---

## 🚀 Problem Space  
Finding the right co-founder is one of the **biggest challenges for early-stage entrepreneurs**.  

Many startups fail due to:  
- Gaps in skills  
- Misaligned visions  
- Lack of networking opportunities  

### 🔴 Limitations of Existing Solutions  
Most networking platforms lack:  
❌ **Structured co-founder matching**  
❌ **Real-time group formation**  
❌ **Intuitive ways to find relevant collaborators**  

### ✅ Our Solution  
This project aims to solve these issues by:  
✅ Implementing a **structured** co-founder matching system  
✅ Facilitating **real-time** connections through **event-based networking**  
✅ Providing tools for **continued engagement**  
✅ Integrating an **AI-powered chatbot** for instant access to:  
  - **Startup resources**  
  - **Funding opportunities**  
  - **UQ Ventures programs**  

---

## 🎯 Success Criteria  
A successful system will:  
✅ Provide an **intuitive platform** where users can:  
   - Create **detailed profiles**  
   - Receive **personalised co-founder recommendations**  
   - Seamlessly **connect in real time**  

✅ Enhance networking experiences at events by:  
   - Implementing **live connections** via phone taps  
   - Grouping network connections based on **location & event context**  

✅ Ensure **ongoing collaboration** through:  
   - **Secure messaging**  
   - **AI-powered suggestions**  

---

## 🔥 This Project **MUST** Have  
### 1️⃣ **Comprehensive User Profiles & Matching Algorithm**  
- Capture **skills, experience, and startup goals**  
- Enable **effective matchmaking** based on compatibility, skills & shared objectives  

### 2️⃣ **Secure Messaging & Communication Tools**  
- Facilitate **direct interactions** between potential co-founders  
- Support **group communication after events**  

### 3️⃣ **Real-Time Networking Features**  
- Enable **live human connections** via:  
  - **Phone-tap interactions**  
  - **Location-based group formation at events**  

### 4️⃣ **AI-Powered Chatbot for Startup Guidance**  
- Provide **centralised access** to:  
  - **UQ Ventures resources**  
  - **Funding opportunities**  
  - **Business planning support**  

### 5️⃣ **Cross-Platform Implementation**  
- Works on **any mobile device** (**iOS, Android**)  
- Accessible via **web browsers** for **analytics & admin tasks**  

---

## 🎯 This Project **COULD** Have  
### 🎟️ **Event Integration**  
- Support **in-person & virtual networking** via **intelligent group tagging**  

### 🤖 **AI-Powered Networking Assistant**  
- Help users find **potential connections** who:  
  - Fill specific startup roles  
  - Have shared interests  

### 🧑‍🏫 **Mentorship Matching**  
- Connect **new founders** with **experienced entrepreneurs** for guidance  

---

## 🛠️ Expected Skills to Have or Develop  
### 🔹 **AI & Natural Language Processing (NLP) Development**  
- Combine **structured data insights** with **advanced conversational AI**  
- Create **seamless user interactions** for connection-making  

### 🔹 **Cross-Platform Mobile Development**  
- Develop **mobile applications** using:  
  - **React Native**  
  - **Flutter**  
  - Other cross-platform frameworks  

### 🔹 **Backend Development & Secure Data Management**  
- Ensure **secure storage & management** of user profiles and communications  

### 🔹 **Community Engagement & Networking Strategy**  
- Build **mechanisms** for fostering:  
  - **Meaningful connections**  
  - **Sustained collaboration**  

---

🎯 **This project aims to revolutionize startup networking by making co-founder discovery more structured, intelligent, and engaging!** 🚀

---

# UQ Co-founder Matcher

A mobile application to help UQ students find potential co-founders for their startup ideas.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (version >= 18.0.0)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Expo Go](https://expo.dev/client) app on your mobile device
- [VS Code](https://code.visualstudio.com/) (recommended IDE)

## Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:rachitchaurasia/uq-cofounder-matching.git
cd uq-cofounder-matching
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npx expo start
```

This will start the Metro bundler and show a QR code in your terminal.

### 4. Running the App

#### On Your Phone
- **iOS**: Scan the QR code with your iPhone's camera
- **Android**: Scan the QR code using the Expo Go app

#### On Emulator/Simulator
- Press `a` - to open on Android emulator
- Press `i` - to open on iOS simulator
- Press `w` - to open in web browser

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Start the app on Android emulator
- `npm run ios` - Start the app on iOS simulator
- `npm run web` - Start the app in web browser

## Project Structure

```
uq-cofounder-matching/
├── src/
│   ├── assets/         # Images, fonts, and other static files
│   ├── navigation/     # Navigation configuration
│   ├── screens/        # Screen components
│   └── components/     # Reusable components
├── App.tsx            # Root component
├── app.json          # Expo configuration
├── package.json      # Project dependencies
└── tsconfig.json     # TypeScript configuration
```

## Development Guidelines

1. **TypeScript**
   - Use TypeScript for all new files
   - Ensure proper type definitions

2. **Code Style**
   - Follow existing code formatting
   - Use functional components
   - Use hooks for state management

3. **Navigation**
   - Add new screens in `src/navigation/types.ts`
   - Update `RootNavigator.tsx` for new routes

4. **Assets**
   - Place all images in `src/assets`
   - Use proper naming conventions

## Common Issues & Solutions

### Metro Bundler Issues
If you encounter bundler issues:
```bash
npx expo start -c
```
This clears the Metro bundler cache.

### Dependencies Issues
If you face dependency-related errors:
```bash
rm -rf node_modules
npm install
```

### Expo Go Connection Issues
1. Ensure your phone and computer are on the same network
2. Try switching between tunnel, LAN, and local connection modes
3. Restart the Expo development server

## Environment Setup

### VS Code Extensions (Recommended)
- ESLint
- Prettier
- React Native Tools
- TypeScript React code snippets

### IDE Configuration
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## Contributing

1. Create a new branch for your feature
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit using conventional commits
   ```bash
   git commit -m "(scope): description"
   ```

3. Push your changes and create a pull request

## Troubleshooting

If you encounter any issues:

1. Check if Expo Go is up to date
2. Verify Node.js version compatibility
3. Clear Metro bundler cache
4. Check for any conflicting dependencies
5. Ensure all environment variables are set correctly

