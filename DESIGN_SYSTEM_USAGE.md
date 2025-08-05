# Design System Usage Guide

## Overview
The Family Budget App design system is implemented using Tailwind CSS with custom extensions. This guide shows how to use the centralized design system instead of styling individual components.

## Setup

### 1. Tailwind Configuration
The design system is configured in `tailwind.config.ts` with:
- Custom color palettes (brand, income, expense)
- Typography scale
- Shadow system
- Animation presets
- Custom utilities

### 2. Design System Components
Import pre-styled components from `components/ui/design-system.tsx`:

```tsx
import { 
  CardIncome, 
  CardExpense, 
  CardSummary,
  HeadingPage,
  CurrencyDisplay,
  ButtonPrimary 
} from '@/components/ui/design-system';
```

## Usage Examples

### Cards
Instead of manually styling cards, use the design system components:

```tsx
// ❌ Don't do this
<div className="bg-white rounded-lg shadow-md p-4 border border-green-200">
  {/* content */}
</div>

// ✅ Do this
<CardIncome>
  {/* content */}
</CardIncome>
```

### Typography
Use semantic typography components:

```tsx
// ❌ Don't do this
<h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
<span className="text-2xl font-semibold">${amount}</span>

// ✅ Do this
<HeadingPage>Dashboard</HeadingPage>
<CurrencyDisplay value={amount} size="large" color="income" />
```

### Colors
Use the extended color palette:

```tsx
// ✅ Using design system colors
<div className="bg-income-light text-income-dark">
<div className="border-expense-primary/20">
<span className="text-brand-primary">
```

### Animations
Use predefined animations:

```tsx
// ✅ Fade up animation
<AnimateIn delay={100}>
  <CardIncome>Content</CardIncome>
</AnimateIn>

// ✅ Using animation classes
<div className="animate-fade-up">
<div className="animate-shimmer">
<div className="animate-float">
```

### Shadows
Use the shadow scale:

```tsx
// ✅ Shadow utilities
<div className="shadow-resting hover:shadow-hover">
<div className="shadow-active">
<div className="shadow-inner-subtle">
```

### Gradients
Apply gradient overlays:

```tsx
// ✅ Gradient backgrounds
<div className="bg-gradient-income">
<div className="bg-gradient-expense">
<div className="bg-gradient-brand">
```

## Common Patterns

### Income Section
```tsx
<section className="space-y-6">
  <HeadingSection>Monthly Income</HeadingSection>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {incomes.map((income, i) => (
      <AnimateIn key={income.id} delay={i * 50}>
        <CardIncome>
          <h3 className="text-subheading mb-2">{income.name}</h3>
          <CurrencyDisplay value={income.amount} size="large" color="income" />
        </CardIncome>
      </AnimateIn>
    ))}
  </div>
</section>
```

### Summary Card
```tsx
<CardSummary>
  <div className="flex justify-between items-start">
    <div>
      <p className="text-gray-500 mb-1">Total Income</p>
      <CurrencyDisplay value={totalIncome} size="large" color="income" />
    </div>
    <StatusIndicator type="positive">
      +12% from last month
    </StatusIndicator>
  </div>
</CardSummary>
```

### Form Inputs
```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Monthly Salary
    </label>
    <InputCurrency 
      placeholder="$0.00"
      value={salary}
      onChange={handleChange}
    />
  </div>
  <ButtonPrimary type="submit">
    Save Changes
  </ButtonPrimary>
</form>
```

### Empty States
```tsx
<EmptyState
  title="No income sources yet"
  description="Add your first income source to get started with your budget"
  action={<ButtonPrimary>Add Income</ButtonPrimary>}
/>
```

### Loading States
```tsx
// Loading cards
<div className="grid grid-cols-3 gap-6">
  {[...Array(3)].map((_, i) => (
    <SkeletonCard key={i} />
  ))}
</div>

// Loading text
<div className="space-y-2">
  <SkeletonText className="w-1/3" />
  <SkeletonText className="w-2/3" />
</div>
```

## Responsive Design
The design system includes responsive utilities:

```tsx
// ✅ Responsive grid
<div className="card-grid"> {/* Automatically responsive */}

// ✅ Responsive spacing
<div className="section-spacing"> {/* py-8 md:py-12 lg:py-16 */}

// ✅ Custom responsive classes
<div className="text-lg md:text-xl lg:text-2xl">
```

## Accessibility
The design system includes accessibility features:

```tsx
// ✅ Focus states
<ButtonPrimary> {/* Includes focus ring */}

// ✅ Reduced motion
<AnimateIn> {/* Respects prefers-reduced-motion */}

// ✅ Color contrast
<CurrencyDisplay> {/* WCAG compliant colors */}
```

## Performance Tips

1. **Use design system components** - They're optimized and consistent
2. **Avoid inline styles** - Use Tailwind utilities
3. **Leverage CSS variables** - For dynamic theming
4. **Use animation wrappers** - For staggered animations
5. **Import only what you need** - Tree-shaking friendly

## Extending the System

To add new patterns, extend the design system:

1. Add to `tailwind.config.ts` for utilities
2. Add to `design-system.tsx` for components
3. Document usage patterns here

Remember: The goal is consistency and maintainability. When in doubt, check if a pattern already exists before creating a new one.