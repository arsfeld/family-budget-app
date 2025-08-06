export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Family Budget App
        </h1>
        <p className="text-muted-foreground mb-8 text-center text-xl">
          Track expenses, manage budgets, and gain insights with AI
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/signup"
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-semibold"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-lg border px-6 py-3 font-semibold"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
