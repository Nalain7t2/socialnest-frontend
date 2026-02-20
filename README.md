SocialNest Frontend - React Application
📱 Overview
SocialNest is a modern, premium social media web application built with React. It features a stunning dark-themed UI with purple/pink gradients, glassmorphism effects, and smooth animations. The app provides a seamless social networking experience similar to Instagram, X (Twitter), and Threads, but with its own unique identity.

✨ Features
🔐 Authentication
User registration with email/username

Secure login with password

Google OAuth integration

Password reset functionality

JWT token-based authentication

👤 User Profile
Customizable profile with bio and avatar

Profile picture upload with preview

Follow/unfollow users

Followers and following lists

Profile statistics (posts, followers, following)

📝 Posts Management
Create, edit, and delete posts

Image upload with drag & drop

Real-time post preview

Like/unlike posts

Comment on posts

Share posts (native share or copy link)

Search posts by content

🔍 Discovery
Explore trending topics

User search functionality

Follow suggestions

Infinite scroll with pagination

📱 Responsive Design
Mobile-first approach

Mobile menu with slide-out navigation

Mobile follow panel (bottom sheet)

Desktop optimized layout with sidebars

Fully responsive on all devices

🎨 UI/UX Features
Glassmorphism effects with backdrop blur

Purple/Pink gradient theme throughout

Smooth animations and transitions

Toast notifications for all user actions

Live preview for post creation

Custom confirmation modals instead of browser alerts

Password strength indicator

Character counters for inputs

Loading skeletons and spinners

Empty states with illustrations

🛠️ Tech Stack
React 18 - Frontend library

React Router DOM 6 - Navigation and routing

Axios - HTTP client for API requests

React Icons - Icon library

React Google OAuth - Google authentication

CSS3 - Custom styling with variables

FormData API - File uploads

📁 Project Structure
text
socialnest-frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx
│   │   └── FollowList.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── images/
│   │   ├── logo.png
│   │   └── logo_by_name.png
│   ├── services/
│   │   ├── api.js
│   │   └── PostsApi.js
│   ├── style/
│   │   ├── Home.css
│   │   ├── Login.css
│   │   ├── Register.css
│   │   ├── PostDetail.css
│   │   ├── MyPosts.css
│   │   ├── DeleteAccount.css
│   │   ├── ChangePassword.css
│   │   ├── EditProfile.css
│   │   ├── FollowList.css
│   │   └── Posts.css
│   ├── App.js
│   ├── index.js
│   └── pages/
│       ├── Home.jsx
│       ├── Login.jsx
│       ├── Register.jsx
│       ├── PostDetail.jsx
│       ├── MyPosts.jsx
│       ├── DeleteAccount.jsx
│       ├── ChangePassword.jsx
│       ├── EditProfile.jsx
│       └── Posts.jsx
├── package.json
└── README.md
🚀 Installation
Prerequisites
Node.js (v14 or higher)

npm or yarn

Backend server running (Django)

Steps
Clone the repository

bash
git clone https://github.com/yourusername/socialnest-frontend.git
cd socialnest-frontend
Install dependencies

bash
npm install
# or
yarn install
Create environment variables
Create a .env file in the root directory:

env
REACT_APP_API_URL=http://127.0.0.1:8000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
Start the development server

bash
npm start
# or
yarn start
Open the application
Navigate to http://localhost:3000

🔧 Configuration
Backend API Connection
The app connects to a Django backend at http://127.0.0.1:8000. Update the API URL in:

services/api.js

services/PostsApi.js

Google OAuth Setup
Get your Google Client ID from Google Cloud Console

Add it to your .env file

Update the redirect URIs in Google Console

🎯 Key Features Explained
🔔 Toast Notification System
All pages use a consistent toast notification system:

javascript
const showToast = (message, type = 'info', duration = 4000) => {
  // Success (green), Error (red), Warning (orange), Info (purple)
};
📸 Image Upload
Drag & drop support

Image preview before upload

Size validation (max 10MB)

Type validation (JPEG, PNG, GIF, WebP)

Automatic cleanup of blob URLs

🎨 Theme Variables
css
:root {
  --primary-purple: #8b5cf6;
  --primary-pink: #ec4899;
  --bg-gradient: linear-gradient(135deg, #1a0b2e, #0f172a, #1e0b30);
  --bg-card: rgba(30, 41, 59, 0.8);
  --text-white: #ffffff;
  --text-gray: #94a3b8;
  --border-color: rgba(255, 255, 255, 0.1);
}
📱 Responsive Breakpoints
Mobile: < 768px

Tablet: 768px - 1024px

Desktop: > 1024px

🧪 Testing
Run the test suite:

bash
npm test
🚢 Deployment
Build for production
bash
npm run build
Deploy to hosting services
Vercel: vercel --prod

Netlify: Drag build folder to Netlify

GitHub Pages: npm run deploy

📦 Dependencies
json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.0",
    "react-icons": "^4.8.0",
    "@react-oauth/google": "^0.11.0"
  }
}
🎯 Core Components
AuthContext.jsx
Manages authentication state, provides login/logout/register functions, and handles token storage.

ImageUploader.jsx
Reusable component for image upload with preview, validation, and drag & drop.

FollowList.jsx
Modal component for displaying followers/following lists with search and follow actions.

🎨 Design System
Colors
Primary: Purple (#8b5cf6)

Secondary: Pink (#ec4899)

Accent: Blue (#38bdf8)

Background: Dark purple gradient

Text: White and light gray

Error: Red (#ef4444)

Success: Green (#10b981)

Warning: Orange (#f59e0b)

Typography
Font Family: 'Inter', 'Poppins', sans-serif

Headings: 600-700 weight

Body: 400-500 weight

Small text: 12-13px

Components
Cards: Glassmorphism with 16px border radius

Buttons: Gradient backgrounds with hover effects

Inputs: Glass effect with focus glow

Modals: Blur backdrop with slide animations

🔒 Security Features
JWT token authentication

Password strength validation

Secure password change flow

Account deletion with password confirmation

Protected routes

Input sanitization

XSS protection

📱 Mobile Features
Slide-out menu for navigation

Bottom sheet for follow suggestions

Touch-optimized buttons (44px minimum)

Swipe gestures for modals

Mobile-optimized layouts

🎭 Animations
Fade in/out for toasts and modals

Slide up for mobile panels

Hover lift for cards

Pulse for notifications

Spin for loading states

Shake for error inputs

🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License.

👥 Authors
Your Name - Initial work

🙏 Acknowledgments
Design inspiration from Instagram, X (Twitter), and Threads

Icons from React Icons

Google OAuth integration

📞 Support
For support, email support@socialnest.com or open an issue in the repository.

Made with ❤️ by the SocialNest Team
