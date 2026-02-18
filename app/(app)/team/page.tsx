import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AddMemberDialog } from "@/components/team/add-member-dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, UserCog } from "lucide-react"

export default async function TeamPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    // Check if owner
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, studio_id")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "owner") {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Users className="w-12 h-12 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">Åtkomst nekad</h2>
                <p>Endast ägare kan hantera teamet.</p>
            </div>
        )
    }

    // Fetch studio members
    // Note: We can't fetch email/last_sign_in without admin client or a view.
    // For now, we fetch profiles. Emails are not in profiles by default unless stored there.
    // OPTION: We could update the 'createTeamMember' to store email in metadata or profile if needed.
    // But let's check what we can get. The 'profiles' table usually doesn't have email in this schema?
    // User requested "Columns: Namn | Email | Roll".
    // Since we don't store email in public.profiles (usually good practice to keep it private),
    // we might need to display just name/role OR use the server action to fetch users via Admin API for this list.

    // Let's try to do it via a quick admin fetch if possible, effectively "joining" auth.users.
    // We can't do this easily in pure SQL from the client unless we have a secure view.
    // BUT! Since this is a Server Component, we CAN use the admin client if we have the key.

    let members = []

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { createClient: createAdmin } = require('@supabase/supabase-js')
        const admin = createAdmin(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY, {
            auth: { persistSession: false }
        })

        // Fetch profiles first
        const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .eq("studio_id", profile.studio_id)
            .order("full_name")

        if (profiles && profiles.length > 0) {
            // Fetch users from auth to match emails
            const userIds = profiles.map((p: any) => p.id)
            // Admin listUsers doesn't support "in array" easily for IDs, we might have to list all or loop.
            // Or just list users and filter.
            // But listUsers is paginated.

            // Simpler: Just render profiles. Add email column to profiles if strictly needed,
            // or accept that for now we might not show email in the list until we have a better way.
            // Wait, for "Mitt Team", seeing email is important.

            // Let's try to get user data for each profile.
            const { data: { users }, error } = await admin.auth.admin.listUsers({
                perPage: 1000 // simplified for MVP
            })

            if (users) {
                members = profiles.map((p: any) => {
                    const u = users.find((u: any) => u.id === p.id)
                    return {
                        ...p,
                        email: u?.email,
                        last_sign_in_at: u?.last_sign_in_at
                    }
                })
            } else {
                members = profiles
            }
        }
    } else {
        // Fallback if no admin key (shouldn't happen given the requirement)
        const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .eq("studio_id", profile.studio_id)
            .order("full_name")
        members = profiles || []
    }

    return (
        <div className="flex flex-col gap-6 p-4 sm:px-6 sm:py-8 container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Users className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Mitt Team</h1>
                        <p className="text-muted-foreground">Hantera personal och behörigheter.</p>
                    </div>
                </div>
                <AddMemberDialog />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Namn</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roll</TableHead>
                            <TableHead>Senast inloggad</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {members.map((member: any) => (
                            <TableRow key={member.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <span className="text-xs font-bold text-slate-600">
                                                {member.full_name?.substring(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                        {member.full_name}
                                        {member.id === user.id && <Badge variant="secondary" className="ml-2 text-[10px]">Du</Badge>}
                                    </div>
                                </TableCell>
                                <TableCell>{member.email || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={member.role === 'owner' ? "default" : "outline"}>
                                        {member.role === 'owner' ? 'Ägare' :
                                            member.role === 'apprentice' ? 'Lärling' : 'Artist'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {member.last_sign_in_at ? new Date(member.last_sign_in_at).toLocaleDateString() : "Aldrig"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Aktiv
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export const runtime = 'edge'
