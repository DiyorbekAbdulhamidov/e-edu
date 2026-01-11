# e-edu CRM - Multi-Tenant Education Management System

## Features
- Multi-tenant architecture
- Role-based access control (SuperAdmin, CenterAdmin, Teacher, Student, Parent)
- Student management
- Group & course management
- Attendance tracking
- Payment processing
- Teacher performance analytics
- Automated salary calculations
- Comprehensive reporting

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript 5.7
- Firebase (Auth + Firestore)
- Tailwind CSS 3.4

## Setup

1. Clone repository
```bash
git clone <repo-url>
cd e-edu-crm
```

2. Install dependencies
```bash
npm install
```

3. Configure Firebase
```bash
cp .env.example .env.local
# Add your Firebase credentials
```

4. Deploy Firestore indexes
```bash
firebase deploy --only firestore:indexes
```

5. Run development server
```bash
npm run dev
```

## Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'superadmin';
    }
    
    function isCenterAdmin(centerId) {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'centeradmin' &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.centerId == centerId;
    }
    
    match /centers/{centerId} {
      allow read: if isSuperAdmin() || isCenterAdmin(centerId);
      allow create: if isSuperAdmin();
      allow update: if isSuperAdmin() || isCenterAdmin(centerId);
    }
    
    match /students/{studentId} {
      allow read: if isAuthenticated() && 
        (isSuperAdmin() || isCenterAdmin(resource.data.centerId));
      allow write: if isCenterAdmin(request.resource.data.centerId);
    }
    
    match /groups/{groupId} {
      allow read, write: if isAuthenticated() && 
        (isSuperAdmin() || isCenterAdmin(resource.data.centerId));
    }
    
    match /attendance/{attendanceId} {
      allow read, write: if isAuthenticated() && 
        (isSuperAdmin() || isCenterAdmin(resource.data.centerId));
    }
    
    match /payments/{paymentId} {
      allow read, write: if isAuthenticated() && 
        (isSuperAdmin() || isCenterAdmin(resource.data.centerId));
    }
    
    match /teachers/{teacherId} {
      allow read, write: if isAuthenticated() && 
        (isSuperAdmin() || isCenterAdmin(resource.data.centerId));
    }
  }
}
```

## Deployment
```bash
npm run build
npm run start
```

## License
Proprietary