# Scheder - Schedule Management System

A comprehensive schedule blocking management system designed for outpatient psychiatry clinics. This application streamlines the process of managing provider schedule blocking requests, PTO approvals, and administrative workflows.

## Author

**Nicolas Lescano, MD**  
Professor of Clinical Psychiatry  
University of Pennsylvania

## Features

### Role-Based Access Control
- **Provider Portal**: Submit schedule blocking requests, upload PTO forms, track request status
- **Admin Dashboard**: Review requests, manage schedules, send clarifications, approve/reject requests
- **Director Dashboard**: Final approval authority, PTO form review, comprehensive oversight

### Request Types
- **Specific Time Period**: Block specific hours on a given date
- **Full Day**: Block entire day for appointments or meetings
- **Multiple Days**: Extended time off or conference attendance
- **Recurring**: Regular weekly/monthly schedule blocks

### Workflow Management
- **Automated Email Notifications**: Real-time updates to all stakeholders
- **PTO Form Upload**: Secure document management for leave requests
- **Status Tracking**: Complete audit trail of request lifecycle
- **Conflict Resolution**: Automatic detection of scheduling conflicts

### Technical Features
- **Modern React Frontend**: Material-UI components, responsive design
- **Node.js Backend**: RESTful API with JWT authentication
- **Email Integration**: Automated notifications using Nodemailer
- **File Upload**: Secure PTO form handling with Multer
- **Role-Based Security**: JWT-based authentication and authorization

## Demo Accounts

For testing purposes, the following demo accounts are available:

- **Provider**: `provider@clinic.com` / `password`
- **Admin**: `admin@clinic.com` / `password`
- **Director**: `director@clinic.com` / `password`

## Technology Stack

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Axios for API communication
- Date-fns for date handling

### Backend
- Node.js with Express
- JWT for authentication
- Nodemailer for email notifications
- Multer for file uploads
- Express-validator for input validation

### Deployment
- **Frontend**: Vercel (free tier)
- **Backend**: Fly.io (free tier)
- **Database**: In-memory storage (can be upgraded to PostgreSQL)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lescanico/scheder.git
   cd scheder
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-secret-key-here

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build directory to `client`
3. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com/api`

### Backend (Fly.io)
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Authenticate: `flyctl auth login`
3. Deploy: `flyctl launch`
4. Set secrets: `flyctl secrets set JWT_SECRET=your-secret`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Requests
- `GET /api/requests` - Get all requests (with filters)
- `POST /api/requests` - Create new request
- `GET /api/requests/:id` - Get specific request
- `PATCH /api/requests/:id/status` - Update request status
- `DELETE /api/requests/:id` - Delete request

### File Upload
- `POST /api/upload/pto/:id` - Upload PTO form
- `GET /api/upload/:filename` - Download file

## Contributing

This project is developed for clinical use. For academic or research purposes, please contact the author.

## License

MIT License - Copyright (c) 2024 Nicolas Lescano, MD

## Support

For technical support or questions about implementation in clinical settings, please contact the author.

---

**Developed for operational workflow optimization at the University of Pennsylvania Department of Psychiatry.** 