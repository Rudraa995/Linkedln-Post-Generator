'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  children: React.ReactNode
  align?: 'start' | 'end'
  className?: string
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode
}

interface DropdownMenuContentProps {
  children: React.ReactNode
  className?: string
}

const DropdownMenu = React.forwardRef<HTMLDivElement, DropdownMenuProps>(
  ({ className, children, align = 'end' }, ref) => (
    <div ref={ref} className={cn('relative inline-block text-left', className)}>
      {children}
    </div>
  ),
)
DropdownMenu.displayName = 'DropdownMenu'

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ children }, ref) => (
  <button ref={ref} className="flex items-center gap-1 text-sm font-medium" aria-haspopup="true">
    {children}
  </button>
))
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in zoom-in duration-200',
        className,
      )}
    >
      <div className="px-2 py-1.5">{children}</div>
    </div>
  ),
)
DropdownMenuContent.displayName = 'DropdownMenuContent'

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
}

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)
DropdownMenuItem.displayName = 'DropdownMenuItem'

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem }
