// Migration script to move hover colors from homepage featuredProjects to project documents
// Run this script using: npx sanity exec migrations/migrateHoverColors.js --with-user-token

export default async function migrateHoverColors(context) {
  const { getClient } = context
  const client = getClient({ apiVersion: '2023-01-01' })

  console.log('Starting hover color migration...')

  try {
    // Fetch all homepage documents (for all locales)
    const homePages = await client.fetch(`*[_type == "homePage"]`)
    console.log(`Found ${homePages.length} homepage documents`)

    // Track projects and their colors to avoid conflicts
    const projectColorMap = new Map()

    // Collect all hover colors from all homepages
    for (const homePage of homePages) {
      console.log(`\nProcessing homepage: ${homePage._id} (${homePage.language})`)

      const featuredProjects = homePage.projects?.featuredProjects || []
      console.log(`Found ${featuredProjects.length} featured projects`)

      for (const featuredProject of featuredProjects) {
        if (!featuredProject.project?._ref) {
          console.log(`Skipping featured project with no reference`)
          continue
        }

        const projectId = featuredProject.project._ref
        const hoverColor = featuredProject.hoverColor?.hex
        const textHoverColor = featuredProject.textHoverColor?.hex

        // Store the colors for this project
        if (hoverColor || textHoverColor) {
          if (!projectColorMap.has(projectId)) {
            projectColorMap.set(projectId, {})
          }

          const existing = projectColorMap.get(projectId)

          // Only update if not already set or if this homepage has values
          if (hoverColor && !existing.hoverColor) {
            existing.hoverColor = hoverColor
          }
          if (textHoverColor && !existing.textHoverColor) {
            existing.textHoverColor = textHoverColor
          }

          console.log(`Project ${projectId}: hover=${hoverColor}, textHover=${textHoverColor}`)
        }
      }
    }

    // Now update each project with its colors
    console.log(`\n\nUpdating ${projectColorMap.size} projects with hover colors...`)

    const transaction = client.transaction()
    let updateCount = 0

    for (const [projectId, colors] of projectColorMap.entries()) {
      try {
        // First fetch the project to see if it already has colors
        const project = await client.fetch(`*[_id == $id][0]`, { id: projectId })

        if (!project) {
          console.log(`Project ${projectId} not found, skipping`)
          continue
        }

        // Prepare the patch
        const patch = {}

        // Only set colors if they don't already exist in the project
        if (!project.hoverColor && colors.hoverColor) {
          patch.hoverColor = { hex: colors.hoverColor }
        }
        if (!project.textHoverColor && colors.textHoverColor) {
          patch.textHoverColor = { hex: colors.textHoverColor }
        }

        if (Object.keys(patch).length > 0) {
          transaction.patch(projectId, (p) => p.set(patch))
          updateCount++
          console.log(`✅ Queued update for project ${projectId} with colors:`, patch)
        } else {
          console.log(`⏭️  Project ${projectId} already has colors, skipping`)
        }
      } catch (error) {
        console.error(`❌ Failed to process project ${projectId}:`, error)
      }
    }

    if (updateCount > 0) {
      console.log(`\nCommitting ${updateCount} updates...`)
      await transaction.commit()
      console.log('✅ All updates committed successfully!')
    } else {
      console.log('\nNo updates needed.')
    }

    console.log('\n✨ Migration complete!')
    console.log('Next steps:')
    console.log('1. Verify the colors are correctly set on projects in Sanity Studio')
    console.log('2. Remove hoverColor and textHoverColor fields from homepage featuredProjects schema')
    console.log('3. Update frontend queries to fetch colors from projects instead of homepage config')

  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}