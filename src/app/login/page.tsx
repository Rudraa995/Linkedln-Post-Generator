'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const VALID_USERNAME = 'rudraa@995'
const VALID_PASSWORD = '12345678'

export default function LoginPage() {
 const router = useRouter()
 const [username, setUsername] = useState('')
 const [password, setPassword] = useState('')
 const [error, setError] = useState<string | null>(null)
 const [loading, setLoading] = useState(false)

 const handleLogin = (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError(null)
  setTimeout(() => {
   if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    if (typeof window !== 'undefined') {
     localStorage.setItem('linkedin_creator_auth', 'true')
     localStorage.setItem('linkedin_creator_user', username)
    }
    router.push('/dashboard')
   } else {
    setError('Invalid username or password.')
   }
   setLoading(false)
  }, 300)
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-background px-4">
   <Card className="w-full max-w-md">
    <CardHeader className="text-center space-y-2">
     <div className="mx-auto w-12 h-12 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-semibold">
      LA
     </div>
     <CardTitle className="text-2xl">Welcome back</CardTitle>
     <CardDescription>Sign in to your linkedlnAI account</CardDescription>
    </CardHeader>
    <CardContent>
     <form onSubmit={handleLogin} className="space-y-4">
      {error && (
       <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
        {error}
       </div>
      )}
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Username</label>
       <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
         value={username}
         onChange={(e) => setUsername(e.target.value)}
         placeholder="Enter username"
         className="pl-9"
         autoComplete="username"
        />
       </div>
      </div>
      <div className="space-y-2">
       <label className="text-sm font-medium text-foreground">Password</label>
       <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
         type="password"
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         placeholder="Enter password"
         className="pl-9"
         autoComplete="current-password"
        />
       </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
       {loading ? 'Signing in…' : 'Sign In'}
      </Button>
     </form>
    </CardContent>
   </Card>
  </div>
 )
}