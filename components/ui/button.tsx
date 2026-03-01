import * as React from 'react';

import { cn } from '@/lib/utils';

type ButtonIntent = 'primary' | 'secondary' | 'neutral';
type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-base',
};

function intentVariantStyles(intent: ButtonIntent, variant: ButtonVariant): string {
  if (variant === 'ghost') {
    return 'bg-transparent text-[var(--bp-text)] border border-transparent hover:bg-[color-mix(in_oklab,var(--bp-border)_18%,transparent)]';
  }
  if (variant === 'outline') {
    if (intent === 'secondary') return 'bg-transparent text-[var(--bp-accent)] border border-[var(--bp-border)] hover:bg-[color-mix(in_oklab,var(--bp-accent)_10%,transparent)]';
    return 'bg-transparent text-[var(--bp-text)] border border-[var(--bp-border)] hover:bg-[color-mix(in_oklab,var(--bp-border)_10%,transparent)]';
  }
  if (intent === 'secondary') return 'bg-[var(--bp-accent)] text-[var(--bp-on-accent)] border border-[var(--bp-border)] hover:brightness-95';
  if (intent === 'neutral') return 'bg-[var(--bp-surface)] text-[var(--bp-text)] border border-[var(--bp-border)] hover:bg-[color-mix(in_oklab,var(--bp-border)_10%,var(--bp-surface))]';
  return 'bg-[var(--bp-primary)] text-[var(--bp-on-primary)] border border-[var(--bp-border)] hover:brightness-95';
}

const FORBIDDEN_CLASS_RE = /(\bbg-|\btext-|\bborder-|\brounded-|\bshadow-|\bring-)/;

function sanitizeClassName(input?: string): string {
  if (!input) return '';
  return input
    .split(/\s+/)
    .filter(Boolean)
    .filter((cls) => !FORBIDDEN_CLASS_RE.test(cls))
    .join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  intent?: ButtonIntent;
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const baseClass =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--bp-accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-[var(--bp-radius-button,12px)]';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent = 'primary', variant = 'solid', size = 'md', asChild = false, children, ...props }, ref) => {
    const safeClassName = sanitizeClassName(className);
    const classes = cn(baseClass, sizeStyles[size], intentVariantStyles(intent, variant), safeClassName);

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button className={classes} ref={ref} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
