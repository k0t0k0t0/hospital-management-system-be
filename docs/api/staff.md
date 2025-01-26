# Staff API Documentation

## Endpoints

### Get All Staff
```http
GET /staff
```

### Get All Doctors
```http
GET /staff/doctors
```

### Create Staff Member
```http
POST /staff
```

**Request Body (Doctor)**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "contactNumber": "string",
  "dateOfBirth": "string",
  "gender": "male" | "female" | "other",
  "address": "string",
  "employeeId": "string",
  "department": "string",
  "role": "doctor",
  "specialization": "string",
  "availability": [
    {
      "day": "monday",
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ],
  "licenseNumber": "string"
} 