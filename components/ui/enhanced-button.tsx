"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { useThemeSystem } from "@/hooks/use-theme-system"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "",
        secondary: "",
        ghost: "",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EnhancedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size, 
    asChild = false, 
    loading = false,
    icon,
    iconPosition = "left",
    children,
    disabled,
    ...props 
  }, ref) => {
    const { getButtonStyles, currentTheme } = useThemeSystem()
    const Comp = asChild ? Slot : "button"
    
    // Map variants to theme variants
    const getThemeVariant = (variant: string) => {
      switch (variant) {
        case "default":
          return "primary"
        case "outline":
        case "secondary":
          return "secondary"
        case "ghost":
          return "ghost"
        default:
          return "primary"
      }
    }

    // Get theme-aware button classes
    const themeClasses = currentTheme 
      ? getButtonStyles(getThemeVariant(variant), size || "default", className)
      : ""

    // Handle loading state
    const isDisabled = disabled || loading

    // When using asChild, we need to handle the icon differently
    if (asChild) {
      return (
        <Comp
          className={cn(
            buttonVariants({ variant, size }),
            themeClasses,
            loading && "cursor-wait",
            className
          )}
          ref={ref}
          disabled={isDisabled}
          {...props}
        >
          {children}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          themeClasses,
          loading && "cursor-wait",
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}

        {icon && iconPosition === "left" && !loading && (
          <span className={cn("flex-shrink-0", children && "mr-2")}>
            {icon}
          </span>
        )}

        {children}

        {icon && iconPosition === "right" && !loading && (
          <span className={cn("flex-shrink-0", children && "ml-2")}>
            {icon}
          </span>
        )}
      </Comp>
    )
  }
)
EnhancedButton.displayName = "EnhancedButton"

export { EnhancedButton, buttonVariants }
