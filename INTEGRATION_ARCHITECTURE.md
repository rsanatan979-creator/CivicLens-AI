# AI Civic Agent — Enterprise Full-Stack Integration Architecture
## Production-Grade Blueprint for Civic Issue Reporting & AI Diagnostics

This document outlines the complete, end-to-end frontend-backend integration architecture to transform the **CivicAgent** prototype into a secure, production-grade, full-stack application. It replaces local storage mock systems with an enterprise-ready stack consisting of **React (Vite) + React Query + Node.js (TypeScript/Express) + PostgreSQL (Prisma ORM) + FastAPI AI Service**.

---

## 1. Frontend → Backend Connection Strategy

To ensure sub-second response times, offline-tolerance, and state synchronization across multiple actors (citizens, municipal officials, admin dispatchers), the application employs a **React Query (TanStack Query) + Axios Service Layer** architecture.

```
+-------------------------------------------------------------+
|                     React UI Layer                          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                 TanStack React Query Hooks                  |
|         (useQuery, useMutation, Cache Invalidation)         |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|               Type-Safe Service SDK Layer                   |
|         (AuthService, ComplaintService, etc.)               |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
|                     Axios Client                            |
|        (Bearer Interceptors, Global Interceptors)           |
+-------------------------------------------------------------+
                               |
                               v  HTTPS (JSON)
+-------------------------------------------------------------+
|                    Express API Gateway                      |
+-------------------------------------------------------------+
```

### API Architecture & Endpoint Conventions
All communication happens over HTTPS using RESTful guidelines. Payload formats are strictly JSON. The API is versioned to allow backward-compatible updates:
* **Base URL:** `/api/v1`
* **Common Response Format (Standard Success):**
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
* **Common Response Format (Standard Failure):**
  ```json
  {
    "success": false,
    "errorCode": "VALIDATION_ERROR",
    "message": "The uploaded file format is not supported.",
    "details": [
      { "field": "image", "issue": "Must be an image of type JPEG, PNG, or WEBP." }
    ]
  }
  ```

### Axios Client Design (`src/api/axiosClient.ts`)
A dedicated Axios client handles automated Bearer token attachment, automatic retry backoffs, and centralized error parsing.

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage/secure cookie
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('civic_agent_jwt');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize API error shapes and capture 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response.data, // Strip the outer HTTP envelope
  (error: AxiosError) => {
    const apiError = {
      success: false,
      errorCode: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
      status: error.response?.status,
    };

    if (error.response?.data && typeof error.response.data === 'object') {
      Object.assign(apiError, error.response.data);
    }

    if (error.response?.status === 401) {
      // Trigger logout or silent refresh
      localStorage.removeItem('civic_agent_jwt');
      window.dispatchEvent(new Event('auth_session_expired'));
    }

    return Promise.reject(apiError);
  }
);
```

### React Query Strategy & Cache Invalidation
To eliminate the overhead of complex state synchronizations, we enforce a strict separation between server-state (handled by React Query) and local UI state.

* **Cache Lifetimes (`staleTime` and `gcTime`):**
  * **Complaints Registry:** `staleTime: 1000 * 30` (30 seconds) since other citizens might verify or officials might update tickets.
  * **Analytics Dashboard:** `staleTime: 1000 * 60 * 5` (5 minutes) as aggregated charts don't require real-time accuracy.
  * **Predictions:** `staleTime: 1000 * 60 * 10` (10 minutes) since predictive hotspot patterns change slowly.
  * **Departments:** `staleTime: Infinity` (cached permanently for the session).

* **Cache Invalidation Rules:**
  * Submitting a new complaint invalidates `['complaints']` and `['analytics']`.
  * Verifying a complaint or marking a duplicate invalidates `['complaints', id]` and `['verifications', id]`.
  * Official changing status or changing severity invalidates `['complaints']` and `['complaints', id]`.

---

## 2. Recommended Folder Structure

The code is strictly modularized using clean-architecture principles, separating routing, business logic, storage operations, and components.

### Frontend Structure (`src/`)
```
src/
├── api/
│   └── axiosClient.ts          # Central configured Axios instance
├── services/                   # Raw API abstraction layer
│   ├── auth.service.ts         # User registration, login, profile retrieval
│   ├── complaint.service.ts    # Complaint CRUD, history, and status
│   ├── upload.service.ts       # Cloud image uploads
│   ├── verification.service.ts # Upvotes and verification voting
│   ├── analytics.service.ts    # Aggregated charts and metrics data
│   └── prediction.service.ts   # Rule-based and predictive AI hotspots
├── hooks/                      # Custom React Query hook connectors
│   ├── useAuth.ts              # Connects AuthContext + mutations
│   ├── useComplaints.ts        # Query/Mutation hooks for tickets
│   ├── useAnalytics.ts         # Queries for charts & grids
│   └── usePredictions.ts       # Queries for municipal predictions
├── contexts/                   # Pure UI Global State
│   └── AuthContext.tsx         # Holds active User Profile & Token state
├── types/                      # Strictly declared TypeScript interfaces
│   ├── auth.types.ts           # Token and Profile models
│   ├── complaint.types.ts      # Severity, Status, Timeline, Coordinates
│   └── analytics.types.ts      # Data points for Recharts structures
├── utils/                      # Helper methods (formatting, geocoding)
├── components/                 # Extracted modular UI elements
│   ├── Analytics.tsx
│   ├── Auth.tsx
│   ├── CitizenHome.tsx
│   └── ...
├── App.tsx                     # Main Router and layout controller
└── main.tsx                    # React App entry bootstrapper
```

### Backend Structure (`backend/`)
```
backend/
├── src/
│   ├── config/                 # Initializers (DB pool, Cloudinary, SendGrid)
│   ├── controllers/            # Express controllers (extract params, call services)
│   ├── services/               # Core business rules (AI fetch, DB orchestrations)
│   ├── repositories/           # Direct database transactions using Prisma
│   ├── routes/                 # Routing files structured by domains
│   ├── middleware/             # Auth check, role verification, global error handler
│   ├── validators/             # Request payloads schema checking (Zod)
│   ├── utils/                  # Cryptography, Winston logs, token generators
│   ├── types/                  # Internal Express typings and extensions
│   └── app.ts                  # Express application setup
├── prisma/                     
│   └── schema.prisma           # Relational Database schema design
├── server.ts                   # Network server startup executioner
└── package.json
```

---

## 3. Service Layer Design

The service layers act as the pure domain interfaces. On the frontend, services encapsulate network requests. On the backend, services implement business workflows, call external APIs (FastAPI / Cloudinary / SendGrid), and persist states.

### Frontend Service Layer Interface
```typescript
// src/services/auth.service.ts
export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return axiosClient.post('/auth/login', credentials);
  },
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    return axiosClient.post('/auth/register', data);
  },
  getProfile: async (): Promise<UserProfile> => {
    return axiosClient.get('/auth/profile');
  }
};

// src/services/complaint.service.ts
export const ComplaintService = {
  create: async (payload: CreateComplaintPayload): Promise<Complaint> => {
    return axiosClient.post('/complaints', payload);
  },
  getAll: async (filters?: ComplaintFilters): Promise<Complaint[]> => {
    return axiosClient.get('/complaints', { params: filters });
  },
  getById: async (id: string): Promise<Complaint> => {
    return axiosClient.get(`/complaints/${id}`);
  },
  update: async (id: string, updates: Partial<Complaint>): Promise<Complaint> => {
    return axiosClient.put(`/complaints/${id}`, updates);
  },
  delete: async (id: string): Promise<void> => {
    return axiosClient.delete(`/complaints/${id}`);
  }
};

// src/services/upload.service.ts
export const UploadService = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('image', file);
    return axiosClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};

// src/services/verification.service.ts
export const VerificationService = {
  vote: async (complaintId: string, voteType: 'valid' | 'duplicate' | 'resolved'): Promise<Verification> => {
    return axiosClient.post('/verifications', { complaintId, voteType });
  },
  getVotes: async (complaintId: string): Promise<VerificationSummary> => {
    return axiosClient.get(`/verifications/${complaintId}`);
  }
};

// src/services/analytics.service.ts
export const AnalyticsService = {
  getCategories: () => axiosClient.get('/analytics/categories'),
  getAreas: () => axiosClient.get('/analytics/areas'),
  getSeverity: () => axiosClient.get('/analytics/severity'),
  getResolution: () => axiosClient.get('/analytics/resolution'),
};

// src/services/prediction.service.ts
export const PredictionService = {
  getHotspots: (): Promise<PredictionHotspot[]> => {
    return axiosClient.get('/predictions');
  }
};
```

---

## 4. State Management Plan

To secure high-performing interactions, we separate state by access characteristics:

```
                  +-----------------------------------+
                  |           UI State Area           |
                  +-----------------------------------+
                    /                               \
                   /                                 \
  +-------------------------------+   +-------------------------------+
  |  Global State (Context API)   |   |   Server State (React Query)  |
  +-------------------------------+   +-------------------------------+
  | Only volatile UI details:     |   | Dynamic DB resources:         |
  | * Active User Profile         |   | * Complaints list & details   |
  | * Decrypted JWT session token |   | * Live municipal predictions  |
  | * Overlay sidebar open state  |   | * Real-time analytics charts  |
  +-------------------------------+   +-------------------------------+
```

### Global Client State (React Context API)
The `AuthContext.tsx` holds ONLY the logged-in session, facilitating synchronous checks for role-based rendering.
```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/auth.types';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('civic_agent_jwt');
    const savedUser = localStorage.getItem('civic_agent_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (jwtToken: string, userProfile: UserProfile) => {
    localStorage.setItem('civic_agent_jwt', jwtToken);
    localStorage.setItem('civic_agent_user', JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
  };

  const logout = () => {
    localStorage.removeItem('civic_agent_jwt');
    localStorage.removeItem('civic_agent_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 5. Data Flow Mapping

The core of our platform relies on distinct transactional workflows mapping frontend UI interactions to the database and external services.

### A. Complaint Creation with AI Classification Flow
```
[Citizen UI]                [Express Gateway]             [FastAPI AI]           [Cloudinary]
     |                              |                           |                     |
     |--- 1. Selects image & upload -|                           |                     |
     |    (POST /api/v1/upload)     |------------------------------------------------>|
     |                              |<-- 2. Return hosted asset URL ("https://...") ---|
     |<-- 3. Return imageUrl -------|                           |                     |
     |                              |                           |                     |
     |--- 4. Send predict request --->|                           |                     |
     |    (POST /api/v1/predict)    |--- 5. Invoke predict ---->|                     |
     |                              |    (POST /predict)        |                     |
     |                              |<-- 6. Category/Severity --|                     |
     |<-- 7. Show diagnostics UI ----|                           |                     |
     |    (Adjustments possible)    |                           |                     |
     |                              |                           |                     |
     |--- 8. Final Submission ----->|                           |                     |
     |    (POST /api/v1/complaints) |-- 9. Insert DB record     |                     |
     |                              |    (Prisma schema)        |                     |
     |<-- 10. Confirm Receipt ------|                           |                     |
     |                              |                           |                     |
```

### B. Complaint History & Live Tracking Flow
```
[Citizen UI]                [Express Gateway]             [PostgreSQL Engine]
     |                              |                              |
     |--- 1. Request details ------>|                              |
     |    (GET /complaints/:id)     |--- 2. Query join relations ->|
     |                              |    (Complaints + History)    |
     |                              |<-- 3. Formulated records ----|
     |                              |                              |
     |<-- 4. Complete timeline -----|                              |
     |    (Render tracking timeline)|                              |
```

### C. Community Verification Flow
```
[Citizen UI]                [Express Gateway]             [PostgreSQL Engine]
     |                              |                              |
     |--- 1. Cast verification ---->|                              |
     |    (Vote: valid/duplicate)   |--- 2. Validate voter constraints (No self-vote, once only)
     |                              |--- 3. Log verification record -|
     |                              |--- 4. Increment vote aggregates|
     |                              |<-- 5. Commit & complete -----|
     |<-- 6. Trigger React Query ---|                              |
     |    Invalidation (Inval lists)|                              |
```

### D. Official Status & Dispatch Flow
```
[Official UI]               [Express Gateway]             [PostgreSQL DB]          [SendGrid]
     |                              |                            |                     |
     |--- 1. Set status to IN_PROG ->|                            |                     |
     |    (PUT /complaints/:id)     |--- 2. Update complaint ---->|                     |
     |                              |--- 3. Log ComplaintHistory ->|                     |
     |                              |                            |--- 4. Dispatch Email -|
     |                              |                            |    (Notify citizen) |
     |<-- 5. Confirm status update -|                            |                     |
```

---

## 6. Error Handling Strategy

An enterprise-grade, fail-safe architecture handles errors at all levels, logging technical details server-side while maintaining a simple, helpful experience in the user interface.

### Global Backend Error Middleware (`backend/src/middleware/errorHandler.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import { winstonLogger } from '../utils/logger';

export interface AppError extends Error {
  status?: number;
  errorCode?: string;
  details?: any;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const status = err.status || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected server error occurred.';

  // Log everything into our structured winston logging system
  winstonLogger.error({
    message: err.message,
    errorCode,
    status,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  res.status(status).json({
    success: false,
    errorCode,
    message,
    details: err.details || null,
  });
}
```

### Unified Error Resolution Matrix
| Error Category | Triggering Condition | Backend Handling Policy | Frontend UI Action Plan |
| :--- | :--- | :--- | :--- |
| **Network Error** | Severed internet connection / API gateway offline. | Checked before route trigger (Express doesn't see it). | Global banner indicator + auto offline mode for local cached tickets. |
| **Auth Error** | Missing bearer token, tampered JWT, expired session. | Returns `401 Unauthorized` via auth verification middleware. | Redirects session to login screen with a non-intrusive warning. |
| **Validation Error** | Schema mismatch, empty payload, bad coordinates. | Zod middleware interrupts and returns `400 BAD_REQUEST`. | Form highlights red border with specific feedback alerts under fields. |
| **Upload Failure** | Unsupported image MIME-type, file size > 10MB. | Multer filter blocks and returns `413 payload too large`. | Shows a toast alert requesting file adjustments. |
| **AI Predict Failure** | FastAPI offline, image contains low features. | Fallback default prediction structure, alert operator log. | Interactive inputs enabled automatically for manual dropdown overrides. |
| **Database Failure** | Deadlock, PostgreSQL connection loss. | Database connection retries + returns `503 service unavailable`. | Displays an elegant server-maintenance page. |

---

## 7. Loading State Strategy

To avoid layout shifts (CLSs) and improve the user experience, the application uses **Skeletons** for data fetches and **Optimistic Updates** for fast interactions.

### A. Progressive Skeletons Strategy
Instead of simple loading spinners, we use custom Tailwind skeletons that match the shape of the incoming cards.

```typescript
// Skeleton wrapper helper
export function ComplaintCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 animate-pulse space-y-4">
      <div className="flex justify-between items-start">
        <div className="h-6 w-1/3 bg-slate-200 rounded-lg"></div>
        <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
      </div>
      <div className="h-4 w-3/4 bg-slate-100 rounded-lg"></div>
      <div className="aspect-video w-full bg-slate-100 rounded-2xl"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-slate-200 rounded-full"></div>
        <div className="h-8 w-20 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  );
}
```

### B. Optimistic State Updates
For fast reactions (such as casting verification upvotes), the local UI updates instantly without waiting for network responses. If the backend fails, the state rolls back to the previous values.

```typescript
// Example of React Query Optimistic Update on Upvote mutation
const queryClient = useQueryClient();

const upvoteMutation = useMutation({
  mutationFn: (complaintId: string) => VerificationService.vote(complaintId, 'valid'),
  onMutate: async (complaintId) => {
    // Cancel outgoing refetches so they don't overwrite our optimistic update
    await queryClient.cancelQueries({ queryKey: ['complaints'] });

    // Snapshot the previous state
    const previousComplaints = queryClient.getQueryData<Complaint[]>(['complaints']);

    // Optimistically update the list
    queryClient.setQueryData<Complaint[]>(['complaints'], (old) =>
      old?.map((c) =>
        c.id === complaintId ? { ...c, upvotes: c.upvotes + 1 } : c
      )
    );

    // Return context with snapshot values for rollback
    return { previousComplaints };
  },
  onError: (err, complaintId, context) => {
    // Roll back to the saved state if mutation fails
    if (context?.previousComplaints) {
      queryClient.setQueryData(['complaints'], context.previousComplaints);
    }
    triggerToastNotification('Upvote synchronization failed. Retrying...', 'error');
  },
  onSettled: () => {
    // Always refetch in background to sync state with backend
    queryClient.invalidateQueries({ queryKey: ['complaints'] });
  },
});
```

---

## 8. Security Enforcement Rules

Security is built into the architecture at every layer to prevent data leaks and malicious inputs.

```
       [Client App]
            |
            |   HTTPS Encryption
            v
   [Rate Limiting (100 req/15 min)]
            |
            v
   [Helmet (Security Headers)]
            |
            v
   [CORS Guard (Origin Checks)]
            |
            v
   [JWT Access token validation]
            |
            v
   [RBAC Role Validation (Officer / Citizen)]
            |
            v
   [Zod Payload Verification]
            |
            v
   [Prisma Query (Prepared SQL parameters)] ---> [PostgreSQL DB]
```

1. **Secure JWT Handling:**
   * **Authentication Tokens:** Handled via custom signed JWTs containing user ID and Role.
   * **Bearer Storage:** Stored inside client HTTPOnly cookies or fallback local memory storage (not local storage) to prevent XSS scraping. Expiry set to 1 hour, refreshing via high-entropy refresh tokens.

2. **Role-Based Access Control (RBAC):**
   * Access roles: `citizen`, `official`, `admin`.
   * Express middleware intercepting restricted paths:
     ```typescript
     export const requireRole = (roles: string[]) => {
       return (req: Request, res: Response, next: NextFunction) => {
         const user = req.user; // Appended by verifyJWT middleware
         if (!user || !roles.includes(user.role)) {
           return res.status(403).json({
             success: false,
             errorCode: 'FORBIDDEN',
             message: 'Access Denied: Insufficient permissions.'
           });
         }
         next();
       };
     };
     ```

3. **Input Validation (Zod Schema Guard):**
   * Strictly validates incoming payloads before any DB query.
   ```typescript
   import { z } from 'zod';
   export const CreateComplaintSchema = z.object({
     title: z.string().min(5).max(100),
     imageUrl: z.string().url(),
     latitude: z.number().min(-90).max(90),
     longitude: z.number().min(-180).max(180),
     category: z.enum(['Pothole', 'Garbage', 'Water Leakage', 'Broken Streetlight', 'Drain Blockage', 'Road Damage']),
     severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
   });
   ```

4. **File Upload Security Rules:**
   * **Size Restriction:** Restrict uploads using Multer max limits (`10MB`).
   * **Magic Number Validation:** Read file headers to verify they are legitimate images (JPEG, PNG, WEBP), blocking executable files renamed to `.png`.

5. **SQL Injection & XSS Mitigation:**
   * **Parameterized DB Queries:** Handled by default through Prisma ORM queries. Raw queries (`$queryRaw`) are banned unless parameterized explicitly.
   * **XSS Sanitization:** Apply Helmet middleware to set proper content security policies (CSPs) and sanitize input fields on the backend using libraries like DOMPurify or custom Express sanitizers.

6. **Rate Limiting:**
   * Limit endpoints to prevent denial-of-service (DoS) attempts and excessive costs from AI service calls.
   * Apply a maximum of `100` requests per 15-minute interval for general endpoints, and `10` requests per 15-minute interval for image classification (`POST /predict`).

---

## 9. Dependency Order & Migration Roadmap

The migration from prototype to full-stack is split into structured steps to avoid downtime or broken features.

```
+--------------------------------------------------------------------------+
| Phase 1: Environment & Database Setup                                    |
| * Run PostgreSQL instance.                                               |
| * Run Prisma migration init.                                             |
| * Seed Departments list.                                                 |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| Phase 2: Core Authentication Layer                                       |
| * Configure JWT and bcrypt utility helpers.                              |
| * Add registration and login routes.                                     |
| * Connect client UI with AuthContext and remove localStorage fakes.       |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| Phase 3: S3/Cloudinary Image Upload Gateway                             |
| * Set up Multer config.                                                 |
| * Implement secure POST /upload endpoint.                                |
| * Route image uploads to Cloudinary storage.                             |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| Phase 4: Complaints Registry & AI Predict Hookup                        |
| * Set up FastAPI simulation/integration for category and severity.        |
| * Connect POST /complaints.                                              |
| * Implement status updates and history creation.                         |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| Phase 5: Crowd Verification & Upvoting                                   |
| * Add verifications route logic (one vote restriction).                  |
| * Connect citizen upvote and flag actions.                               |
+--------------------------------------------------------------------------+
|                                    |                                     |
|--- (Parallel Implementation) ------|                                     |
|                                                                          v
+---------------------------------------------------+  +---------------------------------------------------+
| Phase 6: Live Analytics Aggregation               |  | Phase 7: Predictions & Hotspot Engine             |
| * Connect Recharts via API fetches (No mocks).    |  | * Connect predictions endpoint mapping risk score|
+---------------------------------------------------+  +---------------------------------------------------+
```

### Why This Order?
1. **DB and Auth first:** Every action (reporting, upvoting, updating) requires a logged-in user with a verified ID and role from the database.
2. **Upload before AI:** AI services cannot predict without a valid hosted image URL from the upload gateway.
3. **Analytics after Complaints:** Analytics depend on structured data generated from real complaint entries in the PostgreSQL database.

---

## 10. Database Schema (Prisma Schema Reference)

Below is the complete database design for PostgreSQL, ensuring referential integrity and appropriate indexes.

```prisma
// backend/prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  CITIZEN
  OFFICIAL
  ADMIN
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum Status {
  SUBMITTED
  VERIFIED
  ASSIGNED
  IN_PROGRESS
  RESOLVED
}

enum VoteType {
  VALID
  DUPLICATE
  RESOLVED
}

model User {
  id            String         @id @default(uuid())
  name          String
  email         String         @unique
  passwordHash  String
  role          Role           @default(CITIZEN)
  points        Int            @default(100)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  complaints    Complaint[]    @relation("ReportedBy")
  verifications Verification[]

  @@map("users")
}

model Department {
  id         String      @id @default(uuid())
  name       String      @unique
  complaints Complaint[]

  @@map("departments")
}

model Complaint {
  id           String             @id @default(uuid())
  title        String
  imageUrl     String
  latitude     Float
  longitude    Float
  category     String
  severity     Severity           @default(MEDIUM)
  status       Status             @default(SUBMITTED)
  aiConfidence Float              @default(1.0)
  createdById  String
  createdBy    User               @relation("ReportedBy", fields: [createdById], references: [id], onDelete: Cascade)
  departmentId String?
  department   Department?        @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt
  
  verifications Verification[]
  history       ComplaintHistory[]

  @@index([latitude, longitude])
  @@index([status])
  @@index([category])
  @@map("complaints")
}

model Verification {
  id          String    @id @default(uuid())
  complaintId String
  complaint   Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  voteType    VoteType
  createdAt   DateTime  @default(now())

  @@unique([complaintId, userId]) // Single-vote enforcement
  @@map("verifications")
}

model ComplaintHistory {
  id          String    @id @default(uuid())
  complaintId String
  complaint   Complaint @relation(fields: [complaintId], references: [id], onDelete: Cascade)
  oldStatus   Status
  newStatus   Status
  updatedBy   String    // Name or ID of the official making the transition
  createdAt   DateTime  @default(now())

  @@map("complaint_histories")
}

model Prediction {
  id             String   @id @default(uuid())
  areaName       String
  riskScore      Float
  predictedIssue String
  generatedAt    DateTime @default(now())

  @@map("predictions")
}
```

---

## 11. Risk Assessment & Mitigations

### 1. Cost & Load Risks of AI Predicitons
* **Risk:** Citizens uploading heavy image payloads, causing high network traffic and expensive AI GPU processing loads.
* **Mitigation:** Resize and compress images client-side before uploading (using Canvas or compression libraries). Apply strict rate limiting to the prediction route.

### 2. Location Accuracy & Privacy
* **Risk:** Inaccurate device GPS data causing reports to map to the wrong department or area.
* **Mitigation:** Use Geocoding services (e.g., Google Maps API) to let users manually drag a pin and confirm the address overlay rather than relying purely on device coordinates. Use privacy filters to blur sensitive objects in images.

### 3. State Desynchronization
* **Risk:** Officials updating complaint tickets in the field, causing mismatched reports or outdated views on client applications.
* **Mitigation:** Use React Query's `invalidateQueries` to automatically refetch active views. Incorporate SSE (Server-Sent Events) or WebSockets to stream state changes for critical views like the Officer Dashboard.

---

## 12. Operational Production Readiness Checklist

* [ ] **Security:**
  * [ ] Set `NODE_ENV=production`.
  * [ ] Verify Helmet security headers are configured.
  * [ ] Exclude JWT and DB passwords from codebase configs (use Environment secrets).
  * [ ] Enforce HTTPS on all client connections.
* [ ] **Performance & Caching:**
  * [ ] Set up Gzip/Brotli compression in Express.
  * [ ] Configure Redis caching layer for analytics and predictions to prevent redundant database queries.
  * [ ] Enable database connection pooling via Prisma Accelerator or PgBouncer.
* [ ] **Database & Backup Operations:**
  * [ ] Configure daily automated PostgreSQL snapshots.
  * [ ] Verify Prisma schema migrations run successfully on deploy hooks.
  * [ ] Add database indices on location coordinates and status fields.
* [ ] **Logs & Monitoring:**
  * [ ] Configure structured JSON logging with Winston.
  * [ ] Connect an APM monitoring service (such as Datadog or Sentry) to trace unexpected server errors and API latencies.
