import type { Request, RequestHandler, Response } from "express";

import { patientService } from "@/api/patient/patientService";
import { handleServiceResponse } from "@/common/utils/httpHandlers";

class PatientController {
  public getAllPatients: RequestHandler = async (
    _req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.findAll();
    return handleServiceResponse(serviceResponse, res);
  };

  public getPatient: RequestHandler = async (req: Request, res: Response) => {
    const id = req.params.id;
    const serviceResponse = await patientService.findById(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createPatient: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.create(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public updatePatient: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await patientService.update(id, req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public deletePatient: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const serviceResponse = await patientService.delete(id);
    return handleServiceResponse(serviceResponse, res);
  };

  public createAppointment: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.createAppointment(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public rescheduleAppointment: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { dateTime } = req.body;
    const serviceResponse = await patientService.rescheduleAppointment(
      id,
      dateTime
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public updateAppointmentStatus: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const id = req.params.id;
    const { status, cancelReason } = req.body;
    const serviceResponse = await patientService.updateAppointmentStatus(
      id,
      status,
      cancelReason
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getPatientAppointments: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    const serviceResponse = await patientService.getPatientAppointments(
      patientId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public getUpcomingAppointments: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    const serviceResponse = await patientService.getUpcomingAppointments(
      patientId
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public createMessage: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.createMessage(req.body);
    return handleServiceResponse(serviceResponse, res);
  };

  public getPatientMessages: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    const serviceResponse = await patientService.getPatientMessages(patientId);
    return handleServiceResponse(serviceResponse, res);
  };

  public getUnreadMessages: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.patientId;
    const serviceResponse = await patientService.getUnreadMessages(patientId);
    return handleServiceResponse(serviceResponse, res);
  };

  public markMessageAsRead: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const messageId = req.params.messageId;
    const serviceResponse = await patientService.markMessageAsRead(messageId);
    return handleServiceResponse(serviceResponse, res);
  };

  public searchPatients: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const searchParams = {
      firstName: req.query.firstName as string | undefined,
      lastName: req.query.lastName as string | undefined,
      email: req.query.email as string | undefined,
      contactNumber: req.query.contactNumber as string | undefined,
    };
    const serviceResponse = await patientService.searchPatients(searchParams);
    return handleServiceResponse(serviceResponse, res);
  };

  public getEmergencyInfo: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.id;
    const serviceResponse = await patientService.getEmergencyInfo(patientId);
    return handleServiceResponse(serviceResponse, res);
  };

  public updateEmergencyContact: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const patientId = req.params.id;
    const serviceResponse = await patientService.updateEmergencyContact(
      patientId,
      req.body
    );
    return handleServiceResponse(serviceResponse, res);
  };

  public recordEmergencyVisit: RequestHandler = async (
    req: Request,
    res: Response
  ) => {
    const serviceResponse = await patientService.recordEmergencyVisit(req.body);
    return handleServiceResponse(serviceResponse, res);
  };
}

export const patientController = new PatientController();
