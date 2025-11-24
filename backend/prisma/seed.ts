import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultTags = [
  {
    name: 'dishonesty',
    description: 'False or misleading statements',
    color: '#EF4444',
    isDefault: true,
  },
  {
    name: 'divergent-from-historical-gop',
    description: 'Breaks with traditional Republican positions',
    color: '#8B5CF6',
    isDefault: true,
  },
  {
    name: 'breaking-norms',
    description: 'Violates established political/democratic norms',
    color: '#F59E0B',
    isDefault: true,
  },
  {
    name: 'corruption',
    description: 'Self-dealing, conflicts of interest, abuse of power',
    color: '#DC2626',
    isDefault: true,
  },
  {
    name: 'constitutional-concerns',
    description: 'Potential constitutional violations',
    color: '#1D4ED8',
    isDefault: true,
  },
  {
    name: 'policy-harm',
    description: 'Policies causing measurable harm',
    color: '#059669',
    isDefault: true,
  },
  {
    name: 'self-dealing',
    description: 'Personal financial benefit from office',
    color: '#D97706',
    isDefault: true,
  },
  {
    name: 'nepotism',
    description: 'Favoritism toward family members',
    color: '#7C3AED',
    isDefault: true,
  },
]

const defaultPublications = [
  // Far Left (-3)
  { name: 'Jacobin', domain: 'jacobinmag.com', defaultBias: -3, credibility: 'mixed' },
  { name: 'The Intercept', domain: 'theintercept.com', defaultBias: -3, credibility: 'high' },

  // Left (-2)
  { name: 'MSNBC', domain: 'msnbc.com', defaultBias: -2, credibility: 'mixed' },
  { name: 'The Guardian', domain: 'theguardian.com', defaultBias: -2, credibility: 'high' },
  { name: 'Huffington Post', domain: 'huffpost.com', defaultBias: -2, credibility: 'mixed' },
  { name: 'Slate', domain: 'slate.com', defaultBias: -2, credibility: 'high' },
  { name: 'Vox', domain: 'vox.com', defaultBias: -2, credibility: 'high' },
  { name: 'The Atlantic', domain: 'theatlantic.com', defaultBias: -2, credibility: 'high' },

  // Center-Left (-1)
  { name: 'New York Times', domain: 'nytimes.com', defaultBias: -1, credibility: 'high' },
  { name: 'Washington Post', domain: 'washingtonpost.com', defaultBias: -1, credibility: 'high' },
  { name: 'NPR', domain: 'npr.org', defaultBias: -1, credibility: 'high' },
  { name: 'CNN', domain: 'cnn.com', defaultBias: -1, credibility: 'mixed' },
  { name: 'Politico', domain: 'politico.com', defaultBias: -1, credibility: 'high' },
  { name: 'Bloomberg', domain: 'bloomberg.com', defaultBias: -1, credibility: 'high' },
  { name: 'ABC News', domain: 'abcnews.go.com', defaultBias: -1, credibility: 'high' },
  { name: 'CBS News', domain: 'cbsnews.com', defaultBias: -1, credibility: 'high' },
  { name: 'NBC News', domain: 'nbcnews.com', defaultBias: -1, credibility: 'high' },
  { name: 'Time Magazine', domain: 'time.com', defaultBias: -1, credibility: 'high' },

  // Center (0)
  { name: 'Associated Press', domain: 'apnews.com', defaultBias: 0, credibility: 'high' },
  { name: 'Reuters', domain: 'reuters.com', defaultBias: 0, credibility: 'high' },
  { name: 'BBC', domain: 'bbc.com', defaultBias: 0, credibility: 'high' },
  { name: 'C-SPAN', domain: 'c-span.org', defaultBias: 0, credibility: 'high' },
  { name: 'The Hill', domain: 'thehill.com', defaultBias: 0, credibility: 'high' },
  { name: 'USA Today', domain: 'usatoday.com', defaultBias: 0, credibility: 'high' },
  { name: 'Axios', domain: 'axios.com', defaultBias: 0, credibility: 'high' },
  { name: 'PBS NewsHour', domain: 'pbs.org', defaultBias: 0, credibility: 'high' },

  // Center-Right (1)
  { name: 'Wall Street Journal', domain: 'wsj.com', defaultBias: 1, credibility: 'high' },
  { name: 'The Economist', domain: 'economist.com', defaultBias: 1, credibility: 'high' },
  { name: 'Forbes', domain: 'forbes.com', defaultBias: 1, credibility: 'high' },
  { name: 'Reason', domain: 'reason.com', defaultBias: 1, credibility: 'high' },
  { name: 'RealClearPolitics', domain: 'realclearpolitics.com', defaultBias: 1, credibility: 'mixed' },

  // Right (2)
  { name: 'Fox News', domain: 'foxnews.com', defaultBias: 2, credibility: 'mixed' },
  { name: 'New York Post', domain: 'nypost.com', defaultBias: 2, credibility: 'mixed' },
  { name: 'Washington Examiner', domain: 'washingtonexaminer.com', defaultBias: 2, credibility: 'mixed' },
  { name: 'The Daily Wire', domain: 'dailywire.com', defaultBias: 2, credibility: 'mixed' },
  { name: 'National Review', domain: 'nationalreview.com', defaultBias: 2, credibility: 'high' },
  { name: 'The Federalist', domain: 'thefederalist.com', defaultBias: 2, credibility: 'mixed' },

  // Far Right (3)
  { name: 'Breitbart', domain: 'breitbart.com', defaultBias: 3, credibility: 'low' },
  { name: 'Newsmax', domain: 'newsmax.com', defaultBias: 3, credibility: 'low' },
  { name: 'One America News', domain: 'oann.com', defaultBias: 3, credibility: 'low' },
  { name: 'The Gateway Pundit', domain: 'thegatewaypundit.com', defaultBias: 3, credibility: 'low' },

  // Fact-checking / Non-partisan
  { name: 'PolitiFact', domain: 'politifact.com', defaultBias: 0, credibility: 'high' },
  { name: 'FactCheck.org', domain: 'factcheck.org', defaultBias: 0, credibility: 'high' },
  { name: 'Snopes', domain: 'snopes.com', defaultBias: 0, credibility: 'high' },
]

async function main() {
  console.log('Seeding database...')

  // Seed tags
  console.log('Creating default tags...')
  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: {},
      create: tag,
    })
  }
  console.log(`Created ${defaultTags.length} default tags`)

  // Seed publications
  console.log('Creating default publications...')
  for (const pub of defaultPublications) {
    await prisma.publication.upsert({
      where: { domain: pub.domain },
      update: {},
      create: pub,
    })
  }
  console.log(`Created ${defaultPublications.length} publications`)

  console.log('Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
