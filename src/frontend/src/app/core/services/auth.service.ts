import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { tap, catchError, throwError } from 'rxjs';

export interface User {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
  mustChangeCredentials?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  displayName: string;
  email: string;
  roles: string[];
  refreshToken?: string;
  mustChangeCredentials?: boolean;
}

export interface RegistrationResponse { message: string; }

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  displayName: string;
  email: string;
  phone?: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this._user() && !!this._accessToken());
  readonly isAdmin = computed(() => this._user()?.roles.includes('Administrator') ?? false);
  readonly isModerator = computed(() => this._user()?.roles.some(r => ['Administrator', 'Moderator'].includes(r)) ?? false);
  readonly isOrganizer = computed(() => this._user()?.roles.some(r => ['Administrator', 'Moderator', 'Organizer'].includes(r)) ?? false);

  private readonly TOKEN_KEY = 'jc_access_token';
  private readonly REFRESH_KEY = 'jc_refresh_token';
  private readonly USER_KEY = 'jc_user';

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      const refresh = localStorage.getItem(this.REFRESH_KEY);
      const userStr = localStorage.getItem(this.USER_KEY);

      if (token && userStr) {
        this._accessToken.set(token);
        this._refreshToken.set(refresh);
        this._user.set(JSON.parse(userStr));
      }
    }
  }

  private saveToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this._accessToken()) localStorage.setItem(this.TOKEN_KEY, this._accessToken()!);
      if (this._refreshToken()) localStorage.setItem(this.REFRESH_KEY, this._refreshToken()!);
      if (this._user()) localStorage.setItem(this.USER_KEY, JSON.stringify(this._user()!));
    }
  }

  private clearStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>('/api/v1/auth/login', request)
      .pipe(
        tap(res => this.handleAuthSuccess(res)),
        catchError(err => throwError(() => err))
      );
  }

  register(request: RegisterRequest) {
    return this.http.post<RegistrationResponse>('/api/v1/auth/register', request);
  }

  verifyRegistration(email: string, code: string) {
    return this.http.post<AuthResponse>('/api/v1/auth/verify-registration', { email, code })
      .pipe(tap(res => this.handleAuthSuccess(res)));
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
  }

  resetPassword(email: string, code: string, newPassword: string) {
    return this.http.post<{ message: string }>('/api/v1/auth/reset-password', { email, code, newPassword });
  }

  requestCredentialChangeCode() {
    return this.http.post<{ message: string }>('/api/v1/auth/request-credential-change-code', {});
  }

  changeCredentials(code: string, displayName?: string, newPassword?: string) {
    return this.http.post<{ displayName: string; message: string }>('/api/v1/auth/change-credentials', { code, displayName, newPassword })
      .pipe(tap(res => {
        const user = this._user();
        if (user) {
          this._user.set({ ...user, displayName: res.displayName });
          this.saveToStorage();
        }
      }));
  }

  private handleAuthSuccess(res: AuthResponse): void {
    this._accessToken.set(res.accessToken);
    if (res.refreshToken) this._refreshToken.set(res.refreshToken);
    this._user.set({
      id: '', // Will be populated from token or subsequent call
      displayName: res.displayName,
      email: res.email,
      roles: res.roles,
      mustChangeCredentials: res.mustChangeCredentials ?? false
    });
    this.saveToStorage();
  }

  logout(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this.clearStorage();
    this.router.navigate(['/']);
  }

  async refreshToken(): Promise<boolean> {
    if (!this._refreshToken()) return false;

    try {
      const res = await this.http.post<AuthResponse>('/api/v1/auth/refresh', {
        email: this._user()?.email,
        refreshToken: this._refreshToken()
      }).toPromise();

      if (res) {
        this.handleAuthSuccess(res);
        return true;
      }
      return false;
    } catch {
      this.logout();
      return false;
    }
  }

  getAuthorizationHeader(): string | null {
    const token = this._accessToken();
    return token ? `Bearer ${token}` : null;
  }

  hasRole(role: string): boolean {
    return this._user()?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return this._user()?.roles.some(r => roles.includes(r)) ?? false;
  }
}
