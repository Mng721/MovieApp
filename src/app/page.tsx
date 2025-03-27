import { auth } from "~/server/auth";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  return (
    <div className="p-4">
      <h1 className="text-2xl">Home</h1>
      {session ? (
        <div>
          <p>Welcome, {session.user.email} </p>
          <p>role: {session.user.roleId}</p>
        </div>

      ) : (
        <div>
          <Link href="/login" className="text-blue-500">Login</Link> |{" "}
          <Link href="/register" className="text-blue-500">Register</Link>
        </div>
      )}

      <Link
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      >

        {session ? "Sign out" : ""}
      </Link>
    </div>
  );
}