import type { Metadata } from "next"
import { AvatarSection, EmailSection, NameSection, PasswordSection } from "@/components/settings/profile-forms"
import { requireUser } from "@/server/context"

export const metadata: Metadata = { title: "Perfil" }

export default async function ProfileSettingsPage() {
  const u = await requireUser()
  const user = {
    name: u.name,
    email: u.email,
    image: u.image,
    emailVerified: u.emailVerified,
    hasPassword: Boolean(u.passwordHash),
  }
  return (
    <>
      <AvatarSection user={user} />
      <NameSection user={user} />
      <EmailSection user={user} />
      <PasswordSection user={user} />
    </>
  )
}
