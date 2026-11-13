'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
 label?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
 ({ className, label, ...props }, ref) => {
 return (
 <div className="w-full">
 {label && (
 <label className="block text-sm font-medium text-muted-foreground mb-1">
 {label}
 </label>
 )}
 <select
 ref={ref}
 className={cn(
 'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
 className,
 )}
 {...props}
 />
 </div>
 )
 },
)
Select.displayName = 'Select'

export { Select }
