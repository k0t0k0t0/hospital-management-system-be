# Patient API Documentation

## Endpoints

### Get All Patients
```http
GET /patients
```

**Response**
```json
{
  "success": true,
  "message": "Patients retrieved successfully",
  "responseObject": Patient[],
  "statusCode": 200
}
```

### Create Patient
```http
POST /patients
```

**Request Body**
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "2024-01-02T23:00:00.000Z",
  "gender": "male" | "female" | "other",
  "contactNumber": "string",
  "email": "string",
  "address": "string",
  "medicalHistory": ["string"],
  "preferredLanguage": "english",
  "emergencyContact": {
    "name": "string",
    "relationship": "string",
    "primaryPhone": "string",
    "secondaryPhone": "string",
    "address": "string"
  },
  "communicationPreferences": {
    "emailNotifications": true,
    "smsNotifications": true
  },
  "bloodType": "string",
  "allergies": [],
  "chronicConditions": [],
  "currentMedications": [],
  "recentProcedures": [],
  "insuranceInfo": {
    "provider": "string",
    "policyNumber": "string",
    "groupNumber": "string",
    "expirationDate": "2024-01-30T23:00:00.000Z"
  }
}
```

[Rest of patient API documentation...] 