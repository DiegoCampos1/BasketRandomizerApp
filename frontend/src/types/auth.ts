export interface Organization {
  id: string;
  name: string;
  created_at: string;
  members_count: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  organization: Organization | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  organization_name?: string;
  organization_id?: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}
