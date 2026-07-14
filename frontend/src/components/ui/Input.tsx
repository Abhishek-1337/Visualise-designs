import React from "react";
import { cn } from "../../utils/cn";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    className?: string;
    type?: string;
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    id?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    className,
    type = "text",
    label,
    description,
    error,
    required = false,
    id,
    leftIcon,
    rightIcon,
    ...props
}, ref) => {
    const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

    const baseInputClasses = "flex h-10 w-full rounded-lg border border-input bg-background text-foreground text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-shadow duration-200 p-4";

    if (type === "checkbox") {
        return (
            <input
                type="checkbox"
                className={cn(
                    "h-4 w-4 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                    className
                )}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    if (type === "radio") {
        return (
            <input
                type="radio"
                className={cn(
                    "h-4 w-4 rounded-full border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                    className
                )}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    return (
        <div className="space-y-1.5">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error ? "text-destructive" : "text-foreground"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                        {leftIcon}
                    </div>
                )}
                <input
                    type={type}
                    className={cn(
                        baseInputClasses,
                        leftIcon && "pl-10",
                        rightIcon && "pr-10",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    ref={ref}
                    id={inputId}
                    {...props}
                />
                {rightIcon && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                        {rightIcon}
                    </div>
                )}
            </div>

            {description && !error && (
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            )}

            {error && (
                <p className="text-xs text-destructive flex items-center gap-1">
                    <span>•</span> {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;
