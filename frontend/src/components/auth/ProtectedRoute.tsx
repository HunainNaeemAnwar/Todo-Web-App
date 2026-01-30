import React, { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallbackUrl?: string;
}

export default function ProtectedRoute({ 
  children, 
  fallbackUrl = "/login" 
}: ProtectedRouteProps) {
  const { data: session, isPending, refreshSession } = useSession();
  const router = useRouter();
  const redirectedRef = useRef(false);
  const checkedRef = useRef(false);

  const handleRedirect = useCallback(() => {
    if (!redirectedRef.current && !isPending && !session?.user) {
      redirectedRef.current = true;
      router.replace(fallbackUrl);
    }
  }, [session, isPending, fallbackUrl, router]);

  useEffect(() => {
    if (checkedRef.current) {
      handleRedirect();
      return;
    }
    
    checkedRef.current = true;
    
    const checkAndRedirect = async () => {
      if (!session?.user) {
        await refreshSession();
      }
      
      if (!session?.user && !isPending) {
        redirectedRef.current = true;
        router.replace(fallbackUrl);
      }
    };
    
    checkAndRedirect();
  }, [session, isPending, fallbackUrl, router, handleRedirect, refreshSession]);

  if (isPending) {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  return <>{children}</>;
}
