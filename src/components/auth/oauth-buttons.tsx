import { Button } from "@/components/ui/button"
import { oauthSignInAction } from "@/server/actions/auth"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 23.5 12C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  )
}

export function OAuthButtons({
  providers,
  callbackUrl,
}: {
  providers: { google: boolean; github: boolean }
  callbackUrl?: string
}) {
  if (!providers.google && !providers.github) return null
  return (
    <>
      <div className="grid gap-2 sm:grid-cols-2">
        {providers.google && (
          <form action={oauthSignInAction}>
            <input type="hidden" name="provider" value="google" />
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
            <Button variant="outline" size="lg" className="h-10 w-full">
              <GoogleIcon /> Google
            </Button>
          </form>
        )}
        {providers.github && (
          <form action={oauthSignInAction}>
            <input type="hidden" name="provider" value="github" />
            <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
            <Button variant="outline" size="lg" className="h-10 w-full">
              <GitHubIcon /> GitHub
            </Button>
          </form>
        )}
      </div>
      <div className="relative my-6 text-center text-xs text-muted-foreground">
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="relative bg-background px-3">ou continue com email</span>
      </div>
    </>
  )
}
