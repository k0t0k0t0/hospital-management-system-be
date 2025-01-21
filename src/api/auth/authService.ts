import { ServiceResponse } from "@/common/models/serviceResponse";
import { env } from "@/common/utils/envConfig";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { Models } from "../staff/staffSchema";

export class AuthService {
  private readonly ROLE_MODEL_MAP = {
    doctor: Models.Doctor,
    nurse: Models.Nurse,
    admin: Models.AdminStaff,
    emergency: Models.EmergencyTeamMember,
    lab_technician: Models.LabTechnician,
  };

  async login(email: string, password: string, role: string) {
    try {
      const Model = this.ROLE_MODEL_MAP[role as keyof typeof this.ROLE_MODEL_MAP];

      if (!Model) {
        return ServiceResponse.failure("Invalid role specified", null, StatusCodes.BAD_REQUEST);
      }

      const user = await Model.findOne({ email }).select("+password").lean();

      if (!user) {
        return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return ServiceResponse.failure("Invalid email or password", null, StatusCodes.UNAUTHORIZED);
      }

      const token = jwt.sign({ id: user._id, email: user.email, role }, env.JWT_SECRET, { expiresIn: "24h" });

      const { password: _, ...userWithoutPassword } = user;

      return ServiceResponse.success("Login successful", {
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      return ServiceResponse.failure("Login failed", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async requestPasswordReset(email: string, role: string) {
    try {
      const Model = this.ROLE_MODEL_MAP[role as keyof typeof this.ROLE_MODEL_MAP];

      if (!Model) {
        return ServiceResponse.failure("Invalid role specified", null, StatusCodes.BAD_REQUEST);
      }

      const user = await Model.findOne({ email }).lean();
      if (!user) {
        return ServiceResponse.failure("If email exists, reset instructions will be sent", null, StatusCodes.OK);
      }

      // Generate reset token
      const resetToken = jwt.sign({ id: user._id, email: user.email, role }, env.JWT_SECRET, { expiresIn: "1h" });

      // In a real application, you would send an email here
      // For now, we'll just return the token
      return ServiceResponse.success("Reset instructions sent", { resetToken });
    } catch (error) {
      return ServiceResponse.failure("Failed to process reset request", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      const Model = this.ROLE_MODEL_MAP[decoded.role as keyof typeof this.ROLE_MODEL_MAP];
      if (!Model) {
        return ServiceResponse.failure("Invalid reset token", null, StatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await this.hashPassword(newPassword);
      const updated = await Model.findByIdAndUpdate(decoded.id, { password: hashedPassword }, { new: true });

      if (!updated) {
        return ServiceResponse.failure("Failed to reset password", null, StatusCodes.NOT_FOUND);
      }

      return ServiceResponse.success("Password reset successful", null);
    } catch (error) {
      return ServiceResponse.failure("Invalid or expired reset token", null, StatusCodes.BAD_REQUEST);
    }
  }
}

export const authService = new AuthService();
