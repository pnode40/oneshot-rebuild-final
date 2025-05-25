# 🎨 OneShot Design Tokens

**Design System Foundation for OneShot Recruiting Platform**
*Version 1.0 - May 23, 2025*

---

## 🎯 Purpose

This document defines the **foundational design tokens** for OneShot's mobile-first athlete recruiting platform. These tokens ensure visual consistency, brand alignment, and scalable design implementation across all UI components.

---

## 🎨 Color System

### Primary Colors (Brand Identity)

```css
:root {
  /* OneShot Primary */
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-300: #7dd3fc;
  --color-primary-400: #38bdf8;
  --color-primary-500: #0ea5e9;  /* Main brand color */
  --color-primary-600: #0284c7;
  --color-primary-700: #0369a1;
  --color-primary-800: #075985;
  --color-primary-900: #0c4a6e;
  --color-primary-950: #082f49;
}
```

### Secondary Colors (Athletic Theme)

```css
:root {
  /* Athletic Green */
  --color-secondary-50: #f0fdf4;
  --color-secondary-100: #dcfce7;
  --color-secondary-200: #bbf7d0;
  --color-secondary-300: #86efac;
  --color-secondary-400: #4ade80;
  --color-secondary-500: #22c55e;  /* Success/Achievement */
  --color-secondary-600: #16a34a;
  --color-secondary-700: #15803d;
  --color-secondary-800: #166534;
  --color-secondary-900: #14532d;
  --color-secondary-950: #052e16;
}
```

### Neutral Colors (Foundation)

```css
:root {
  /* Grayscale for text and backgrounds */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f9fafb;
  --color-neutral-100: #f3f4f6;
  --color-neutral-200: #e5e7eb;
  --color-neutral-300: #d1d5db;
  --color-neutral-400: #9ca3af;
  --color-neutral-500: #6b7280;
  --color-neutral-600: #4b5563;
  --color-neutral-700: #374151;
  --color-neutral-800: #1f2937;
  --color-neutral-900: #111827;
  --color-neutral-950: #030712;
}
```

### Semantic Colors (Status & Feedback)

```css
:root {
  /* Success */
  --color-success-50: #f0fdf4;
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  
  /* Warning */
  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;
  
  /* Error */
  --color-error-50: #fef2f2;
  --color-error-500: #ef4444;
  --color-error-600: #dc2626;
  
  /* Info */
  --color-info-50: #f0f9ff;
  --color-info-500: #3b82f6;
  --color-info-600: #2563eb;
}
```

---

## 📐 Spacing System

### Base Scale (rem units for accessibility)

```css
:root {
  --space-0: 0;
  --space-px: 1px;
  --space-0-5: 0.125rem;  /* 2px */
  --space-1: 0.25rem;     /* 4px */
  --space-1-5: 0.375rem;  /* 6px */
  --space-2: 0.5rem;      /* 8px */
  --space-2-5: 0.625rem;  /* 10px */
  --space-3: 0.75rem;     /* 12px */
  --space-3-5: 0.875rem;  /* 14px */
  --space-4: 1rem;        /* 16px */
  --space-5: 1.25rem;     /* 20px */
  --space-6: 1.5rem;      /* 24px */
  --space-7: 1.75rem;     /* 28px */
  --space-8: 2rem;        /* 32px */
  --space-10: 2.5rem;     /* 40px */
  --space-12: 3rem;       /* 48px */
  --space-16: 4rem;       /* 64px */
  --space-20: 5rem;       /* 80px */
  --space-24: 6rem;       /* 96px */
  --space-32: 8rem;       /* 128px */
}
```

### Component Spacing (Semantic)

```css
:root {
  --spacing-component-xs: var(--space-1);   /* 4px */
  --spacing-component-sm: var(--space-2);   /* 8px */
  --spacing-component-md: var(--space-4);   /* 16px */
  --spacing-component-lg: var(--space-6);   /* 24px */
  --spacing-component-xl: var(--space-8);   /* 32px */
  
  --spacing-section-sm: var(--space-12);    /* 48px */
  --spacing-section-md: var(--space-16);    /* 64px */
  --spacing-section-lg: var(--space-24);    /* 96px */
}
```

---

## 📝 Typography System

### Font Families

```css
:root {
  /* Primary font for headings and emphasis */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Body text font for readability */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Monospace for code and data */
  --font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}
```

### Font Sizes (Responsive Scale)

```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */
}
```

### Font Weights

```css
:root {
  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  --font-weight-extrabold: 800;
}
```

### Line Heights

```css
:root {
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

---

## 🔲 Layout & Sizing

### Breakpoints (Mobile-First)

```css
:root {
  --breakpoint-sm: 640px;   /* Small tablets */
  --breakpoint-md: 768px;   /* Large tablets */
  --breakpoint-lg: 1024px;  /* Laptops */
  --breakpoint-xl: 1280px;  /* Desktops */
  --breakpoint-2xl: 1536px; /* Large desktops */
}
```

### Container Sizes

```css
:root {
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;
}
```

### Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.125rem;    /* 2px */
  --radius-default: 0.25rem; /* 4px */
  --radius-md: 0.375rem;    /* 6px */
  --radius-lg: 0.5rem;      /* 8px */
  --radius-xl: 0.75rem;     /* 12px */
  --radius-2xl: 1rem;       /* 16px */
  --radius-3xl: 1.5rem;     /* 24px */
  --radius-full: 9999px;    /* Fully rounded */
}
```

---

## 🎭 Shadows & Effects

### Box Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-default: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
}
```

### Transitions

```css
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  
  --transition-colors: color 150ms ease-in-out, background-color 150ms ease-in-out, border-color 150ms ease-in-out;
  --transition-transform: transform 150ms ease-in-out;
  --transition-opacity: opacity 150ms ease-in-out;
}
```

---

## 🎨 Component Tokens

### Buttons

```css
:root {
  /* Primary Button */
  --button-primary-bg: var(--color-primary-500);
  --button-primary-bg-hover: var(--color-primary-600);
  --button-primary-text: var(--color-neutral-0);
  --button-primary-border: var(--color-primary-500);
  
  /* Secondary Button */
  --button-secondary-bg: var(--color-neutral-0);
  --button-secondary-bg-hover: var(--color-neutral-50);
  --button-secondary-text: var(--color-neutral-700);
  --button-secondary-border: var(--color-neutral-300);
  
  /* Button Sizes */
  --button-padding-sm: var(--space-2) var(--space-3);
  --button-padding-md: var(--space-2-5) var(--space-4);
  --button-padding-lg: var(--space-3) var(--space-6);
  
  --button-font-size-sm: var(--text-sm);
  --button-font-size-md: var(--text-base);
  --button-font-size-lg: var(--text-lg);
}
```

### Form Elements

```css
:root {
  /* Input Fields */
  --input-bg: var(--color-neutral-0);
  --input-border: var(--color-neutral-300);
  --input-border-focus: var(--color-primary-500);
  --input-text: var(--color-neutral-900);
  --input-placeholder: var(--color-neutral-400);
  --input-padding: var(--space-3) var(--space-4);
  --input-radius: var(--radius-md);
  
  /* Labels */
  --label-text: var(--color-neutral-700);
  --label-font-weight: var(--font-weight-medium);
  --label-font-size: var(--text-sm);
}
```

---

## 📱 Mobile-First Considerations

### Touch Targets

```css
:root {
  --touch-target-min: 44px;  /* iOS minimum */
  --touch-target-android: 48px; /* Android minimum */
  --touch-target-comfortable: 56px; /* Comfortable size */
}
```

### Mobile Spacing Adjustments

```css
@media (max-width: 640px) {
  :root {
    --spacing-section-sm: var(--space-8);   /* Reduced from 48px to 32px */
    --spacing-section-md: var(--space-12);  /* Reduced from 64px to 48px */
    --spacing-section-lg: var(--space-16);  /* Reduced from 96px to 64px */
  }
}
```

---

## 🎯 Usage Guidelines

### Implementation Priority
1. **Foundation First**: Implement color and spacing tokens
2. **Typography**: Establish consistent text hierarchy
3. **Components**: Build reusable component tokens
4. **Mobile Optimization**: Apply mobile-first responsive considerations

### Naming Convention
- Use kebab-case for CSS custom properties
- Include category prefix (color-, space-, text-, etc.)
- Use semantic naming for component-specific tokens

### Maintenance
- **Version Control**: All changes tracked in Git
- **Documentation**: Update this file with any token changes
- **Testing**: Validate tokens in both light and dark themes
- **Performance**: Monitor bundle size impact of token usage

---

**Next Steps**: Implement dark theme variants and accessibility-focused contrast ratios for WCAG AA compliance. 