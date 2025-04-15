# TaskSmart

A modern task management application built with Node.js, Express, and MongoDB.

## 🚀 Features

- User authentication and authorization
- Task creation, management, and tracking
- Real-time updates using Socket.IO
- Admin dashboard for user management
- Secure password handling with bcrypt
- Session-based authentication
- Logging system with Winston
- RESTful API architecture

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js
- **Real-time Communication**: Socket.IO
- **Template Engine**: EJS
- **Logging**: Winston
- **Security**: bcryptjs, express-session
- **Development**: Nodemon

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## 📦 Dependencies

The project uses the following main dependencies:

### Core Dependencies
- **express**: Web framework for Node.js
- **mongoose**: MongoDB object modeling
- **ejs**: Template engine
- **passport**: Authentication middleware
- **socket.io**: Real-time communication
- **winston**: Logging library

### Security Dependencies
- **bcryptjs**: Password hashing
- **express-session**: Session management
- **passport-local**: Local authentication strategy
- **dotenv**: Environment variable management

### Development Dependencies
- **nodemon**: Development server with auto-reload
- **morgan**: HTTP request logger

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/tasksmart.git
cd tasksmart
```

2. Install all dependencies:
```bash
# Install core dependencies
npm install express mongoose ejs passport socket.io winston

# Install security dependencies
npm install bcryptjs express-session passport-local dotenv

# Install development dependencies
npm install --save-dev nodemon morgan

# Or install all dependencies at once
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

4. Start the development server:
```bash
npm run dev
```

For production:
```bash
npm start
```

## 🎯 Usage

1. Access the application at `http://localhost:3000`
2. Create a new account or log in
3. Start managing your tasks

### Admin Features

To create an admin user:
```bash
npm run create-admin
```

## 📁 Project Structure

```
tasksmart/
├── config/         # Configuration files
├── middleware/     # Custom middleware
├── models/         # Database models
├── public/         # Static assets
├── routes/         # Route handlers
├── scripts/        # Utility scripts
├── services/       # Business logic
├── views/          # EJS templates
├── logs/           # Application logs
├── server.js       # Main application file
└── package.json    # Project dependencies
```

## 🔒 Security

- Password hashing with bcrypt
- Session-based authentication
- Protected routes
- Environment variable configuration

## 📝 Logging

The application uses Winston for logging. Logs are stored in the `logs/` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- CS50x2025
- All contributors and maintainers 