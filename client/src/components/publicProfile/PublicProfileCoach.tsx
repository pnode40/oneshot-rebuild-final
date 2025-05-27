import React, { useState } from 'react';
import { AthleteProfile } from '../../types/athleteProfile';

interface PublicProfileCoachProps {
  profile: AthleteProfile;
}

const PublicProfileCoach: React.FC<PublicProfileCoachProps> = ({ profile }) => {
  const [isEmailHidden, setIsEmailHidden] = useState(true);
  const [isPhoneHidden, setIsPhoneHidden] = useState(true);
  
  // If no coach info, don't render the component
  if (!profile.coachFirstName || !profile.coachLastName) {
    return null;
  }
  
  // Helper to obscure email
  const obscureEmail = (email: string) => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    return `${username.charAt(0)}${'*'.repeat(username.length - 1)}@${domain}`;
  };
  
  // Helper to obscure phone
  const obscurePhone = (phone: string) => {
    if (!phone) return '';
    return `${phone.slice(0, 3)}-${'*'.repeat(4)}-${phone.slice(phone.length - 4)}`;
  };
  
  // Helper to format phone
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
    
    return phone;
  };
  
  // Handle revealing contact info
  const revealEmail = () => {
    setIsEmailHidden(false);
  };
  
  const revealPhone = () => {
    setIsPhoneHidden(false);
  };
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Coach Contact</h2>
          {profile.isCoachVerified && (
            <div className="flex items-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Verified</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-800">
              Coach {profile.coachFirstName} {profile.coachLastName}
            </h3>
            
            {/* Email */}
            {profile.coachEmail && (
              <div className="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {isEmailHidden ? (
                  <div className="flex items-center">
                    <span className="text-gray-600">{obscureEmail(profile.coachEmail)}</span>
                    <button 
                      onClick={revealEmail}
                      className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Show
                    </button>
                  </div>
                ) : (
                  <a 
                    href={`mailto:${profile.coachEmail}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {profile.coachEmail}
                  </a>
                )}
              </div>
            )}
            
            {/* Phone */}
            {profile.coachPhone && (
              <div className="mt-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {isPhoneHidden ? (
                  <div className="flex items-center">
                    <span className="text-gray-600">{obscurePhone(profile.coachPhone)}</span>
                    <button 
                      onClick={revealPhone}
                      className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Show
                    </button>
                  </div>
                ) : (
                  <a 
                    href={`tel:${profile.coachPhone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {formatPhone(profile.coachPhone)}
                  </a>
                )}
              </div>
            )}
          </div>
          
          {/* Verification status - full version on wider screens */}
          {profile.isCoachVerified && (
            <div className="hidden md:block bg-green-50 py-2 px-4 rounded-lg mt-4 md:mt-0">
              <div className="text-sm text-green-700">
                <p className="font-medium">Coach contact verified</p>
                <p>This coach's contact info has been confirmed</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Coach verification notice */}
        <div className="mt-6 text-sm text-gray-500">
          <p>Coach contact information is provided for recruitment purposes only. To protect privacy, recruiters must click "Show" to reveal complete contact details.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileCoach; 