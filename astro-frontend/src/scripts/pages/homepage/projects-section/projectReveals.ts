// Intersection Observer for Project Reveals
document.addEventListener('DOMContentLoaded', () => {
  const projects = document.querySelectorAll('.project')

  if (projects.length === 0) return

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (motionQuery.matches) {
    projects.forEach((project) => {
      project.classList.add('is-visible-reduced-motion')
    })
    return
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1,
  }

  const observer = new IntersectionObserver((entries, observerInstance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observerInstance.unobserve(entry.target)
      }
    })
  }, observerOptions)

  projects.forEach((project) => {
    observer.observe(project)
  })
})
