'use client';

import { useAuth } from './contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [authState, router]);


  return (
    <>
      {children}
      <ChatInterface />
    </>
  );
}