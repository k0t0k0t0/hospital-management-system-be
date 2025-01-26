# Patient Model

## Schema
```typescript
{
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  address: String,
  medicalHistory: [String],
  preferredLanguage: {
    type: String,
    default: "english"
  },
  emergencyContact: {
    name: String,
    relationship: String,
    primaryPhone: String,
    secondaryPhone: String,
    address: String
  },
  communicationPreferences: {
    emailNotifications: Boolean,
    smsNotifications: Boolean
  },
  bloodType: String,
  allergies: [String],
  chronicConditions: [String],
  currentMedications: [String],
  recentProcedures: [String],
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expirationDate: Date
  }
}
```

## Indexes
- email (unique)
- firstName, lastName (compound)
- contactNumber 