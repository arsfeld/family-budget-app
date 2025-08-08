import { Metadata } from 'next'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AIChat } from '@/components/ai-chat/full-page-chat'

export const metadata: Metadata = {
  title: 'AI Assistant | Family Budget App',
  description: 'Chat with your AI budget assistant',
}

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="h-full flex flex-col">
      <AIChat />
    </div>
  )
}