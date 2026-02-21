// Default block templates for content types that don't have custom content_blocks.
// These provide a sensible starting layout.

export const defaultCourseTemplate = JSON.stringify({
  content: [
    { type: 'CourseInfo', props: { id: 'course-info', showDeadline: true, layout: 'grid' } },
    { type: 'SeparatorBlock', props: { id: 'sep-1', variant: 'space-only', spacing: 'small', lineColor: 'light', maxWidth: 'full' } },
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
    { type: 'SeparatorBlock', props: { id: 'sep-2', variant: 'space-only', spacing: 'medium', lineColor: 'light', maxWidth: 'full' } },
    { type: 'BookingCTA', props: { id: 'booking-cta', style: 'card' } },
  ],
  root: { props: {} },
  zones: {},
})

export const defaultHomeTemplate = JSON.stringify({
  content: [
    {
      type: 'Hero',
      props: {
        id: 'hero',
        preset: 'centered',
        heading: 'ACT och Mindfulness',
        subheading: 'Utbildningar och verktyg för att hantera stress och leva ett rikare liv',
        bgStyle: 'gradient',
        ctaPrimaryText: 'Se utbildningar',
        ctaPrimaryLink: '/utbildningar',
        ctaSecondaryText: 'Vad är ACT?',
        ctaSecondaryLink: '/act',
        image: '',
        backgroundImage: '',
        overlayDarkness: 'medium',
      },
    },
    {
      type: 'CourseList',
      props: {
        id: 'courses',
        heading: 'Kommande utbildningar',
        maxItems: 3,
        columns: 3,
        showBookButton: true,
        compactMode: false,
      },
    },
    {
      type: 'SeparatorBlock',
      props: { id: 'sep-1', variant: 'space-only', spacing: 'medium', lineColor: 'light', maxWidth: 'full' },
    },
    {
      type: 'PostGrid',
      props: {
        id: 'posts',
        heading: 'Senaste nytt',
        subheading: '',
        count: 3,
        columns: 3,
        showImage: true,
        showExcerpt: true,
        showDate: true,
        cardStyle: 'default',
      },
    },
    {
      type: 'CTABanner',
      props: {
        id: 'cta',
        heading: 'Vill du veta mer?',
        description: 'Kontakta oss för frågor om utbildningar, material eller samarbeten.',
        buttonText: 'Kontakta oss',
        buttonLink: '/kontakt',
        backgroundColor: 'dark',
        alignment: 'center',
      },
    },
  ],
  root: { props: {} },
  zones: {},
})

export const defaultPageTemplate = JSON.stringify({
  content: [
    {
      type: 'PageHeader',
      props: {
        id: 'page-header',
        heading: '__PAGE_TITLE__',
        subheading: '',
        alignment: 'left',
        size: 'large',
        showDivider: true,
        breadcrumbs: [],
      },
    },
    {
      type: 'RichText',
      props: {
        id: 'content',
        content: '__LEGACY_CONTENT__',
        maxWidth: 'medium',
      },
    },
  ],
  root: { props: {} },
  zones: {},
})

export const defaultPostTemplate = JSON.stringify({
  content: [
    { type: 'PostHeader', props: { id: 'post-header', showBackLink: true, backLinkText: 'Alla inlägg', backLinkUrl: '/nyhet' } },
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
  ],
  root: { props: {} },
  zones: {},
})
