import { z } from "@/common/utils/zodExtensions";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import express, { type Router } from "express";

import { createApiResponse } from "@/api-docs/openAPIResponseBuilders";
import {
  AdminStaffSchema,
  CreateAdminStaffSchema,
  CreateDoctorSchema,
  CreateEmergencyCaseSchema,
  CreateEmergencyTeamMemberSchema,
  CreateLabTechnicianSchema,
  CreateLabTestSchema,
  CreateNurseSchema,
  DoctorScheduleSchema,
  DoctorSchema,
  EmergencyCaseSchema,
  EmergencyTeamMemberSchema,
  GetStaffSchema,
  LabTechnicianSchema,
  LabTestSchema,
  LabTestStatusEnum,
  LabTestTypeEnum,
  MedicalStaffSchema,
  NurseSchema,
} from "@/api/staff/staffModel";
import { checkRole, verifyToken } from "@/common/middleware/authMiddleware";
import { validateRequest } from "@/common/utils/httpHandlers";
import { ExaminationSchema, ExaminationStatusEnum } from "./examModel";
import { CreateExaminationSchema } from "./examModel";
import { staffController } from "./staffController";

export const staffRegistry = new OpenAPIRegistry();
export const staffRouter: Router = express.Router();

// Register schemas
staffRegistry.register("Doctor", DoctorSchema);
staffRegistry.register("Nurse", NurseSchema);
staffRegistry.register("MedicalStaff", MedicalStaffSchema);
staffRegistry.register("AdminStaff", AdminStaffSchema);

// GET /staff
staffRegistry.registerPath({
  method: "get",
  path: "/staff",
  tags: ["Medical Staff"],
  responses: createApiResponse(
    z.array(MedicalStaffSchema),
    "Successfully retrieved all staff members"
  ),
});

staffRouter.get("/", staffController.getAllStaff);

// GET /staff/doctors
staffRegistry.registerPath({
  method: "get",
  path: "/staff/doctors",
  tags: ["Medical Staff"],
  responses: createApiResponse(
    z.array(DoctorSchema),
    "Successfully retrieved all doctors"
  ),
});

staffRouter.get(
  "/doctors",
  verifyToken,
  checkRole(["admin", "nurse"]),
  staffController.getDoctors
);

// GET /staff/nurses
staffRegistry.registerPath({
  method: "get",
  path: "/staff/nurses",
  tags: ["Medical Staff"],
  responses: createApiResponse(
    z.array(NurseSchema),
    "Successfully retrieved all nurses"
  ),
});

staffRouter.get("/nurses", staffController.getNurses);

// GET /staff/admin
staffRegistry.registerPath({
  method: "get",
  path: "/staff/admin",
  tags: ["Medical Staff"],
  responses: createApiResponse(
    z.array(AdminStaffSchema),
    "Successfully retrieved all admin staff"
  ),
});

staffRouter.get("/admin", staffController.getAdminStaff);

// GET /staff/:id
staffRegistry.registerPath({
  method: "get",
  path: "/staff/{id}",
  tags: ["Medical Staff"],
  request: { params: GetStaffSchema.shape.params },
  responses: createApiResponse(
    MedicalStaffSchema,
    "Successfully retrieved staff member"
  ),
});

staffRouter.get(
  "/:id",
  validateRequest(GetStaffSchema),
  staffController.getStaffMember
);

// POST /staff
staffRegistry.registerPath({
  method: "post",
  path: "/staff",
  tags: ["Medical Staff"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.discriminatedUnion("role", [
            CreateDoctorSchema,
            CreateNurseSchema,
            CreateAdminStaffSchema,
            CreateEmergencyTeamMemberSchema,
            CreateLabTechnicianSchema,
          ]),
        },
      },
    },
  },
  responses: createApiResponse(
    MedicalStaffSchema,
    "Successfully created staff member"
  ),
});

staffRouter.post(
  "/",
  validateRequest(
    z.object({
      body: z.discriminatedUnion("role", [
        CreateDoctorSchema,
        CreateNurseSchema,
        CreateAdminStaffSchema,
        CreateEmergencyTeamMemberSchema,
        CreateLabTechnicianSchema,
      ]),
    })
  ),
  staffController.createStaffMember
);

// PUT /staff/:id
staffRegistry.registerPath({
  method: "put",
  path: "/staff/{id}",
  tags: ["Medical Staff"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.discriminatedUnion("role", [
            CreateDoctorSchema.extend({
              role: z.literal("doctor"),
            }).partial({
              firstName: true,
              lastName: true,
              email: true,
              specialization: true,
              availability: true,
            }),
            CreateNurseSchema.extend({
              role: z.literal("nurse"),
            }).partial({
              firstName: true,
              lastName: true,
              email: true,
              shift: true,
              department: true,
            }),
          ]),
        },
      },
    },
  },
  responses: createApiResponse(
    MedicalStaffSchema,
    "Successfully updated staff member"
  ),
});

staffRouter.put(
  "/:id",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.discriminatedUnion("role", [
        CreateDoctorSchema.extend({
          role: z.literal("doctor"),
        }).partial({
          firstName: true,
          lastName: true,
          email: true,
          specialization: true,
          availability: true,
        }),
        CreateNurseSchema.extend({
          role: z.literal("nurse"),
        }).partial({
          firstName: true,
          lastName: true,
          email: true,
          shift: true,
          department: true,
        }),
      ]),
    })
  ),
  staffController.updateStaffMember
);

// DELETE /staff/:id
staffRegistry.registerPath({
  method: "delete",
  path: "/staff/{id}",
  tags: ["Medical Staff"],
  request: { params: GetStaffSchema.shape.params },
  responses: createApiResponse(z.null(), "Successfully deleted staff member"),
});

staffRouter.delete(
  "/:id",
  validateRequest(GetStaffSchema),
  staffController.deleteStaffMember
);

// GET /staff/doctors/:id/availability
staffRegistry.registerPath({
  method: "get",
  path: "/staff/doctors/{id}/availability",
  tags: ["Medical Staff"],
  request: { params: GetStaffSchema.shape.params },
  responses: createApiResponse(
    z.array(DoctorSchema.shape.availability),
    "Successfully retrieved doctor availability"
  ),
});

staffRouter.get(
  "/doctors/:id/availability",
  validateRequest(GetStaffSchema),
  staffController.getDoctorAvailability
);

// PUT /staff/doctors/:id/availability
staffRegistry.registerPath({
  method: "put",
  path: "/staff/doctors/{id}/availability",
  tags: ["Medical Staff"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ availability: DoctorSchema.shape.availability }),
        },
      },
    },
  },
  responses: createApiResponse(
    DoctorSchema,
    "Successfully updated doctor availability"
  ),
});

staffRouter.put(
  "/doctors/:id/availability",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({ availability: DoctorSchema.shape.availability }),
    })
  ),
  staffController.updateDoctorAvailability
);

// PUT /staff/nurses/:id/shift
staffRegistry.registerPath({
  method: "put",
  path: "/staff/nurses/{id}/shift",
  tags: ["Medical Staff"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({ shift: NurseSchema.shape.shift }),
        },
      },
    },
  },
  responses: createApiResponse(NurseSchema, "Successfully updated nurse shift"),
});

staffRouter.put(
  "/nurses/:id/shift",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({ shift: NurseSchema.shape.shift }),
    })
  ),
  staffController.updateNurseShift
);

// GET /staff/department/:department
staffRegistry.registerPath({
  method: "get",
  path: "/staff/department/{department}",
  tags: ["Medical Staff"],
  request: {
    params: z.object({
      department: z.string(),
    }),
  },
  responses: createApiResponse(
    z.array(MedicalStaffSchema),
    "Successfully retrieved staff by department"
  ),
});

staffRouter.get(
  "/department/:department",
  validateRequest(
    z.object({
      params: z.object({
        department: z.string(),
      }),
    })
  ),
  staffController.getStaffByDepartment
);

// PUT /staff/admin/:id/access
staffRegistry.registerPath({
  method: "put",
  path: "/staff/admin/{id}/access",
  tags: ["Administrative Staff"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            accessLevel: AdminStaffSchema.shape.accessLevel,
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    AdminStaffSchema,
    "Successfully updated admin access level"
  ),
});

staffRouter.put(
  "/admin/:id/access",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        accessLevel: AdminStaffSchema.shape.accessLevel,
      }),
    })
  ),
  staffController.updateAdminAccess
);

// PUT /staff/admin/:id/departments
staffRegistry.registerPath({
  method: "put",
  path: "/staff/admin/{id}/departments",
  tags: ["Administrative Staff"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            departments: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    AdminStaffSchema,
    "Successfully updated managed departments"
  ),
});

// PUT /staff/admin/:id/responsibilities
staffRegistry.registerPath({
  method: "put",
  path: "/staff/admin/{id}/responsibilities",
  tags: ["Administrative Staff"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            responsibilities: z.array(z.string()),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    AdminStaffSchema,
    "Successfully updated responsibilities"
  ),
});

// POST /staff/admin (create admin staff)
staffRegistry.registerPath({
  method: "post",
  path: "/staff/admin",
  tags: ["Administrative Staff"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateAdminStaffSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    AdminStaffSchema,
    "Successfully created administrative staff member"
  ),
});

staffRouter.post(
  "/admin",
  // verifyToken,
  // checkRole(["admin"]),
  validateRequest(
    z.object({
      body: CreateAdminStaffSchema,
    })
  ),
  staffController.createStaffMember
);

// GET /staff/emergency-team
staffRegistry.registerPath({
  method: "get",
  path: "/staff/emergency-team",
  tags: ["Emergency Response"],
  responses: createApiResponse(
    z.array(EmergencyTeamMemberSchema),
    "Successfully retrieved emergency team"
  ),
});

staffRouter.get("/emergency-team", staffController.getEmergencyTeam);

// GET /staff/emergency-team/available
staffRegistry.registerPath({
  method: "get",
  path: "/staff/emergency-team/available",
  tags: ["Emergency Response"],
  responses: createApiResponse(
    z.array(EmergencyTeamMemberSchema),
    "Successfully retrieved available emergency team members"
  ),
});

staffRouter.get(
  "/emergency-team/available",
  staffController.getAvailableEmergencyTeam
);

// POST /staff/emergency-cases
staffRegistry.registerPath({
  method: "post",
  path: "/staff/emergency-cases",
  tags: ["Emergency Response"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateEmergencyCaseSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    EmergencyCaseSchema,
    "Successfully created emergency case"
  ),
});

staffRouter.post(
  "/emergency-cases",
  validateRequest(
    z.object({
      body: CreateEmergencyCaseSchema,
    })
  ),
  staffController.createEmergencyCase
);

// PUT /staff/emergency-cases/:id/status
staffRegistry.registerPath({
  method: "put",
  path: "/staff/emergency-cases/{id}/status",
  tags: ["Emergency Response"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: EmergencyCaseSchema.shape.status,
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    EmergencyCaseSchema,
    "Successfully updated emergency case status"
  ),
});

staffRouter.put(
  "/emergency-cases/:id/status",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        status: EmergencyCaseSchema.shape.status,
      }),
    })
  ),
  staffController.updateEmergencyCaseStatus
);

// PUT /staff/emergency-cases/:id/team
staffRegistry.registerPath({
  method: "put",
  path: "/staff/emergency-cases/{id}/team",
  tags: ["Emergency Response"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            teamMemberIds: z.array(z.number()),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    EmergencyCaseSchema,
    "Successfully reassigned emergency team"
  ),
});

staffRouter.put(
  "/emergency-cases/:id/team",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        teamMemberIds: z.array(z.number()),
      }),
    })
  ),
  staffController.reassignEmergencyTeam
);

// GET /staff/emergency-cases/active
staffRegistry.registerPath({
  method: "get",
  path: "/staff/emergency-cases/active",
  tags: ["Emergency Response"],
  responses: createApiResponse(
    z.array(EmergencyCaseSchema),
    "Successfully retrieved active emergency cases"
  ),
});

staffRouter.get(
  "/emergency-cases/active",
  staffController.getActiveEmergencyCases
);

// PUT /staff/emergency-team/:id/status
staffRegistry.registerPath({
  method: "put",
  path: "/staff/emergency-team/{id}/status",
  tags: ["Emergency Response"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            activeShift: z.boolean(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    EmergencyTeamMemberSchema,
    "Successfully updated emergency team member status"
  ),
});

staffRouter.put(
  "/emergency-team/:id/status",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        activeShift: z.boolean(),
      }),
    })
  ),
  staffController.updateEmergencyTeamMemberStatus
);

// GET /staff/lab-technicians
staffRegistry.registerPath({
  method: "get",
  path: "/staff/lab-technicians",
  tags: ["Laboratory"],
  responses: createApiResponse(
    z.array(LabTechnicianSchema),
    "Successfully retrieved lab technicians"
  ),
});

staffRouter.get("/lab-technicians", staffController.getLabTechnicians);

// GET /staff/lab-technicians/available/:testType
staffRegistry.registerPath({
  method: "get",
  path: "/staff/lab-technicians/available/{testType}",
  tags: ["Laboratory"],
  request: {
    params: z.object({
      testType: LabTestTypeEnum,
    }),
  },
  responses: createApiResponse(
    z.array(LabTechnicianSchema),
    "Successfully retrieved available lab technicians"
  ),
});

staffRouter.get(
  "/lab-technicians/available/:testType",
  validateRequest(
    z.object({
      params: z.object({
        testType: LabTestTypeEnum,
      }),
    })
  ),
  staffController.getAvailableLabTechnicians
);

// POST /staff/lab-tests
staffRegistry.registerPath({
  method: "post",
  path: "/staff/lab-tests",
  tags: ["Laboratory"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateLabTestSchema,
        },
      },
    },
  },
  responses: createApiResponse(LabTestSchema, "Successfully created lab test"),
});

staffRouter.post(
  "/lab-tests",
  validateRequest(
    z.object({
      body: CreateLabTestSchema,
    })
  ),
  staffController.createLabTest
);

// PUT /staff/lab-tests/:id/status
staffRegistry.registerPath({
  method: "put",
  path: "/staff/lab-tests/{id}/status",
  tags: ["Laboratory"],
  request: {
    params: GetStaffSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: LabTestStatusEnum,
            results: LabTestSchema.shape.results.optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    LabTestSchema,
    "Successfully updated lab test status"
  ),
});

staffRouter.put(
  "/lab-tests/:id/status",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        status: LabTestStatusEnum,
        results: LabTestSchema.shape.results.optional(),
      }),
    })
  ),
  staffController.updateLabTestStatus
);

// PUT /staff/lab-tests/:id/technician
staffRegistry.registerPath({
  method: "put",
  path: "/staff/lab-tests/{id}/technician",
  tags: ["Laboratory"],
  request: {
    params: GetStaffSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            technicianId: z.number(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    LabTestSchema,
    "Successfully reassigned lab technician"
  ),
});

staffRouter.put(
  "/lab-tests/:id/technician",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        technicianId: z.number(),
      }),
    })
  ),
  staffController.reassignLabTechnician
);

// GET /staff/lab-tests/patient/:patientId
staffRegistry.registerPath({
  method: "get",
  path: "/staff/lab-tests/patient/{patientId}",
  tags: ["Laboratory"],
  request: {
    params: z.object({
      patientId: z.string(),
    }),
  },
  responses: createApiResponse(
    z.array(LabTestSchema),
    "Successfully retrieved patient lab tests"
  ),
});

staffRouter.get(
  "/lab-tests/patient/:patientId",
  validateRequest(
    z.object({
      params: z.object({
        patientId: z.string(),
      }),
    })
  ),
  staffController.getPatientLabTests
);

// GET /staff/lab-tests/pending
staffRegistry.registerPath({
  method: "get",
  path: "/staff/lab-tests/pending",
  tags: ["Laboratory"],
  responses: createApiResponse(
    z.array(LabTestSchema),
    "Successfully retrieved pending lab tests"
  ),
});

staffRouter.get("/lab-tests/pending", staffController.getPendingLabTests);

// PUT /staff/lab-technicians/:id/status
staffRegistry.registerPath({
  method: "put",
  path: "/staff/lab-technicians/{id}/status",
  tags: ["Laboratory"],
  request: {
    params: GetStaffSchema.shape.params,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            activeShift: z.boolean(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    LabTechnicianSchema,
    "Successfully updated lab technician status"
  ),
});

staffRouter.put(
  "/lab-technicians/:id/status",
  validateRequest(
    z.object({
      params: GetStaffSchema.shape.params,
      body: z.object({
        activeShift: z.boolean(),
      }),
    })
  ),
  staffController.updateLabTechnicianStatus
);

// GET /staff/doctors/:id/schedule
staffRegistry.registerPath({
  method: "get",
  path: "/staff/doctors/{id}/schedule",
  tags: ["Medical Staff"],
  request: {
    params: z.object({ id: z.string() }),
    query: z.object({
      startDate: z.string(),
      endDate: z.string(),
    }),
  },
  responses: createApiResponse(
    z.array(DoctorScheduleSchema),
    "Successfully retrieved doctor schedule"
  ),
});

// GET /staff/doctors/available
staffRegistry.registerPath({
  method: "get",
  path: "/staff/doctors/available",
  tags: ["Medical Staff"],
  request: {
    query: z.object({
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      department: z.string().optional(),
      specialization: z.string().optional(),
    }),
  },
  responses: createApiResponse(
    z.array(DoctorSchema),
    "Successfully retrieved available doctors"
  ),
});

staffRouter.get(
  "/doctors/:id/schedule",
  verifyToken,
  checkRole(["doctor", "admin"]),
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      query: z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    })
  ),
  staffController.getDoctorSchedule
);

staffRouter.get(
  "/doctors/available",
  validateRequest(
    z.object({
      query: z.object({
        date: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        department: z.string().optional(),
        specialization: z.string().optional(),
      }),
    })
  ),
  staffController.getAvailableDoctors
);

// Register examination routes
staffRegistry.registerPath({
  method: "post",
  path: "/staff/examinations",
  tags: ["Medical Examinations"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateExaminationSchema,
        },
      },
    },
  },
  responses: createApiResponse(
    ExaminationSchema,
    "Successfully scheduled examination"
  ),
});

staffRouter.post(
  "/examinations",
  validateRequest(
    z.object({
      body: CreateExaminationSchema,
    })
  ),
  staffController.createExamination
);

staffRegistry.registerPath({
  method: "put",
  path: "/staff/examinations/{id}/status",
  tags: ["Medical Examinations"],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: ExaminationStatusEnum,
            results: ExaminationSchema.shape.results.optional(),
            cancelReason: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: createApiResponse(
    ExaminationSchema,
    "Successfully updated examination status"
  ),
});

staffRouter.put(
  "/examinations/:id/status",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      body: z.object({
        status: ExaminationStatusEnum,
        results: ExaminationSchema.shape.results.optional(),
        cancelReason: z.string().optional(),
      }),
    })
  ),
  staffController.updateExaminationStatus
);

staffRouter.get(
  "/doctors/:id/examinations",
  validateRequest(
    z.object({
      params: z.object({ id: z.string() }),
      query: z.object({
        startDate: z.string(),
        endDate: z.string(),
      }),
    })
  ),
  staffController.getDoctorExaminations
);

staffRouter.get(
  "/examinations/pending",
  staffController.getPendingExaminations
);
