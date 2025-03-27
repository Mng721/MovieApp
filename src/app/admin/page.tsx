import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { db } from "~/server/db";

export default async function AdminPage() {
    const session = await auth();
    if (!session || !session.user.roleId) redirect("/");

    const role = await db.query.roles.findFirst({
        where: (roles, { eq }) => eq(roles.id, session.user.roleId),
    });

    if (role?.name !== "admin") redirect("/");

    return (
        <div className="p-4">
            <h1 className="text-2xl">Admin Dashboard</h1>
            <p>Welcome, {session.user.email}</p>
        </div>
    );
}