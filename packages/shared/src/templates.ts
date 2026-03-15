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
        heading: 'ACT and Mindfulness',
        subheading: 'Courses and tools to manage stress and live a richer life',
        bgStyle: 'gradient',
        ctaPrimaryText: 'View courses',
        ctaPrimaryLink: '/utbildningar',
        ctaSecondaryText: 'What is ACT?',
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
        heading: 'Upcoming courses',
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
        heading: 'Latest news',
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
        heading: 'Want to know more?',
        description: 'Contact us for questions about courses, materials, or collaborations.',
        buttonText: 'Contact us',
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

export const defaultBlogTemplate = JSON.stringify({
  content: [
    {
      type: 'PageHeader',
      props: {
        id: 'page-header',
        heading: 'News',
        subheading: 'Latest news from Livskompass',
        alignment: 'left',
        size: 'large',
        showDivider: true,
        breadcrumbs: [],
      },
    },
    {
      type: 'PostGrid',
      props: {
        id: 'posts',
        heading: '',
        subheading: '',
        count: 20,
        columns: 3,
        showImage: true,
        showExcerpt: true,
        showDate: true,
        cardStyle: 'default',
      },
    },
  ],
  root: { props: {} },
  zones: {},
})

export const defaultPostTemplate = JSON.stringify({
  content: [
    { type: 'PostHeader', props: { id: 'post-header', showBackLink: true, backLinkText: 'All posts', backLinkUrl: '/nyhet' } },
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
  ],
  root: { props: {} },
  zones: {},
})
