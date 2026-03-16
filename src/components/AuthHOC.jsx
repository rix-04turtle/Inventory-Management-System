import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AuthHOC(WrappedComponent, options = {}) {
  return function WithAuth(props) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const { role } = options;
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      // Don't do anything while authenticating
      if (loading) return;

      // If no user is logged in, redirect to login page
      if (!user) {
        router.replace('/user/logIn');
        return;
      }

      // If roles are specified, check if the user has access
      if (role) {
        // Normalize role requirement to an array
        const allowedRoles = Array.isArray(role) ? role : [role];

        // If user's role is not in the allowed list, redirect depending on their role
        if (!allowedRoles.includes(user.role)) {
          const dashboardRoleMapping = {
            'ADMIN': '/dashboard/admin',
            'RETAILER': '/dashboard/retailer',
            'CUSTOMER': '/dashboard/customer'
          };
          
          router.replace(dashboardRoleMapping[user.role] || '/');
          return;
        }
      }
      
      setIsAuthorized(true);
    }, [user, loading, router, role]);

    // Show a strong loading UI preventing any content leakage
    if (loading || !isAuthorized) {
      return (
        <div className="fixed inset-0 z-[9999] flex flex-col min-h-screen items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
            Verifying access...
          </p>
        </div>
      );
    }

    // Render the wrapped component if all conditions are met
    return <WrappedComponent {...props} />;
  };
}
