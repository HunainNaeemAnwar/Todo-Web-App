export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister {
  email: string;
  password: string;
}