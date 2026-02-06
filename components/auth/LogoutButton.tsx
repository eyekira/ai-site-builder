'use client';

import { signOut } from 'next-auth/react';

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className}
    >
      Logout
    </button>
  );
}
