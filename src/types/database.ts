export interface Program {
  id?: string;
  title: string;
  description: string;
  published: boolean;
  createdAt: any;
}

export interface Application {
  id?: string;
  userId: string;
  programId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export interface Message {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

export interface Job {
  id?: string;
  title: string;
  department: string;
  location: string;
  type: string; // e.g. 'Full-time', 'Part-time', 'Internship', 'Volunteer'
  description: string;
  formLink?: string;
  requirements: string[];
  active: boolean;
  createdAt: any;
}

export interface Donation {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  amount: number;
  paymentMethod: string;
  createdAt: any;
}
