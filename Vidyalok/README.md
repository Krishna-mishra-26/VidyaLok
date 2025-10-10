# VidyaLok - AI Powered Smart Library Management System

![VidyaLok Logo](public/vidyalok-banner.png)

VidyaLok is a comprehensive AI-Powered Smart Library Ecosystem Management and Engagement Platform designed specifically for APSIT (A.P. Shah Institute of Technology). This system revolutionizes traditional library management with intelligent automation, real-time tracking, and personalized learning experiences.

## 🚀 Features

### For Students

- **🪪 Student ID-Based Entry System** - Seamless entry/exit with ID scanning and real-time tracking
- **📚 Smart Book Search & Borrow System** - Advanced search, availability checking, and borrowing system
- **🧾 Borrowing History & Due Reminders** - Personalized dashboard with due dates and return alerts
- **🧠 AI-Based Book Recommendations** - Personalized book suggestions based on branch, semester, and interests
- **🪑 Live Seat Availability Indicator** - Real-time seat availability and occupancy monitoring
- **📝 Feedback/Complaint System** - Submit feedback and track complaint resolution
- **📖 Entry/Exit Log Viewer** - View personal library visit history

### For Administrators

- **🧾 Book Inventory Management** - Complete control over library catalog, stock management, and condition tracking
- **⏱ Real-Time Entry/Exit Logs** - Monitor which students entered, when, and duration of visits
- **📊 Admin Analytics Dashboard** - Comprehensive insights into book demand, peak usage hours, and active students
- **📤 Borrow & Return Management** - Efficient handling of all borrowing transactions
- **🔔 Overdue Alerts & Fine Reports** - Automated notifications and fine management
- **📧 Email Alert System** - Automated email notifications to borrowers
- **📄 Usage Report Generator** - Weekly/monthly PDF reports
- **🚨 Emergency Broadcast System** - Instant communication for announcements and emergencies
- **📈 Department-wise Analytics** - Book usage statistics by department

## 🛠 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Prisma ORM
- **UI Components**: Tailwind CSS, Radix UI
- **Charts & Analytics**: Recharts
- **PDF Generation**: jsPDF, html2canvas
- **Authentication**: NextAuth.js
- **Icons**: Lucide React

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18.x or later
- MongoDB database (local or cloud instance)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vidyalok-lms.git
cd vidyalok-lms
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory and add your configuration:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/vidyalok?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
JWT_SECRET="your-jwt-secret-key-here"
ENCRYPTION_KEY="your-encryption-key-here"
```

> ℹ️ **Prisma engine note:** This project talks directly to MongoDB and does **not** use Prisma Accelerate/Data Proxy. Double-check that `PRISMA_CLIENT_ENGINE_TYPE` is unset (or set to `library`) and avoid `prisma://` URLs in your environment. The provided client bootstrap will automatically fall back to the native engine when misconfigured.

### 4. Database Setup

Generate Prisma client and sync the database schema:

```bash
npx prisma generate
npx prisma db push
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔐 Demo Credentials

### Student Login
- **Student ID**: STU240001
- **Password**: demo123

### Admin Login
- **Email**: admin@vidyalok.com
- **Password**: admin123

## 📁 Project Structure

```
vidyalok-lms/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── student/           # Student dashboard pages
│   │   ├── api/               # API routes
│   │   └── login/             # Authentication pages
│   ├── components/            # Reusable React components
│   │   ├── ui/                # Base UI components
│   │   └── layout/            # Layout components
│   ├── lib/                   # Utility libraries
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
└── ...config files
```

## 🔧 Key Components

### Database Models

- **User**: Student and admin management
- **Book**: Complete book inventory
- **Borrowing**: Transaction tracking
- **EntryLog**: Real-time entry/exit monitoring
- **SeatAvailability**: Live seat tracking
- **Feedback**: User feedback system
- **Broadcast**: Emergency alert system
- **Analytics**: System usage statistics

### API Endpoints

- `/api/dashboard/stats` - Dashboard statistics
- `/api/books` - Book management
- `/api/borrowings` - Borrowing operations
- `/api/users` - User management
- `/api/entry-logs` - Entry/exit tracking
- `/api/feedback` - Feedback system
- `/api/analytics` - Analytics data

## 🎨 UI/UX Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Mode** - User preference-based theming
- **Professional Interface** - Clean, modern design optimized for educational institutions
- **Real-time Updates** - Live data synchronization
- **Accessibility** - WCAG compliant interface

## 📊 Analytics & Reporting

- Real-time dashboard with key metrics
- Department-wise usage statistics
- Peak hours analysis
- Popular books tracking
- User engagement metrics
- Automated PDF report generation

## 🔒 Security Features

- Secure authentication and authorization
- Role-based access control (Student/Admin)
- Data encryption for sensitive information
- Session management
- API rate limiting
- SQL injection protection

## 🚀 Deployment

### Using Vercel (Recommended)

```bash
npm run build
vercel --prod
```

### Using Docker

```bash
docker build -t vidyalok-lms .
docker run -p 3000:3000 vidyalok-lms
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📚 API Documentation

Detailed API documentation is available at `/api/docs` when running the development server.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏫 About APSIT

This system is specifically designed for A.P. Shah Institute of Technology, enhancing the library experience for students and providing powerful management tools for administrators.

## 📞 Support

For support and queries:

- Email: support@vidyalok.com
- Documentation: [docs.vidyalok.com](https://docs.vidyalok.com)
- Issues: [GitHub Issues](https://github.com/yourusername/vidyalok-lms/issues)

## 🙏 Acknowledgments

- APSIT for providing the opportunity to develop this system
- Next.js team for the excellent framework
- Prisma team for the amazing ORM
- All contributors and testers

---

**Built with ❤️ for APSIT by the VidyaLok Team**
