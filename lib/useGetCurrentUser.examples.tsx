/**
 * Example Usage of useGetCurrentUser Hook
 * 
 * This file demonstrates how to use the useGetCurrentUser hook
 * in various components throughout your application
 */

'use client';

import { useGetCurrentUser } from '@/lib/useGetCurrentUser';

/**
 * Example 1: Simple User Display Component
 * Shows how to use the hook to display current user information
 */
export function UserProfile() {
  const { user, userDocument, loading, error, isNewUser } = useGetCurrentUser();

  if (loading) {
    return <div className="flex items-center gap-2">
      <span className="loading loading-spinner"></span>
      Loading user data...
    </div>;
  }

  if (error) {
    return <div className="alert alert-error">
      <span>Error: {error}</span>
    </div>;
  }

  if (!user) {
    return <div className="alert alert-info">
      <span>Please log in to view your profile</span>
    </div>;
  }

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title">User Profile</h2>
        
        {/* Display profile picture if available */}
        {user.photoURL && (
          <img 
            src={user.photoURL} 
            alt="Profile" 
            className="w-24 h-24 rounded-full"
          />
        )}
        
        {/* Display user information */}
        <p><strong>Name:</strong> {user.displayName || 'N/A'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>UID:</strong> {user.uid}</p>
        
        {/* Show if this is a new user */}
        {isNewUser && (
          <div className="alert alert-success">
            Welcome! Your profile has been created.
          </div>
        )}
        
        {/* Display MongoDB document ID if exists */}
        {userDocument?._id && (
          <p><strong>Database ID:</strong> {String(userDocument._id)}</p>
        )}
        
        {/* Display creation timestamp */}
        {userDocument?.createdAt && (
          <p>
            <strong>Member Since:</strong> {' '}
            {new Date(userDocument.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Example 2: Conditional Rendering Based on New User Status
 * Shows different content for new users vs returning users
 */
export function UserOnboarding() {
  const { user, loading, isNewUser } = useGetCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div>
      {isNewUser ? (
        <div className="card bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="card-body">
            <h2 className="card-title text-white">Welcome to CloudNerves!</h2>
            <p>It looks like this is your first login. Let's get started!</p>
            <div className="card-actions">
              <button className="btn btn-primary">Complete Profile</button>
              <button className="btn btn-ghost">Skip for Now</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-base-200">
          <div className="card-body">
            <h2 className="card-title">Welcome Back!</h2>
            <p>Glad to see you again, {user.displayName || 'friend'}!</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Protecting Routes Based on Auth Status
 * Shows how to conditionally render based on authentication
 */
export function ProtectedContent() {
  const { user, loading, error } = useGetCurrentUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>There was an error loading your data. Please try again later.</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-warning">
        <span>You must be logged in to access this content.</span>
      </div>
    );
  }

  // User is authenticated and data loaded
  return (
    <div className="p-4">
      <h1>Welcome, {user.displayName}!</h1>
      <p>This content is only visible to authenticated users.</p>
    </div>
  );
}

/**
 * Example 4: User Data with Multiple Provider Information
 * Shows how to access provider data from multiple authentication methods
 */
export function UserProviderInfo() {
  const { user, userDocument, loading } = useGetCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="card bg-base-200">
      <div className="card-body">
        <h2 className="card-title">Authentication Methods</h2>
        
        {userDocument?.providerData && userDocument.providerData.length > 0 ? (
          <div className="space-y-2">
            {userDocument.providerData.map((provider, index) => (
              <div key={index} className="p-2 bg-base-100 rounded">
                <p><strong>Provider:</strong> {provider.providerId}</p>
                <p><strong>Email:</strong> {provider.email || 'N/A'}</p>
                <p><strong>Display Name:</strong> {provider.displayName || 'N/A'}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No provider data available</p>
        )}
      </div>
    </div>
  );
}

/**
 * Example 5: Complete Dashboard Component
 * Combines multiple features of the hook
 */
export function Dashboard() {
  const { user, userDocument, loading, error, isNewUser } = useGetCurrentUser();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="alert alert-info">
        <span>Please log in to access your dashboard</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* User Card */}
        <div className="card bg-base-200 shadow-xl">
          <figure>
            {user.photoURL && (
              <img src={user.photoURL} alt={user.displayName || 'User'} />
            )}
          </figure>
          <div className="card-body">
            <h2 className="card-title">{user.displayName || 'User'}</h2>
            <p>{user.email}</p>
            {isNewUser && (
              <div className="badge badge-success">New Member</div>
            )}
          </div>
        </div>

        {/* Stats Card */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Account Info</h2>
            <div className="divider"></div>
            <p>
              <strong>Member Since:</strong> <br />
              {userDocument?.createdAt
                ? new Date(userDocument.createdAt).toLocaleDateString()
                : 'Today'}
            </p>
            <p>
              <strong>Auth Methods:</strong> <br />
              {userDocument?.providerData?.length || 1} connected
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <div className="card-actions justify-between">
              <button className="btn btn-sm btn-primary">Edit Profile</button>
              <button className="btn btn-sm btn-secondary">Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Example 6: Using the Hook in a Custom Provider Component
 * Wraps the entire app and provides user context to all components
 */
import { createContext, useContext } from 'react';

interface UserContextType {
  user: ReturnType<typeof useGetCurrentUser>['user'];
  userDocument: ReturnType<typeof useGetCurrentUser>['userDocument'];
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user, userDocument, loading, error, isNewUser } = useGetCurrentUser();

  return (
    <UserContext.Provider value={{ user, userDocument, loading, error, isNewUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
