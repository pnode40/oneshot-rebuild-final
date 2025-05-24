import crypto from 'crypto';
import { db } from '../db/client';
import { athleteProfiles } from '../db/schema/athleteProfiles';
import { eq } from 'drizzle-orm';

// SMS Service interface (Twilio integration)
interface SMSService {
  sendVerificationSMS(phoneNumber: string, message: string): Promise<boolean>;
}

// Mock SMS service (replace with actual Twilio implementation)
class MockSMSService implements SMSService {
  async sendVerificationSMS(phoneNumber: string, message: string): Promise<boolean> {
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return true;
  }
}

// Coach verification data
interface CoachVerificationData {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  athleteUserId: number;
  verificationToken?: string;
}

// Player metrics that coach can verify/update
interface AthleteMetrics {
  // Speed & Agility
  verticalLeap?: number;
  broadJump?: number;
  proAgility?: number;
  
  // Strength & Power
  bench?: number;
  squat?: number;
  deadlift?: number;
}

class CoachVerificationService {
  private smsService: SMSService;
  
  constructor() {
    // In production, use actual Twilio service
    this.smsService = new MockSMSService();
  }
  
  /**
   * Generate a secure verification token
   */
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * Initiate coach verification process
   */
  async initiateCoachVerification(coachData: CoachVerificationData): Promise<{
    success: boolean;
    verificationToken?: string;
    error?: string;
  }> {
    try {
      // Generate verification token
      const verificationToken = this.generateVerificationToken();
      
      // Update athlete profile with coach info and token
      await db.update(athleteProfiles)
        .set({
          coachFirstName: coachData.firstName,
          coachLastName: coachData.lastName,
          coachMobile: coachData.mobile,
          coachEmail: coachData.email,
          coachVerified: false,
          coachVerificationToken: verificationToken,
          updatedAt: new Date()
        })
        .where(eq(athleteProfiles.userId, coachData.athleteUserId));
      
      // Get athlete info for personalized message
      const athlete = await db.select({
        firstName: athleteProfiles.firstName,
        lastName: athleteProfiles.lastName,
        customUrlSlug: athleteProfiles.customUrlSlug
      })
      .from(athleteProfiles)
      .where(eq(athleteProfiles.userId, coachData.athleteUserId))
      .limit(1);
      
      if (athlete.length === 0) {
        return { success: false, error: 'Athlete not found' };
      }
      
      const athleteName = `${athlete[0].firstName} ${athlete[0].lastName}`;
      
      // Create verification URL
      const verificationUrl = `${process.env.CLIENT_URL}/coach-verify/${verificationToken}`;
      
      // Send SMS to coach
      const smsMessage = `Hi Coach! ${athleteName} has added you as their coach on OneShot. Please verify your contact info: ${verificationUrl}`;
      
      const smsSent = await this.smsService.sendVerificationSMS(coachData.mobile, smsMessage);
      
      if (!smsSent) {
        return { success: false, error: 'Failed to send verification SMS' };
      }
      
      return { 
        success: true, 
        verificationToken 
      };
      
    } catch (error) {
      console.error('Coach verification initiation error:', error);
      return { success: false, error: 'Verification initiation failed' };
    }
  }
  
  /**
   * Get coach verification details by token
   */
  async getVerificationDetails(token: string): Promise<{
    success: boolean;
    data?: {
      athleteName: string;
      coachFirstName: string;
      coachLastName: string;
      coachMobile: string;
      coachEmail: string;
      currentMetrics: AthleteMetrics;
      alreadyVerified: boolean;
    };
    error?: string;
  }> {
    try {
      const result = await db.select({
        athleteFirstName: athleteProfiles.firstName,
        athleteLastName: athleteProfiles.lastName,
        coachFirstName: athleteProfiles.coachFirstName,
        coachLastName: athleteProfiles.coachLastName,
        coachMobile: athleteProfiles.coachMobile,
        coachEmail: athleteProfiles.coachEmail,
        coachVerified: athleteProfiles.coachVerified,
        // Performance metrics
        verticalLeap: athleteProfiles.verticalLeap,
        broadJump: athleteProfiles.broadJump,
        proAgility: athleteProfiles.proAgility,
        bench: athleteProfiles.benchPressMax,
        squat: athleteProfiles.squat,
        deadlift: athleteProfiles.deadlift
      })
      .from(athleteProfiles)
      .where(eq(athleteProfiles.coachVerificationToken, token))
      .limit(1);
      
      if (result.length === 0) {
        return { success: false, error: 'Invalid verification token' };
      }
      
      const data = result[0];
      
      return {
        success: true,
        data: {
          athleteName: `${data.athleteFirstName} ${data.athleteLastName}`,
          coachFirstName: data.coachFirstName || '',
          coachLastName: data.coachLastName || '',
          coachMobile: data.coachMobile || '',
          coachEmail: data.coachEmail || '',
          currentMetrics: {
            verticalLeap: data.verticalLeap ? Number(data.verticalLeap) : undefined,
            broadJump: data.broadJump ? Number(data.broadJump) : undefined,
            proAgility: data.proAgility ? Number(data.proAgility) : undefined,
            bench: data.bench || undefined,
            squat: data.squat || undefined,
            deadlift: data.deadlift || undefined
          },
          alreadyVerified: data.coachVerified || false
        }
      };
      
    } catch (error) {
      console.error('Get verification details error:', error);
      return { success: false, error: 'Failed to get verification details' };
    }
  }
  
  /**
   * Complete coach verification
   */
  async completeVerification(token: string, updates: {
    contactConfirmed: boolean;
    updatedMetrics?: AthleteMetrics;
  }): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Prepare update data
      const updateData: any = {
        coachVerified: updates.contactConfirmed,
        updatedAt: new Date()
      };
      
      // If coach provided updated metrics, include them
      if (updates.updatedMetrics) {
        const metrics = updates.updatedMetrics;
        if (metrics.verticalLeap !== undefined) updateData.verticalLeap = metrics.verticalLeap.toString();
        if (metrics.broadJump !== undefined) updateData.broadJump = metrics.broadJump.toString();
        if (metrics.proAgility !== undefined) updateData.proAgility = metrics.proAgility.toString();
        if (metrics.bench !== undefined) updateData.benchPressMax = metrics.bench;
        if (metrics.squat !== undefined) updateData.squat = metrics.squat;
        if (metrics.deadlift !== undefined) updateData.deadlift = metrics.deadlift;
      }
      
      // Clear verification token after successful verification
      if (updates.contactConfirmed) {
        updateData.coachVerificationToken = null;
      }
      
      await db.update(athleteProfiles)
        .set(updateData)
        .where(eq(athleteProfiles.coachVerificationToken, token));
      
      return { success: true };
      
    } catch (error) {
      console.error('Complete verification error:', error);
      return { success: false, error: 'Verification completion failed' };
    }
  }
  
  /**
   * Resend verification SMS
   */
  async resendVerificationSMS(athleteUserId: number): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const result = await db.select({
        athleteFirstName: athleteProfiles.firstName,
        athleteLastName: athleteProfiles.lastName,
        coachMobile: athleteProfiles.coachMobile,
        coachVerificationToken: athleteProfiles.coachVerificationToken
      })
      .from(athleteProfiles)
      .where(eq(athleteProfiles.userId, athleteUserId))
      .limit(1);
      
      if (result.length === 0 || !result[0].coachMobile || !result[0].coachVerificationToken) {
        return { success: false, error: 'No pending verification found' };
      }
      
      const data = result[0];
      const athleteName = `${data.athleteFirstName} ${data.athleteLastName}`;
      const verificationUrl = `${process.env.CLIENT_URL}/coach-verify/${data.coachVerificationToken}`;
      
      const smsMessage = `Hi Coach! ${athleteName} has added you as their coach on OneShot. Please verify your contact info: ${verificationUrl}`;
      
      const smsSent = await this.smsService.sendVerificationSMS(data.coachMobile, smsMessage);
      
      if (!smsSent) {
        return { success: false, error: 'Failed to resend SMS' };
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('Resend verification SMS error:', error);
      return { success: false, error: 'Failed to resend verification SMS' };
    }
  }
}

export default new CoachVerificationService(); 