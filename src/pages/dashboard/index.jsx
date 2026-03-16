import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/user/logIn");
      } else {
        if (user.role === 'ADMIN') {
          router.push('/dashboard/admin');
        } else if (user.role === 'RETAILER') {
          router.push('/dashboard/retailer');
        } else if (user.role === 'CUSTOMER') {
          router.push('/dashboard/customer');
        }
      }
    }
  }, [user, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      Redirecting...
    </div>
  );
}
