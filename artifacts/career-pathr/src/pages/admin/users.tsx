import React from "react";
import { useListAdminUsers, getListAdminUsersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function AdminUsers() {
  const { data: users, isLoading } = useListAdminUsers({
    query: { queryKey: getListAdminUsersQueryKey() },
  });

  if (isLoading) {
    return <div className="container mx-auto p-6"><Skeleton className="h-80 w-full" /></div>;
  }

  const resetPassword = async (userId: number, email: string) => {
    const password = window.prompt(`Enter a new password for ${email} (at least 6 characters):`);
    if (!password) return;
    const response = await fetch(`/api/admin/users/${userId}/password`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    alert(response.ok ? "Password reset successfully." : "Could not reset the password.");
  };

  const deleteUser = async (userId: number, email: string) => {
    if (!window.confirm(`Delete ${email} and all of their assessment data? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (response.ok) window.location.reload();
    else alert("Could not delete the account.");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Student Accounts</h1>
        <p className="text-muted-foreground mt-1">All accounts that have signed up for CareerPathr.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>{users?.length ?? 0} accounts</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right whitespace-nowrap space-x-2">
                    <Button variant="outline" size="sm" onClick={() => resetPassword(user.id, user.email)}>Reset password</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id, user.email)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!users?.length && (
                <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No accounts yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
