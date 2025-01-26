# Hospital Management System (HMS)

A modern, full-stack Hospital Management System built with React and Node.js, designed to streamline healthcare facility operations.

## Features

### Admin Portal
- **Doctor Management**
  - Add, edit, and remove doctors
  - Manage doctor schedules and availability
  - Track specializations and departments
  - Handle doctor credentials and licensing

- **Patient Management**
  - Complete patient registration and profile management
  - Medical history tracking
  - Emergency contact information
  - Insurance details
  - Communication preferences

### Key Features
- Responsive Material-UI design
- Real-time data updates
- Secure authentication
- Form validation
- Modal-based editing interfaces

## Technology Stack

### Frontend
- React.js
- Material-UI (MUI)
- Axios for API communication
- React Hooks for state management

### Backend
- Node.js
- Express.js
- MongoDB
- RESTful API architecture

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/hospital-management-system.git
cd hospital-management-system
```

2. Install dependencies
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Environment Setup
Create a `.env` file in the backend directory:
```env
PORT=8080
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

4. Start the application
```bash
# Start backend server
cd backend
npm start

# Start frontend development server
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Doctors
- `GET /staff/doctors` - Get all doctors
- `POST /staff` - Add new doctor
- `PUT /staff/:id` - Update doctor
- `DELETE /staff/:id` - Remove doctor

### Patients
- `GET /patients` - Get all patients
- `POST /patients` - Add new patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Remove patient

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Material-UI for the beautiful components
- The React community for excellent documentation
- All contributors who help improve this system

