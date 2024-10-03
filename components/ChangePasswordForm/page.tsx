// app/changepassword/ChangePasswordForm.tsx
'use client'; // This is a Client Component

import { useState } from "react";
import { Input } from "@/components/ui/input"; // Make sure to import your Input component
import { Button } from "@/components/ui/button"; // Import your Button component
import { toast } from "react-toastify"; // Example notification library
import { useRouter } from "next/navigation";
import { Label } from "../ui/label";

interface ChangePasswordFormProps {
  userId: string; // Accept user ID as a prop
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ userId }) => {
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/users/${userId}/changepassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      toast.success("Password changed successfully");
      router.push("/private/dashboard"); // Redirect after successful change
    } catch (error:any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="mt-10 max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white border border-[#121212] dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Change Password
      </h2>

      <form onSubmit={handleChangePassword} className="my-8">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          placeholder="******"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <Button className="mt-4" type="submit">
          Change Password
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
