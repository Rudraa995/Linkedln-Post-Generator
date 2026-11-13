export const metadata = {
 title: 'AI Profile',
}

import ProfileForm from '@/components/profile/ProfileForm'

export default function ProfilePage() {
 return (
 <div className="space-y-4">
 <h1 className="text-2xl font-semibold tracking-tight">AI Profile</h1>
 <p className="text-muted-foreground">
 Manage your professional background. The AI uses this information to
 generate personalized LinkedIn posts that reflect your real experience.
 </p>
 <ProfileForm />
 </div>
 )
}
