import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-heading font-bold">Forgot your password?</h1>
        <p className="text-muted-foreground mt-3">Ask an administrator to reset your password from the Admin Users page. For privacy, this local version does not send reset emails.</p>
        <Button className="mt-6" asChild><Link href="/login">Back to log in</Link></Button>
      </div>
    </div>
  );
}
