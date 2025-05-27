import { AthleteProfile } from '../types/athleteProfile';
import VCF from 'vcf';

/**
 * Generates a vCard format string for an athlete profile
 * @param profile The athlete profile data
 * @param includeCoach Whether to include coach information in the vCard
 * @returns vCard formatted string that can be downloaded
 */
export const generateAthleteVCard = (profile: AthleteProfile, includeCoach: boolean = true): string => {
  // Create a new vCard
  const vCard = new VCF();
  
  // Set basic athlete information
  vCard.set('fn', `${profile.firstName} ${profile.lastName}`);
  vCard.set('n', [`${profile.lastName}`, `${profile.firstName}`, '', '', '']);
  
  // Add athlete's contact info if available
  if (profile.phoneNumber) {
    vCard.add('tel', profile.phoneNumber, { type: ['cell'] });
  }
  
  // Organization is set to the high school and sport/position
  if (profile.highSchoolName) {
    let org = profile.highSchoolName;
    if (profile.primaryPosition) {
      org += `, ${profile.sport} - ${profile.primaryPosition}`;
    }
    vCard.set('org', org);
  }
  
  // Add title with graduation year and position
  let title = '';
  if (profile.graduationYear) {
    title += `Class of ${profile.graduationYear}`;
  }
  if (profile.primaryPosition) {
    if (title) title += ' - ';
    title += `${profile.primaryPosition}`;
    if (profile.jerseyNumber) {
      title += ` #${profile.jerseyNumber}`;
    }
  }
  if (title) {
    vCard.set('title', title);
  }
  
  // Add notes with key metrics
  let notes = 'OneShot Recruit Profile\n';
  if (profile.heightInches) {
    const feet = Math.floor(profile.heightInches / 12);
    const inches = profile.heightInches % 12;
    notes += `Height: ${feet}'${inches}"\n`;
  }
  if (profile.weightLbs) {
    notes += `Weight: ${profile.weightLbs} lbs\n`;
  }
  if (profile.gpa) {
    notes += `GPA: ${profile.gpa.toFixed(2)}\n`;
  }
  
  // Add performance metrics if available
  const speedMetrics = [];
  if (profile.fortyYardDash) speedMetrics.push(`40yd: ${profile.fortyYardDash}s`);
  if (profile.verticalLeap) speedMetrics.push(`Vertical: ${profile.verticalLeap}"`);
  if (profile.broadJump) speedMetrics.push(`Broad: ${profile.broadJump}"`);
  if (profile.proAgility) speedMetrics.push(`Pro Agility: ${profile.proAgility}s`);
  
  const strengthMetrics = [];
  if (profile.benchPressMax) strengthMetrics.push(`Bench: ${profile.benchPressMax} lbs`);
  if (profile.squat) strengthMetrics.push(`Squat: ${profile.squat} lbs`);
  if (profile.deadlift) strengthMetrics.push(`Deadlift: ${profile.deadlift} lbs`);
  
  if (speedMetrics.length > 0) {
    notes += '\nSpeed & Agility:\n' + speedMetrics.join(' | ') + '\n';
  }
  
  if (strengthMetrics.length > 0) {
    notes += '\nStrength & Power:\n' + strengthMetrics.join(' | ') + '\n';
  }
  
  // Add profile URL
  const profileUrl = `https://oneshotrecruits.com/u/${profile.slug}`;
  notes += `\nProfile: ${profileUrl}\n`;
  vCard.set('url', profileUrl);
  
  // Add coach information if available and requested
  if (includeCoach && profile.coachFirstName && profile.coachLastName) {
    notes += `\nCoach: ${profile.coachFirstName} ${profile.coachLastName}\n`;
    
    if (profile.coachPhone) {
      notes += `Coach Phone: ${profile.coachPhone}\n`;
    }
    
    if (profile.coachEmail) {
      notes += `Coach Email: ${profile.coachEmail}\n`;
    }
  }
  
  vCard.set('note', notes);
  
  // Add photo if available
  if (profile.profileImageUrl) {
    // Note: In a real implementation, we would fetch the image and convert to base64
    // For now, we just reference the URL
    vCard.add('photo', profile.profileImageUrl, { encoding: 'b', type: 'JPEG' });
  }
  
  return vCard.toString();
};

/**
 * Generates a vCard format string specifically for a coach
 * @param profile The athlete profile containing coach data
 * @returns vCard formatted string for the coach
 */
export const generateCoachVCard = (profile: AthleteProfile): string | null => {
  // Only generate if coach info is available
  if (!profile.coachFirstName || !profile.coachLastName) {
    return null;
  }
  
  // Create a new vCard
  const vCard = new VCF();
  
  // Set basic coach information
  vCard.set('fn', `${profile.coachFirstName} ${profile.coachLastName}`);
  vCard.set('n', [`${profile.coachLastName}`, `${profile.coachFirstName}`, '', '', '']);
  
  // Add coach's contact info
  if (profile.coachPhone) {
    vCard.add('tel', profile.coachPhone, { type: ['cell'] });
  }
  
  if (profile.coachEmail) {
    vCard.add('email', profile.coachEmail);
  }
  
  // Set organization (school)
  if (profile.highSchoolName) {
    vCard.set('org', `${profile.highSchoolName}`);
    vCard.set('title', 'Coach');
  }
  
  // Add note about which athlete this coach is associated with
  vCard.set('note', `Coach for ${profile.firstName} ${profile.lastName} (OneShot Recruit)`);
  
  return vCard.toString();
};

/**
 * Creates a downloadable vCard file from the provided vCard string
 * @param vCardString The vCard formatted string
 * @param filename The name of the file to download
 */
export const downloadVCard = (vCardString: string, filename: string): void => {
  const blob = new Blob([vCardString], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}; 