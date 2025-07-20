# Scheder - Schedule Blocking Management System

A comprehensive MPV solution for managing schedule blocking requests at an outpatient psychiatry clinic.

## Features

### Core Functionality
- **Schedule Blocking Requests**: Providers can submit requests to block their schedules
- **Multiple Block Types**: Support for specific time periods, full days, multiple days, and recurring blocks
- **PTO Integration**: Built-in PTO request form handling with director approval workflow
- **Email Notifications**: Automated email notifications for all stakeholders
- **Admin Dashboard**: Comprehensive admin interface for managing requests
- **Provider Portal**: Simple interface for providers to submit and track requests

### Request Types Supported
1. **Specific Time Period**: Block specific hours within a single day
2. **Full Day**: Block entire single day
3. **Multiple Days**: Block contiguous or non-contiguous days
4. **Recurring Blocks**: Weekly or monthly recurring schedule blocks

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Nodemailer** for email notifications
- **Multer** for file uploads (PTO forms)
- **Moment.js** for date/time handling
- **JWT** for authentication

### Frontend
- **React** with modern hooks
- **Material-UI** for beautiful, responsive UI
- **React Router** for navigation
- **Axios** for API communication
- **Date-fns** for date manipulation

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd scheder
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your email and other configuration
   ```

3. **Start the development servers**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# JWT Secret
JWT_SECRET=your-secret-key

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

## Usage

### For Providers
1. Navigate to the Provider Portal
2. Submit a new schedule blocking request
3. Upload PTO form if required
4. Track request status
5. Receive email notifications

### For Admin Staff
1. Access the Admin Dashboard
2. Review pending requests
3. Check provider schedules
4. Cancel/reschedule conflicting appointments
5. Approve or reject requests
6. Send clarification emails if needed

### For Directors
1. Review PTO requests
2. Sign and return PTO forms
3. Approve final requests

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Schedule Blocking Requests
- `GET /api/requests` - Get all requests
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get specific request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request

### Email Notifications
- `POST /api/notifications/send` - Send notification
- `GET /api/notifications/history` - Get notification history

### File Upload
- `POST /api/upload` - Upload PTO forms
- `GET /api/files/:filename` - Download files

## Project Structure

```
scheder/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── App.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # Data models
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── index.js
├── uploads/              # File uploads
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details 