import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { AIOnboarding } from '@/components/ai-onboarding/onboarding'

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }
  
  // Check if onboarding is already complete
  const onboarding = await db.familyOnboarding.findUnique({
    where: { familyId: session.user.familyId }
  })
  
  if (onboarding?.completedAt) {
    redirect('/dashboard')
  }
  
  return <AIOnboarding />
}