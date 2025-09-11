# Slide-Up Text Animation

A reusable text animation that splits content into lines and animates them with a staggered slide-up effect.

## Usage

### Basic Usage (Auto-initialization)

Add the `data-slide-up-animation` attribute to any element:

```html
<!-- Animates immediately (above the fold) -->
<h1 data-slide-up-animation data-animate-immediate>Your text here</h1>

<!-- Animates when scrolled into view -->
<h2 data-slide-up-animation>This animates on scroll</h2>
```

### With Custom Options

Use data attributes to customize the animation:

```html
<h3
  data-slide-up-animation
  data-animation-duration="2000"
  data-animation-stagger="300"
  data-animation-delay="500"
>
  Custom timing animation
</h3>
```

### Available Options

- `data-animate-immediate` - Animates immediately instead of waiting for scroll
- `data-animation-duration` - Animation duration in ms (default: 1500)
- `data-animation-stagger` - Delay between lines in ms (default: 200)
- `data-animation-delay` - Initial delay before animation in ms (default: 750)
- `data-animation-easing` - CSS easing function (default: expo.out curve)

### Manual JavaScript Initialization

```typescript
import SlideUpTextAnimation from '@/scripts/animations/slideUpTextAnimation'

const element = document.querySelector('.my-element')
const animation = new SlideUpTextAnimation(element, {
  duration: 2000,
  stagger: 250,
  initialDelay: 1000,
  easing: 'ease-out',
})

// Later, if needed
animation.destroy() // Restore original content
```

## Features

- Automatically detects line breaks based on element width
- Preserves HTML structure (links, emphasis, etc.)
- Responsive - recalculates on window resize
- Respects `prefers-reduced-motion` setting
- Scroll-triggered or immediate animation
- Fully customizable timing

## Examples

```astro
<!-- In any Astro component -->
<script src="@/scripts/animations/slideUpTextAnimation.ts"></script>

<h2 data-slide-up-animation>
  This text will animate<br />
  line by line when scrolled into view
</h2>

<p data-slide-up-animation data-animation-stagger="100">
  Even paragraphs can have this beautiful animation effect with faster stagger timing
</p>
```
