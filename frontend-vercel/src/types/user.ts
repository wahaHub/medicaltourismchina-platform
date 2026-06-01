// User related types

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  preferred_language: string;
  preferred_currency: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  preferred_language?: string;
  preferred_currency?: string;
}