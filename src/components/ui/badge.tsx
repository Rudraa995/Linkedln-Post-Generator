'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'

const badgeVariants = cva('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      secondary:
        'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      outline: 'text-foreground border-input',
      success: 'border-transparent bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      warning: 'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      info: 'border-transparent bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info'
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant: variantProp, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant: variantProp }), className)}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
