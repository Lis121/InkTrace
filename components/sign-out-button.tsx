"use client"

import { Button } from "@/components/ui/button"
import { signout } from "@/app/(auth)/auth-actions"

export function SignOutButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => signout()}
        >
            Logga ut
        </Button>
    )
}
