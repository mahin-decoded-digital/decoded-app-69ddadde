import * as React from "react"
import { cn } from "@/lib/utils"

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
  )
)
Avatar.displayName = "Avatar"

function AvatarImage({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const [error, setError] = React.useState(false)
  if (!src || error) return null
  return <img src={src} alt={alt} onError={() => setError(true)} className={cn("aspect-square h-full w-full", className)} />
}

function AvatarFallback({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)}>
      {children}
    </div>
  )
}

export { Avatar, AvatarFallback, AvatarImage }
