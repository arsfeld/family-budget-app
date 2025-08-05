export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-center text-4xl font-bold">
          Family Budget App
        </h1>
        <p className="mb-8 text-center text-xl text-muted-foreground">
          Track expenses, manage budgets, and gain insights with AI
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/signup"
            className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-lg border border-input bg-background px-6 py-3 font-semibold hover:bg-accent hover:text-accent-foreground"
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}