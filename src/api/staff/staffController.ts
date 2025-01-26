import type { Request, RequestHandler, Response } from "express";

import { staffService } from "@/api/staff/staffService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class StaffController {
  public getAllStaff: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await staffService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getDoctors: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await staffService.findDoctors();
    return handleServiceResponse(serviceResponse, res);
  };

  public getNurses: RequestHandler = async (_req: Request, res: Response) => {
    const serviceResponse = await staffService.findNurses();
    return handleServiceResponse(serviceResponse, res);
  };

  public getStaffMember: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await staffService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createStaffMember: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.create(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateStaffMember: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await staffService.update(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deleteStaffMember: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await staffService.delete(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public getDoctorAvailability: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await staffService.getDoctorAvailability(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateDoctorAvailability: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await staffService.updateDoctorAvailability(
      id,
      req.body.availability
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateNurseShift: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await staffService.updateNurseShift(
      id,
      req.body.shift
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getAdminStaff: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.findAdminStaff();
    return handleServiceResponse(serviceResponse, res);
  };

  public getStaffByDepartment: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const department = req.params.department;
    const serviceResponse = await staffService.findStaffByDepartment(
      department
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateAdminAccess: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { accessLevel } = req.body;
    const serviceResponse = await staffService.updateAdminAccess(
      id,
      accessLevel
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateManagedDepartments: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { departments } = req.body;
    const serviceResponse = await staffService.updateManagedDepartments(
      id,
      departments
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateResponsibilities: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { responsibilities } = req.body;
    const serviceResponse = await staffService.updateResponsibilities(
      id,
      responsibilities
    );
    return handleServiceResponse(serviceResponse, res);
  };

  // Emergency Team Controllers
  public getEmergencyTeam: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.findEmergencyTeam();
    return handleServiceResponse(serviceResponse, res);
  };

  public getAvailableEmergencyTeam: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.findAvailableEmergencyTeam();
    return handleServiceResponse(serviceResponse, res);
  };

  public createEmergencyCase: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.createEmergencyCase(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateEmergencyCaseStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const caseId = req.params.id;
    const { status } = req.body;
    const serviceResponse = await staffService.updateEmergencyCaseStatus(
      caseId,
      status
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public reassignEmergencyTeam: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const caseId = req.params.id;
    const { teamMemberIds } = req.body;
    const serviceResponse = await staffService.reassignEmergencyTeam(
      caseId,
      teamMemberIds
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getActiveEmergencyCases: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.getActiveEmergencyCases();
    return handleServiceResponse(serviceResponse, res);
  };

  public updateEmergencyTeamMemberStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const memberId = req.params.id;
    const { activeShift } = req.body;
    const serviceResponse = await staffService.updateEmergencyTeamMemberStatus(
      memberId,
      activeShift
    );
    return handleServiceResponse(serviceResponse, res);
  };

  // Lab Technician Controllers
  public getLabTechnicians: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.findLabTechnicians();
    return handleServiceResponse(serviceResponse, res);
  };

  public getAvailableLabTechnicians: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { testType } = req.params;
    const serviceResponse = await staffService.findAvailableLabTechnicians(
      testType
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public createLabTest: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.createLabTest(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateLabTestStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { status, results } = req.body;
    const serviceResponse = await staffService.updateLabTestStatus(
      id,
      status,
      results
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public reassignLabTechnician: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const testId = req.params.id;
    const { technicianId } = req.body;
    const serviceResponse = await staffService.reassignLabTechnician(
      testId,
      technicianId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getPatientLabTests: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    const serviceResponse = await staffService.getPatientLabTests(patientId);
    return handleServiceResponse(serviceResponse, res);
  };

  public getPendingLabTests: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.getPendingLabTests();
    return handleServiceResponse(serviceResponse, res);
  };

  public updateLabTechnicianStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { activeShift } = req.body;
    const serviceResponse = await staffService.updateLabTechnicianStatus(
      id,
      activeShift
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getDoctorSchedule: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const doctorId = req.params.id;
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };

    const serviceResponse = await staffService.getDoctorSchedule(
      doctorId,
      new Date(startDate),
      new Date(endDate)
    );

    return handleServiceResponse(serviceResponse, res);
  };

  public getAvailableDoctors: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const { date, startTime, endTime, department, specialization } =
      req.query as {
        date: string;
        startTime: string;
        endTime: string;
        department?: string;
        specialization?: string;
      };

    const serviceResponse = await staffService.getAvailableDoctors({
      date: new Date(date),
      startTime,
      endTime,
      department,
      specialization,
    });

    return handleServiceResponse(serviceResponse, res);
  };

  public createExamination: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.createExamination(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateExaminationStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { status, results, cancelReason } = req.body;
    const serviceResponse = await staffService.updateExaminationStatus(
      id,
      status,
      results,
      cancelReason
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getDoctorExaminations: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const doctorId = req.params.id;
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };
    const serviceResponse = await staffService.getDoctorExaminations(
      doctorId,
      new Date(startDate),
      new Date(endDate)
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getPendingExaminations: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await staffService.getPendingExaminations();
    return handleServiceResponse(serviceResponse, res);
  };
}

export const staffController = new StaffController();
