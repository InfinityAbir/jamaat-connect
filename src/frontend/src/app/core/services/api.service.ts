import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface LocationDto {
  id: string;
  name: string;
  stableIdentifier: string;
  level: number;
  parentId: string | null;
  isActive: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListingSummaryDto {
  id: string;
  title: string;
  departureLocationName: string;
  departureAt: string | null;
  durationDays: number | null;
  destinationText: string;
  availabilityStatus: string;
  verificationStatus: string;
  publishedAt: string | null;
}

export interface ListingDetailDto {
  id: string;
  title: string;
  description: string | null;
  departureLocationName: string;
  departureLocationId: string;
  departureAt: string | null;
  durationDays: number | null;
  destinationLocationName: string | null;
  destinationLocationId: string | null;
  destinationText: string | null;
  availabilityStatus: string;
  publicationStatus: string;
  verificationStatus: string;
  publishedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  canEnquire: boolean;
  canReport: boolean;
}

export interface CreateListingRequest {
  departureLocationId: string;
  title: string;
  description?: string;
  departureAt?: string;
  dateStatus: string;
  durationDays?: number;
  destinationLocationId?: string;
  destinationText?: string;
  availabilityStatus: string;
  submitterName: string;
  submitterPhone: string;
  submitterEmail?: string;
  whatsAppNumber?: string;
  preferredContactMethod: string;
  consentToShareContact: boolean;
}

export interface UpdateListingRequest {
  title: string;
  description?: string;
  departureAt?: string;
  dateStatus: string;
  durationDays?: number;
  destinationLocationId?: string;
  destinationText?: string;
  availabilityStatus: string;
}

export interface ListingSubmissionResponse {
  submissionId: string;
  referenceNumber: string;
  status: string;
}

export interface CreateEnquiryRequest {
  listingId: string;
  senderName: string;
  senderPhone?: string;
  senderWhatsApp?: string;
  consentToShareContact: boolean;
  message: string;
}

export interface EnquiryResponse {
  enquiryId: string;
  status: string;
  createdAt: string;
}

export interface EnquiryDetailDto {
  id: string;
  listingId: string;
  listingTitle: string;
  senderName: string;
  senderPhone: string | null;
  senderWhatsApp: string | null;
  consentToShareContact: boolean;
  message: string;
  status: string;
  createdAt: string;
}

export interface ModerationQueueItemDto {
  id: string;
  title: string;
  departureLocationName: string;
  departureAt: string | null;
  durationDays: number | null;
  publicationStatus: string;
  verificationStatus: string;
  availabilityStatus: string;
  submitterName: string;
  submitterPhone: string;
  submitterEmail: string | null;
  whatsAppNumber: string | null;
  preferredContactMethod: string;
  submitterUserId: string;
  createdAt: string;
}

export interface CreateListingReportRequest {
  listingId: string;
  reason: string;
  description: string;
}

export interface ListingReportDto {
  id: string;
  listingId: string;
  listingTitle: string;
  reason: string;
  description: string;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  // Locations
  getLocations(parentId?: string): Observable<LocationDto[]> {
    let params = new HttpParams();
    if (parentId) {
      params = params.set('parentId', parentId);
    }
    return this.http.get<LocationDto[]>(`${this.baseUrl}/locations`, { params });
  }

  /** Starts public location pickers at Bangladesh's divisions, not the country record. */
  getBangladeshDivisions(): Observable<LocationDto[]> {
    return this.getLocations().pipe(
      switchMap(roots => {
        const bangladesh = roots.find(location => location.stableIdentifier === 'BD');
        return bangladesh ? this.getLocations(bangladesh.id) : of(roots);
      })
    );
  }

  getLocation(id: string): Observable<LocationDto> {
    return this.http.get<LocationDto>(`${this.baseUrl}/locations/${id}`);
  }

  createLocation(req: { name: string; stableIdentifier?: string; level: number; parentId?: string }): Observable<LocationDto> {
    return this.http.post<LocationDto>(`${this.baseUrl}/locations`, req);
  }

  updateLocation(id: string, req: { name: string; stableIdentifier?: string; isActive: boolean }): Observable<LocationDto> {
    return this.http.put<LocationDto>(`${this.baseUrl}/locations/${id}`, req);
  }

  deleteLocation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/locations/${id}`);
  }

  // Listings
  searchListings(params: {
    page?: number;
    pageSize?: number;
    locationId?: string;
    departureDateFrom?: string;
    departureDateTo?: string;
    durationDays?: number;
    availabilityStatus?: string;
    sortBy?: string;
    sortDirection?: string;
  }): Observable<PagedResult<ListingSummaryDto>> {
    let httpParams = new HttpParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http.get<PagedResult<ListingSummaryDto>>(
      `${this.baseUrl}/listings`,
      { params: httpParams }
    );
  }

  getListing(id: string): Observable<ListingDetailDto> {
    return this.http.get<ListingDetailDto>(`${this.baseUrl}/listings/${id}`);
  }

  createListing(request: CreateListingRequest): Observable<ListingSubmissionResponse> {
    return this.http.post<ListingSubmissionResponse>(`${this.baseUrl}/listings`, request);
  }

  updateListing(id: string, request: UpdateListingRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/listings/${id}`, request);
  }

  withdrawListing(id: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/listings/${id}/withdraw`, {});
  }

  getMySubmissions(): Observable<ListingSummaryDto[]> {
    return this.http.get<ListingSummaryDto[]>(`${this.baseUrl}/listings/my/submissions`);
  }

  // Enquiries
  createEnquiry(request: CreateEnquiryRequest): Observable<EnquiryResponse> {
    return this.http.post<EnquiryResponse>(`${this.baseUrl}/enquiries`, request);
  }

  getMyEnquiries(params?: { page?: number; pageSize?: number; status?: string }): Observable<PagedResult<EnquiryDetailDto>> {
    let httpParams = new HttpParams();
    if (params?.page) httpParams = httpParams.set('page', params.page);
    if (params?.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);
    if (params?.status) httpParams = httpParams.set('status', params.status);
    return this.http.get<PagedResult<EnquiryDetailDto>>(`${this.baseUrl}/enquiries`, { params: httpParams });
  }

  moderateEnquiry(id: string, action: { enquiryId: string; action: string; reason?: string }): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/enquiries/${id}/moderate`, action);
  }

  // Moderation
  getModerationQueue(page = 1, pageSize = 20): Observable<PagedResult<ModerationQueueItemDto>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<ModerationQueueItemDto>>(`${this.baseUrl}/admin/moderation/queue`, { params });
  }

  approveListing(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/listings/${id}/approve`, { action: 'Approve', reason });
  }

  requestListingChanges(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/listings/${id}/request-changes`, { action: 'RequestChanges', reason });
  }

  rejectListing(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/listings/${id}/reject`, { action: 'Reject', reason });
  }

  suspendListing(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/listings/${id}/suspend`, { action: 'Suspend', reason });
  }

  // Reports
  createReport(id: string, request: CreateListingReportRequest): Observable<ListingReportDto> {
    return this.http.post<ListingReportDto>(`${this.baseUrl}/listings/${id}/reports`, request);
  }

  getReports(page = 1, pageSize = 20, status?: string): Observable<PagedResult<ListingReportDto>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (status) params = params.set('status', status);
    return this.http.get<PagedResult<ListingReportDto>>(`${this.baseUrl}/admin/reports`, { params });
  }

  resolveReport(id: string, reason: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/admin/reports/${id}/resolve`, { reason });
  }
}
