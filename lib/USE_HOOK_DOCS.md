# useGetCurrentUser Hook Documentation

## Overview

`useGetCurrentUser` is a reusable React hook that manages user authentication and MongoDB persistence for a Next.js application. It detects the current logged-in user, checks if they exist in MongoDB, and automatically saves new users on their first login.

## Features

✅ **Firebase Authentication Integration**
- Detects current logged-in user using Firebase Auth
- Handles page refreshes and session restoration
- Monitors auth state changes in real-time

✅ **MongoDB User Persistence**
- Checks if user exists in MongoDB by uid
- Automatically saves new users on first login
- Prevents duplicate user documents
- Stores complete user information

✅ **First Login Detection**
- Identifies new users vs returning users
- Perfect for triggering onboarding flows
- Returns `isNewUser` flag in response

✅ **Error Handling**
- Graceful error recovery
- Continues auth flow even if database fails
- Detailed error messages for debugging

✅ **Performance Optimized**
- Prevents duplicate API calls using refs
- Reuses MongoDB connections (connection pooling)
- Minimal re-renders with proper dependencies

## Installation

### 1. Dependencies

Make sure you have the required packages installed:

```bash
npm install firebase mongodb next react react-dom
```

### 2. Environment Variables

Create `.env.local` with MongoDB and Firebase configuration:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=Cluster0
```

## Usage

### Basic Usage

```typescript
'use client';

import { useGetCurrentUser } from '@/lib/useGetCurrentUser';

export function MyComponent() {
  const { user, userDocument, loading, error, isNewUser } = useGetCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      {isNewUser && <p>This is your first login!</p>}
    </div>
  );
}
```

### With Components

```typescript
'use client';

import { useGetCurrentUser } from '@/lib/useGetCurrentUser';

export function Dashboard() {
  const { user, userDocument, loading, error, isNewUser } = useGetCurrentUser();

  if (loading) {
    return (
      <div className="flex justify-center">
        <span className="loading loading-spinner"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">Error: {error}</div>;
  }

  if (!user) {
    return <div className="alert alert-info">Please log in</div>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <h1>Dashboard</h1>
        <p>Email: {user.email}</p>
        <p>Name: {user.displayName}</p>
        
        {isNewUser && (
          <div className="alert alert-success">
            Welcome! Your profile has been created.
          </div>
        )}
      </div>
    </div>
  );
}
```

## Return Values

### `user`
- **Type**: `FirebaseUser | null`
- **Description**: The current Firebase user object
- **Contains**:
  - `uid`: Firebase unique identifier
  - `email`: User email address
  - `displayName`: User display name (if provided)
  - `photoURL`: User profile picture URL
  - `phoneNumber`: User phone number
  - `providerData`: Array of provider information

### `userDocument`
- **Type**: `UserDocument | null`
- **Description**: The user document from MongoDB
- **Contains**:
  - `uid`: Firebase UID (same as in `user`)
  - `displayName`: User's display name
  - `email`: User's email
  - `photoURL`: Profile picture URL
  - `phoneNumber`: Phone number
  - `providerData`: Connected authentication methods
  - `createdAt`: Account creation timestamp
  - `updatedAt`: Last update timestamp

### `loading`
- **Type**: `boolean`
- **Description**: True while checking Firebase auth and MongoDB
- **Usage**: Show loading spinner or skeleton while true

### `error`
- **Type**: `string | null`
- **Description**: Error message if something went wrong
- **Note**: Auth continues even if error occurs

### `isNewUser`
- **Type**: `boolean`
- **Description**: True if this is the user's first login
- **Usage**: Trigger onboarding flows, show welcome message

## How It Works

### Step 1: Firebase Authentication Check
```
User opens app
    ↓
Hook detects Firebase auth state
    ↓
Firebase checks cached session or prompts login
    ↓
user object is set
```

### Step 2: MongoDB Existence Check
```
Firebase user detected
    ↓
Hook calls GET /api/users/[uid]
    ↓
User found in MongoDB?
    ├─ YES → Fetch and return user document (isNewUser = false)
    └─ NO → Continue to Step 3
```

### Step 3: First Login - Save to MongoDB
```
User not found in MongoDB
    ↓
Prepare user document with:
    - uid, email, displayName
    - photoURL, phoneNumber
    - providerData, timestamps
    ↓
POST to /api/users
    ↓
MongoDB saves new user document
    ↓
Return document (isNewUser = true)
```

### Step 4: Page Refresh/Session Restore
```
User refreshes page
    ↓
Firebase restores session automatically
    ↓
Hook detects user and skips duplicate checks
    ↓
User already exists in MongoDB
    ↓
Return cached document
```

## API Endpoints

### POST /api/users
Create a new user document in MongoDB

**Request**:
```javascript
{
  uid: "firebase-uid-123",
  displayName: "John Doe",
  email: "john@example.com",
  photoURL: "https://...",
  phoneNumber: null,
  providerData: [...],
  createdAt: "2024-11-21T10:00:00Z",
  updatedAt: "2024-11-21T10:00:00Z"
}
```

**Response** (201):
```javascript
{
  _id: "mongo-id-456",
  uid: "firebase-uid-123",
  displayName: "John Doe",
  email: "john@example.com",
  createdAt: "2024-11-21T10:00:00Z",
  updatedAt: "2024-11-21T10:00:00Z"
}
```

### GET /api/users/[uid]
Fetch user by Firebase UID

**Response** (200):
```javascript
{
  _id: "mongo-id-456",
  uid: "firebase-uid-123",
  displayName: "John Doe",
  email: "john@example.com",
  ...
}
```

**Response** (404):
```javascript
{ error: "User not found" }
```

### PUT /api/users/[uid]
Update user document

**Request**:
```javascript
{
  displayName: "John Updated",
  photoURL: "https://new-photo.url"
}
```

**Response** (200):
```javascript
{
  _id: "mongo-id-456",
  displayName: "John Updated",
  photoURL: "https://new-photo.url",
  updatedAt: "2024-11-21T12:00:00Z"
}
```

### DELETE /api/users/[uid]
Delete user document

**Response** (200):
```javascript
{ message: "User deleted successfully" }
```

## Common Patterns

### 1. Protected Component

```typescript
function ProtectedPage() {
  const { user, loading } = useGetCurrentUser();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" />;

  return <div>Protected content here</div>;
}
```

### 2. Onboarding on First Login

```typescript
function App() {
  const { user, isNewUser, loading } = useGetCurrentUser();

  if (loading) return <Spinner />;
  if (!user) return <LoginPage />;

  return (
    <div>
      {isNewUser ? <OnboardingFlow /> : <Dashboard />}
    </div>
  );
}
```

### 3. Context Provider

```typescript
// Create context
const UserContext = createContext();

export function UserProvider({ children }) {
  const userState = useGetCurrentUser();
  return (
    <UserContext.Provider value={userState}>
      {children}
    </UserContext.Provider>
  );
}

// Use in components
function MyComponent() {
  const { user } = useContext(UserContext);
  return <div>{user?.email}</div>;
}
```

### 4. Update User Profile

```typescript
async function updateProfile(displayName: string) {
  const response = await fetch(`/api/users/${user.uid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName })
  });
  const updated = await response.json();
  setUser(updated);
}
```

## Error Handling

The hook gracefully handles errors:

```typescript
const { user, error } = useGetCurrentUser();

if (error) {
  // Error could be:
  // - Firebase auth error
  // - MongoDB connection error
  // - User creation failure
  // - Network timeout
  
  console.log(error);
  // Auth continues anyway - user is still set
}
```

## Performance Considerations

### 1. Connection Pooling
MongoDB connections are cached and reused across API calls. No new connection per request.

### 2. Duplicate Prevention
The hook uses a `Set` to prevent duplicate API calls for the same user.

### 3. Lazy Loading
User data is only fetched when needed, not on every component render.

### 4. Minimal Re-renders
Proper dependency arrays ensure minimal re-renders.

## TypeScript Support

Full TypeScript support with exported types:

```typescript
import type { 
  UserDocument, 
  UseCurrentUserReturn 
} from '@/lib/useGetCurrentUser';

function MyComponent(): UseCurrentUserReturn {
  return useGetCurrentUser();
}
```

## MongoDB Schema

The hook creates documents with this schema:

```javascript
{
  _id: ObjectId,
  uid: String (unique, indexed),
  displayName: String,
  email: String,
  photoURL: String,
  phoneNumber: String,
  providerData: Array[
    {
      uid: String,
      displayName: String,
      email: String,
      photoURL: String,
      providerId: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### Issue: User not saving to MongoDB
- Check MongoDB connection string in `.env.local`
- Verify Firebase user is logged in
- Check browser console for errors
- Ensure `/api/users` endpoint is accessible

### Issue: User documents appearing multiple times
- The hook prevents this with duplicate checks
- If it happens, manually clean MongoDB collection

### Issue: Performance slow on first login
- MongoDB is slower on first request
- Connections are cached on subsequent logins
- Add loading indicator while data loads

### Issue: `undefined` user on refresh
- Firebase session restore takes ~100-200ms
- Show loading state until user is available
- Use `loading` flag to handle this

## Testing

```typescript
// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: mockAuth
}));

// Mock fetch
global.fetch = jest.fn();

test('loads user on mount', async () => {
  const { result } = renderHook(() => useGetCurrentUser());
  
  expect(result.current.loading).toBe(true);
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  
  expect(result.current.user).toBeDefined();
});
```

## Best Practices

1. ✅ **Always check `loading` state** before rendering user data
2. ✅ **Handle errors gracefully** - auth continues even if DB fails
3. ✅ **Use `isNewUser`** to guide user flow
4. ✅ **Cache connections** - MongoDB pooling is enabled
5. ✅ **Protect routes** - Check for user before rendering
6. ✅ **Use in client components** - Add `'use client'` directive
7. ✅ **Type user data** - Use TypeScript for safety
8. ✅ **Test thoroughly** - Test auth, DB, and error flows

## License

This hook is part of the CloudNerves project.
