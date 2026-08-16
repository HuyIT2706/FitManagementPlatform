export interface JwtPayloadUser {
  sub: string;
  email: string;
  role?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    onboardingCompleted: boolean;
  };
}

export interface RequestWithUser {
  user: JwtPayloadUser;
}

