# Family Budget App - Style Guide

## Design Philosophy

The Family Budget App embraces **simplicity and clarity** over feature complexity. Every design decision should support the core goal: providing families with an instant, comprehensive view of their monthly financial situation.

## Visual Design Principles

### 1. Single-Page Focus

- **Everything visible at once** - No navigation, tabs, or hidden sections
- **Vertical flow** - Income → Expenses → Summary, in that order
- **No scrolling on desktop** - All critical information above the fold
- **Logical grouping** - Related information clustered together

### 2. Sophisticated Minimalism

- **Purposeful elegance** - Every element refined and intentional
- **Generous whitespace** - Premium feel through breathing room
- **Subtle depth** - Layered elements with soft shadows
- **Refined details** - Micro-interactions and transitions that delight

### 3. Color System

```
Brand Colors:
- Primary: #6366F1 (indigo-500) - Trust and stability
- Accent: #8B5CF6 (violet-500) - Premium touches

Income Palette:
- Primary: #10B981 (emerald-500)
- Light: #D1FAE5 (emerald-100)
- Dark: #065F46 (emerald-800)
- Glow: rgba(16, 185, 129, 0.1) for backgrounds

Expense Palette:
- Primary: #F59E0B (amber-500)
- Light: #FEF3C7 (amber-100)
- Dark: #92400E (amber-800)
- Glow: rgba(245, 158, 11, 0.1) for backgrounds

Neutral Palette:
- Background: #FAFAFA (off-white with warmth)
- Surface: #FFFFFF with subtle shadows
- Border: #E5E7EB (gray-200)
- Text Primary: #1F2937 (gray-800)
- Text Secondary: #6B7280 (gray-500)
- Text Muted: #9CA3AF (gray-400)

Gradient Overlays:
- Income cards: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 100%)
- Expense cards: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(245, 158, 11, 0) 100%)
- Premium sections: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)
```

### 4. Depth & Elevation

```
Shadow System:
- Resting: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)
- Hover: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)
- Active: 0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.08)
- Modal: 0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.04)

Border Radius:
- Small elements: 8px
- Cards: 12px
- Modals: 16px
- Buttons: 8px with 10px for special CTAs

Glassmorphism (for premium elements):
- Background: rgba(255, 255, 255, 0.8)
- Backdrop-filter: blur(10px)
- Border: 1px solid rgba(255, 255, 255, 0.18)
```

### 5. Typography

```
Font Family:
- Headers: 'Inter', -apple-system, system-ui, sans-serif
- Body: 'Inter', -apple-system, system-ui, sans-serif
- Numbers: 'JetBrains Mono', 'SF Mono', monospace

Font Sizes:
- Page title: 2.5rem (40px) - Font weight: 700
- Section headers: 1.875rem (30px) - Font weight: 600
- Card headers: 1.25rem (20px) - Font weight: 600
- Body text: 1rem (16px) - Font weight: 400
- Small text: 0.875rem (14px) - Font weight: 400
- Currency values: 1.375rem (22px) - Font weight: 600

Letter Spacing:
- Headers: -0.02em (tighter)
- Body: 0
- Numbers: 0.02em (looser for clarity)
- Small caps: 0.05em
```

### 6. Layout Structure

```
Desktop (1024px+):
- Max width: 1280px centered
- 3-column grid for income/expense sections
- Side-by-side budget scenario comparison
- 24px gap between cards
- 48px section spacing

Tablet (768px-1023px):
- 2-column grid where appropriate
- Stack budget scenarios vertically
- 20px gap between cards
- 36px section spacing

Mobile (< 768px):
- Single column layout
- Collapsible sections for space efficiency
- Sticky summary header
- 16px gap between cards
- 32px section spacing
```

## Component Guidelines

### 1. Income Section

```
Card Design:
- Background: White with emerald gradient overlay
- Shadow: Resting shadow, elevates on hover
- Border: 1px solid rgba(16, 185, 129, 0.1)
- Padding: 24px
- Avatar: 48px circle with 2px emerald border

Content Layout:
- Name: 1.25rem font weight 600
- Role/Title: 0.875rem text-secondary
- Monthly salary: 1.875rem font weight 700, emerald-600
- Additional income: Listed with + prefix, 1rem
- Subtle animation: Fade in numbers on load
```

### 2. Expense Section

```
Card Design:
- Background: White with amber gradient overlay
- Shadow: Resting shadow, elevates on hover
- Border: 1px solid rgba(245, 158, 11, 0.1)
- Category headers: Sticky with blur backdrop
- Padding: 20px

Visual Elements:
- Category icons: 24px with colored background circle
- Amount display: 1.375rem font weight 600
- Shared indicator: Pill badge with percentage
- Progress bars: Show % of total expenses
- Hover state: Highlight related expenses
```

### 3. Summary Section

```
Premium Card Design:
- Background: Glassmorphism effect
- Border: 1px solid rgba(99, 102, 241, 0.2)
- Shadow: Active shadow for prominence
- Gradient border on positive balance
- Padding: 32px

Number Display:
- Total income: 2.5rem weight 700 with emerald accent
- Total expenses: 2.5rem weight 700 with amber accent
- Balance: 3rem weight 800 with color based on value
- Animated counting: Numbers count up on load
- Sparkle effect: On positive balance
```

### 4. Input Forms

```
Field Design:
- Background: White with subtle inner shadow
- Border: 2px solid transparent, indigo on focus
- Border radius: 8px
- Padding: 12px 16px
- Transition: All properties 200ms ease-out

Interactive States:
- Hover: Border color gray-300
- Focus: Border indigo-500 with glow
- Error: Border red-500 with red glow
- Success: Brief green border flash
- Loading: Subtle pulse animation
```

## Interaction Patterns

### 1. Micro-interactions

```
Hover Effects:
- Cards: Lift with shadow (transform: translateY(-2px))
- Buttons: Brightness increase + shadow
- Links: Underline slides in from left
- Numbers: Subtle scale (1.02) with color intensity

Click Feedback:
- Buttons: Scale down (0.98) briefly
- Cards: Ripple effect from click point
- Inputs: Focus ring expands outward
- Success: Checkmark draws in with SVG animation
```

### 2. Data Entry

```
Input Interactions:
- Focus: Label floats up (if empty)
- Typing: Real-time formatting for currency
- Valid: Green checkmark fades in
- Invalid: Shake animation + red glow
- Save: Brief pulse of indigo on success
```

### 3. Transitions

```
Page Transitions:
- Initial load: Stagger fade-in (100ms delay between sections)
- Card appear: Slide up + fade (300ms ease-out)
- Number changes: Count animation (600ms)
- Section collapse: Height animation (200ms)

State Changes:
- Loading: Shimmer effect on placeholders
- Success: Green wave animation
- Error: Red shake + pulse
- Update: Blue highlight fade
```

### 4. Special Effects

```
Premium Touches:
- Positive balance: Subtle sparkle particles
- Achievement: Confetti burst (rare events)
- Tooltips: Appear with slight bounce
- Modals: Backdrop blur + scale in
- Delete: Item shrinks to center + fades
```

## Responsive Behavior

### Mobile-First Rules

1. **Touch targets** - Minimum 44px height/width
2. **Thumb reach** - Critical actions in bottom 60% of screen
3. **No hover states** - All information accessible via tap
4. **Collapsible sections** - Manage vertical space efficiently

### Print Styles

1. **Black & white friendly** - No color-dependent information
2. **Hide interactive elements** - Remove buttons, inputs
3. **Compact layout** - Fit standard paper sizes
4. **Include date/time** - When printed for records

## Accessibility Standards

### 1. Contrast Requirements

- Normal text: 4.5:1 minimum contrast ratio
- Large text: 3:1 minimum contrast ratio
- Interactive elements: Clear focus indicators

### 2. Screen Reader Support

- Semantic HTML structure
- Descriptive labels for all inputs
- Currency values announced correctly
- Summary section marked as important

### 3. Keyboard Navigation

- Tab order follows visual hierarchy
- All actions keyboard accessible
- Escape key closes modals/dropdowns
- Enter key submits forms

## Icon & Visual Elements

### 1. Icon System

```
Icon Library: Lucide Icons (for consistency)
Sizes: 16px (small), 20px (default), 24px (large)

Icon Usage:
- Income: TrendingUp, DollarSign, Plus
- Expenses: TrendingDown, Receipt, Minus
- Categories: Home, Car, Heart, Zap, etc.
- Actions: Edit2, Save, X, Check

Icon Styling:
- Default: currentColor (inherits text color)
- Interactive: Color transition on hover
- Background: Colored circle for category icons
- Stroke width: 2px for clarity
```

### 2. Visual Accents

```
Decorative Elements:
- Gradient meshes: Subtle background patterns
- Dot grid: Light pattern for empty states
- Wave divider: Between major sections
- Corner accents: Subtle brackets on cards

Status Indicators:
- Green dot: Active/Positive
- Amber dot: Warning/Attention
- Red dot: Error/Negative
- Pulse animation: For live updates
```

### 3. Charts & Visualization

```
Progress Bars:
- Height: 8px with rounded ends
- Background: Gray-200
- Fill: Gradient based on category
- Animation: Width transition on load

Pie Charts (Summary):
- Minimal style, no borders
- Hover: Segment grows slightly
- Colors: Match category palette
- Center text: Total or percentage

Sparklines (Trends):
- Simple line, no axes
- Gradient fill underneath
- Dots on hover for values
- Smooth curves via bezier
```

## Animation Guidelines

### 1. Timing & Easing

```
Durations:
- Micro-interactions: 150ms
- State changes: 200ms
- Page transitions: 300ms
- Count animations: 600ms
- Complex sequences: 800ms max

Easing Functions:
- Default: cubic-bezier(0.4, 0, 0.2, 1) - ease-out
- Bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
- Smooth: cubic-bezier(0.215, 0.61, 0.355, 1)
- Sharp: cubic-bezier(0.4, 0, 0.6, 1)
```

### 2. Animation Patterns

```
Enter Animations:
- Fade up: opacity 0→1, translateY 20px→0
- Scale in: scale 0.9→1, opacity 0→1
- Slide in: translateX -20px→0, opacity 0→1
- Stagger: 50ms delay between items

Exit Animations:
- Fade down: opacity 1→0, translateY 0→10px
- Scale out: scale 1→0.9, opacity 1→0
- Slide out: translateX 0→20px, opacity 1→0

Loading States:
- Skeleton: Shimmer wave animation
- Spinner: Rotate with ease-in-out
- Progress: Width with ease-out
- Pulse: Scale 1→1.05→1 infinite
```

### 3. Performance Rules

- Use transform and opacity only
- Enable will-change for heavy animations
- GPU acceleration with translateZ(0)
- Reduce motion for accessibility
- 60 FPS target for all animations

## Content Guidelines

### 1. Language & Tone

- **Clear and direct** - No financial jargon
- **Action-oriented** - "Add income" not "Income management"
- **Friendly but professional** - Approachable without being casual
- **Consistent terminology** - Same words for same concepts

### 2. Number Formatting

- Currency: $1,234.56 (comma separators, 2 decimal places)
- Percentages: 50% (no decimal unless needed)
- Negative values: -$123.45 (minus sign prefix)
- Zero values: Show as "$0.00" not blank

### 3. Empty States

```
Visual Design:
- Light gradient background
- Subtle dot grid pattern
- Centered illustration or icon
- Muted color palette

Content:
- Heading: "Let's add your first income"
- Subtext: "Start by adding family members' salaries"
- CTA button: Primary color, clear action
- Optional: Preview of filled state

Animation:
- Fade in on first view
- Gentle float animation on icon
- Button pulse to draw attention
```

## Performance Standards

- Initial load: < 2 seconds
- Interaction response: < 100ms
- Smooth scrolling: 60 FPS
- No layout shifts after initial render

## Brand Personality

### Visual Identity

- **Modern & Trustworthy**: Clean lines with subtle depth
- **Premium Feel**: Refined details without being ostentatious
- **Warm & Approachable**: Soft shadows, friendly colors
- **Professional**: Suitable for serious financial planning
- **Delightful**: Small touches of personality in interactions

### Unique Style Elements

1. **Gradient Overlays**: Subtle color washes on cards
2. **Glassmorphism**: Premium sections with blur effects
3. **Micro-animations**: Thoughtful motion design
4. **Color Coding**: Intuitive use of emerald/amber
5. **Depth Layers**: Multi-level shadow system
6. **Typography Mix**: Modern sans + monospace for numbers

## Implementation Examples

### CSS Variables

```css
:root {
  /* Brand Colors */
  --color-brand-primary: #6366f1;
  --color-brand-accent: #8b5cf6;

  /* Income Palette */
  --color-income-primary: #10b981;
  --color-income-light: #d1fae5;
  --color-income-dark: #065f46;

  /* Expense Palette */
  --color-expense-primary: #f59e0b;
  --color-expense-light: #fef3c7;
  --color-expense-dark: #92400e;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.08);

  /* Animations */
  --ease-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Testing Checklist

- [ ] All text readable at 100% and 200% zoom
- [ ] Works without JavaScript for initial render
- [ ] Keyboard navigation fully functional
- [ ] Color blind friendly (test all types)
- [ ] Mobile touch targets adequate size (44px min)
- [ ] Print preview looks professional
- [ ] Loading states for all async operations
- [ ] Error states for all inputs
- [ ] Animations respect prefers-reduced-motion
- [ ] Glassmorphism has fallback for unsupported browsers
- [ ] All gradients have solid color fallbacks
- [ ] Shadow system works on light and dark backgrounds
