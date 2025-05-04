// User type definition
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'athlete' | 'recruiter' | 'admin' | 'parent';
  isVerified: boolean;
} 