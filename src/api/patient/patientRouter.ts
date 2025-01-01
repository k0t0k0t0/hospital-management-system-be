import { z } from "@/common/utils/zodExtensions";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  AppointmentSchema,
  CreateAppointmentSchema,
  CreateMessageSchema,
  CreatePatientSchema,
  MessageSchema,
  PatientSchema,
} from "@/api/patient/patientModel";
import { validateRequest } from "@/common/utils/httpHandlers";
import { patientController } from "./patientController";

export const patientRegistry = new OpenAPIRegistry();
export const patientRouter: Router = express.Router();

// Register schemas
patientRegistry.register("Patient", PatientSchema);
patientRegistry.register("Appointment", AppointmentSchema);
patientRegistry.register("Message", MessageSchema);

// Add these registry entries before the existing routes
patientRegistry.registerPath({
  method: "get",
  path: "/patients",
  tags: ["Patients"],
  responses: createApiResponse(z.array(PatientSchema), "Successfully retrieved all patients"),
});

patientRegistry.registerPath({
  method: "get",
  path: "/patients/{id}",
  tags: ["Patients"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(PatientSchema, "Successfully retrieved patient"),
});

patientRegistry.registerPath({
  method: "post",
  path: "/patients",
  tags: ["Patients"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePatientSchema,
        },
      },
    },
  },
  responses: createApiResponse(PatientSchema, "Successfully created patient"),
});

patientRegistry.registerPath({
  method: "put",
  path: "/patients/{id}",
  tags: ["Patients"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: PatientSchema.partial(),
        },
      },
    },
  },
  responses: createApiResponse(PatientSchema, "Successfully updated patient"),
});

patientRegistry.registerPath({
  method: "delete",
  path: "/patients/{id}",
  tags: ["Patients"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(z.object({ success: z.boolean() }), "Successfully deleted patient"),
});

// Add this to your registry
patientRegistry.registerPath({
  method: "get",
  path: "/patients/search",
  tags: ["Patients"],
  request: {
    query: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      email: z.string().optional(),
      contactNumber: z.string().optional(),
    }),
  },
  responses: createApiResponse(z.array(PatientSchema), "Successfully searched patients"),
});

// Existing patient routes
patientRouter.get("/", patientController.getAllPatients);
patientRouter.get(
  "/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
    }),
  ),
  patientController.getPatient,
);
patientRouter.post(
  "/",
  validateRequest(
    z.object({
      body: CreatePatientSchema,
    }),
  ),
  patientController.createPatient,
);
patientRouter.put(
  "/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: PatientSchema.partial(),
    }),
  ),
  patientController.updatePatient,
);
patientRouter.delete(
  "/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
    }),
  ),
  patientController.deletePatient,
);

// Add this route before your other routes
patientRouter.get(
  "/search",
  validateRequest(
    z.object({
      query: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        contactNumber: z.string().optional(),
      }),
    }),
  ),
  patientController.searchPatients,
);

// Appointment routes
patientRegistry.registerPath({
  method: "post",
  path: "/patients/appointments",
  tags: ["Patient Appointments"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateAppointmentSchema,
        },
      },
    },
  },
  responses: createApiResponse(AppointmentSchema, "Successfully created appointment"),
});

patientRegistry.registerPath({
  method: "put",
  path: "/patients/appointments/{id}/reschedule",
  tags: ["Patient Appointments"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            dateTime: z.date(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(AppointmentSchema, "Successfully rescheduled appointment"),
});

patientRouter.post(
  "/appointments",
  validateRequest(
    z.object({
      body: CreateAppointmentSchema,
    }),
  ),
  patientController.createAppointment,
);

patientRouter.put(
  "/appointments/:id/reschedule",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        dateTime: z.date(),
      }),
    }),
  ),
  patientController.rescheduleAppointment,
);

patientRegistry.registerPath({
  method: "put",
  path: "/patients/appointments/{id}/status",
  tags: ["Patient Appointments"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: AppointmentSchema.shape.status,
            cancelReason: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(AppointmentSchema, "Successfully updated appointment status"),
});

patientRouter.put(
  "/appointments/:id/status",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        status: AppointmentSchema.shape.status,
        cancelReason: z.string().optional(),
      }),
    }),
  ),
  patientController.updateAppointmentStatus,
);

patientRegistry.registerPath({
  method: "get",
  path: "/patients/{patientId}/appointments",
  tags: ["Patient Appointments"],
  request: { params: z.object({ patientId: z.string() }) },
  responses: createApiResponse(z.array(AppointmentSchema), "Successfully retrieved patient appointments"),
});

patientRouter.get(
  "/:patientId/appointments",
  validateRequest(
    z.object({
      params: z.object({ patientId: z.string() }),
    }),
  ),
  patientController.getPatientAppointments,
);

patientRegistry.registerPath({
  method: "get",
  path: "/patients/{patientId}/appointments/upcoming",
  tags: ["Patient Appointments"],
  request: { params: z.object({ patientId: z.string() }) },
  responses: createApiResponse(z.array(AppointmentSchema), "Successfully retrieved upcoming appointments"),
});

patientRouter.get(
  "/:patientId/appointments/upcoming",
  validateRequest(
    z.object({
      params: z.object({ patientId: z.string() }),
    }),
  ),
  patientController.getUpcomingAppointments,
);

// Message routes
patientRegistry.registerPath({
  method: "post",
  path: "/patients/messages",
  tags: ["Patient Messages"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateMessageSchema,
        },
      },
    },
  },
  responses: createApiResponse(MessageSchema, "Successfully sent message"),
});

patientRouter.post(
  "/messages",
  validateRequest(
    z.object({
      body: CreateMessageSchema,
    }),
  ),
  patientController.createMessage,
);

patientRegistry.registerPath({
  method: "get",
  path: "/patients/{patientId}/messages",
  tags: ["Patient Messages"],
  request: { params: z.object({ patientId: z.string() }) },
  responses: createApiResponse(z.array(MessageSchema), "Successfully retrieved patient messages"),
});

patientRouter.get(
  "/:patientId/messages",
  validateRequest(
    z.object({
      params: z.object({ patientId: z.string() }),
    }),
  ),
  patientController.getPatientMessages,
);

patientRegistry.registerPath({
  method: "get",
  path: "/patients/{patientId}/messages/unread",
  tags: ["Patient Messages"],
  request: { params: z.object({ patientId: z.string() }) },
  responses: createApiResponse(z.array(MessageSchema), "Successfully retrieved unread messages"),
});

patientRouter.get(
  "/:patientId/messages/unread",
  validateRequest(
    z.object({
      params: z.object({ patientId: z.string() }),
    }),
  ),
  patientController.getUnreadMessages,
);

patientRegistry.registerPath({
  method: "put",
  path: "/patients/messages/{messageId}/read",
  tags: ["Patient Messages"],
  request: { params: z.object({ messageId: z.string() }) },
  responses: createApiResponse(MessageSchema, "Successfully marked message as read"),
});

patientRouter.put(
  "/messages/:messageId/read",
  validateRequest(
    z.object({
      params: z.object({ messageId: z.string() }),
    }),
  ),
  patientController.markMessageAsRead,
);

const EmergencyContactSchema = z.object({
  name: z.string(),
  relationship: z.string(),
  primaryPhone: z.string(),
  secondaryPhone: z.string().optional(),
  address: z.string(),
});

const EmergencyVisitSchema = z.object({
  patientId: z.number(),
  severity: z.enum(["CRITICAL", "SEVERE", "MODERATE", "MILD"]),
  description: z.string(),
  location: z.string(),
  symptoms: z.array(z.string()),
  vitalSigns: z.object({
    bloodPressure: z.string(),
    heartRate: z.number(),
    temperature: z.number(),
    oxygenSaturation: z.number(),
  }),
  attendingStaffId: z.number(),
});

// Add this with your other schema definitions
const PatientEmergencySchema = z.object({
  patientInfo: z.object({
    id: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    dateOfBirth: z.date(),
    bloodType: z.string().optional(),
    allergies: z.array(z.string()).optional(),
  }),
  emergencyContact: EmergencyContactSchema,
  medicalHistory: z.object({
    chronicConditions: z.array(z.string()).optional(),
    currentMedications: z.array(z.string()).optional(),
    recentProcedures: z.array(z.string()).optional(),
  }),
  insuranceInfo: z
    .object({
      provider: z.string(),
      policyNumber: z.string(),
      groupNumber: z.string().optional(),
      expirationDate: z.date().optional(),
    })
    .optional(),
  lastEmergencyVisit: z
    .object({
      date: z.date(),
      reason: z.string(),
      outcome: z.string(),
    })
    .optional(),
});

// Register emergency routes
patientRegistry.registerPath({
  method: "get",
  path: "/patients/{id}/emergency",
  tags: ["Emergency"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: createApiResponse(PatientEmergencySchema, "Successfully retrieved emergency information"),
});

patientRegistry.registerPath({
  method: "put",
  path: "/patients/{id}/emergency-contact",
  tags: ["Emergency"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: EmergencyContactSchema,
        },
      },
    },
  },
  responses: createApiResponse(PatientSchema, "Successfully updated emergency contact"),
});

patientRegistry.registerPath({
  method: "post",
  path: "/patients/emergency-visits",
  tags: ["Emergency"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: EmergencyVisitSchema,
        },
      },
    },
  },
  responses: createApiResponse(EmergencyVisitSchema, "Successfully recorded emergency visit"),
});

// Add the routes to the router
patientRouter.get(
  "/:id/emergency",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
    }),
  ),
  patientController.getEmergencyInfo,
);

patientRouter.put(
  "/:id/emergency-contact",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: EmergencyContactSchema,
    }),
  ),
  patientController.updateEmergencyContact,
);

patientRouter.post(
  "/emergency-visits",
  validateRequest(
    z.object({
      body: EmergencyVisitSchema,
    }),
  ),
  patientController.recordEmergencyVisit,
);
