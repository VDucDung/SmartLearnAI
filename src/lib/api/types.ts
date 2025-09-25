/**
 * API Types and Interfaces
 * Centralized type definitions for all API-related operations
 */

import { HTTP_METHODS, HTTP_STATUS } from './config';

// HTTP Method types
export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];

// HTTP Status types
export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];

// Base API Response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
  };
}

// API Request configuration
export interface ApiRequestConfig {
  method: HttpMethod;
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  withAuth?: boolean;
}

// API Error types
export interface ApiError {
  message: string;
  status: HttpStatusCode;
  code?: string;
  details?: any;
  timestamp: string;
}

// Authentication types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  balance?: number;
  isAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Tool types
export interface Tool {
  id: string;
  name: string;
  description: string;
  price: number;
  prices?: any[]; // Array of pricing options
  category?: Category;
  categoryId?: string;
  image?: string;
  imageUrl?: string;
  videoUrl?: string;
  instructions?: string;
  downloadUrl?: string;
  views?: number;
  purchases?: number;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  tools?: Tool[];
  createdAt?: string;
  updatedAt?: string;
}

// Purchase types
export interface Purchase {
  id: string;
  toolId: string;
  userId: string;
  key?: string;
  keyValue?: string;
  finalPrice?: number;
  isActive?: boolean;
  status: 'active' | 'inactive' | 'expired';
  purchasedAt: string;
  createdAt?: string;
  expiresAt?: string;
  tool?: Tool;
  user?: User;
}

export interface PurchaseRequest {
  toolId: string;
  discountCodeId?: string;
}

export interface ChangeKeyRequest {
  newKey: string;
}

// Payment types
export interface Payment {
  id: string;
  userId: string;
  amount: number;
  description?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'deposit' | 'purchase' | 'refund';
  createdAt: string;
  user?: User;
}

export interface DepositRequest {
  amount: number;
  description?: string;
}

// Discount Code types
export interface DiscountCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount?: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface ValidateDiscountRequest {
  code: string;
}

// User Profile types
export interface UpdateProfileRequest {
  fullname?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Admin types
export interface AdminStatistics {
  totalUsers: number;
  totalTools: number;
  totalPurchases: number;
  totalRevenue: number;
  recentUsers: User[];
  recentPurchases: Purchase[];
}

export interface KeyValidation {
  id: string;
  userId: string;
  toolId: string;
  key: string;
  status: 'valid' | 'invalid' | 'expired';
  validatedAt: string;
  user?: User;
  tool?: Tool;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Search and Filter types
export interface SearchParams {
  query?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// File Upload types
export interface FileUploadRequest {
  file: File;
  path?: string;
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

// Request interceptor types
export interface RequestInterceptor {
  onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
  onRequestError?: (error: any) => any;
}

// Response interceptor types
export interface ResponseInterceptor {
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
  onResponseError?: (error: ApiError) => any;
}

// API Client configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
}

// Query configuration types
export interface QueryConfig {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: boolean | number;
}

// Mutation configuration types
export interface MutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  onSettled?: () => void;
  retry?: boolean | number;
}
