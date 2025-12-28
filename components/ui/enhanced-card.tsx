"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"

const cardVariants = cva(
  "rounded-lg border text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-lg hover:shadow-xl",
        outlined: "border-2",
        ghost: "border-transparent shadow-none",
        gradient: "bg-gradient-to-br",
      },
      size: {
        sm: "p-3",
        default: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer transition-all duration-200 hover:scale-[1.02]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
)

export interface EnhancedCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  loading?: boolean
  header?: React.ReactNode
  footer?: React.ReactNode
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default",
    interactive = false,
    loading = false,
    header,
    footer,
    children,
    ...props 
  }, ref) => {
    const { getCardStyles, currentTheme, getStyles } = useThemeSystem()
    
    // Get theme-aware card classes
    const themeClasses = currentTheme ? getCardStyles(className) : ""

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive }),
          themeClasses,
          loading && "animate-pulse",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          <>
            {header && (
              <div className={cn(
                "border-b pb-4 mb-4",
                currentTheme ? getStyles("border.primary") : "border-border"
              )}>
                {header}
              </div>
            )}
            
            <div className="flex-1">
              {children}
            </div>
            
            {footer && (
              <div className={cn(
                "border-t pt-4 mt-4",
                currentTheme ? getStyles("border.primary") : "border-border"
              )}>
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    )
  }
)
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { getStyles, currentTheme } = useThemeSystem()
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        currentTheme ? getStyles("text.primary") : "",
        className
      )}
      {...props}
    />
  )
})
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { getStyles, currentTheme } = useThemeSystem()
  
  return (
    <h3
      ref={ref}
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        currentTheme ? getStyles("text.primary") : "",
        className
      )}
      {...props}
    />
  )
})
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { getStyles, currentTheme } = useThemeSystem()
  
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        currentTheme ? getStyles("text.secondary") : "text-muted-foreground",
        className
      )}
      {...props}
    />
  )
})
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
}
