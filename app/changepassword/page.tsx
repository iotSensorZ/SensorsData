"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ChangePassword = () => {
  const { data: session } = useSession(); // Get the session data
  const router = useRouter(); // To programmatically navigate
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(""); // State for error messages

  const handleChangePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission

    // Make a POST request to change password
    const res = await fetch("/api/changepassword", {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Ensure the Content-Type is set to application/json
      },
      body: JSON.stringify({
        email: session?.user?.email, // Pass the user's email from the session
        currentPassword,
        newPassword,
      }),
    });

    if (res.ok) {
      // Password change was successful
      router.push("/private/dashboard"); // Redirect after successful change
    } else {
      const { message } = await res.json();
      setError(message); // Display error message if password change fails
    }
  };

  return (
    // <div className="mt-10 max-w-md w-full mx-auto p-4 rounded-lg shadow-md bg-white">
    //   <h2 className="text-xl font-bold">Change Password</h2>
    //   {error && <p className="text-red-500">{error}</p>} {/* Display error message */}
    //   <form onSubmit={handleChangePassword} className="my-4">
    //     <Label htmlFor="currentPassword">Current Password</Label>
    //     <Input
    //       id="currentPassword"
    //       type="password"
    //       value={currentPassword}
    //       onChange={(e) => setCurrentPassword(e.target.value)}
    //       required
    //     />
        
    //     <Label htmlFor="newPassword">New Password</Label>
    //     <Input
    //       id="newPassword"
    //       type="password"
    //       value={newPassword}
    //       onChange={(e) => setNewPassword(e.target.value)}
    //       required
    //     />

    //     <button type="submit" className="mt-4 bg-blue-500 text-white rounded-md p-2">
    //       Change Password
    //     </button>
    //   </form>
    // </div>





<div className="mt-10 max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white border border-[#121212] dark:bg-black">
<form onSubmit={handleChangePassword} className="my-8">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required placeholder="******" 
        />
<Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required placeholder="******" 
        />

  <button className="mt-5 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]">
    Change Password
  </button>

  <p className="text-right text-neutral-600 text-sm max-w-sm mt-4 dark:text-neutral-300">
   Already have an account? <Link href="/login">Login</Link>
  </p>

  <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />
</form>

</div>

  );
};

export default ChangePassword;
