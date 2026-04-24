// Default block templates for content types that don't have custom content_blocks.
// These provide a sensible starting layout.

// Course template layout:
//   1. Spacer — gap between site menu and banner image
//   2. Banner image (21:9 aspect, content-width, 25vh max — no internal padding,
//      spacing comes from Spacer blocks around it)
//   3. Spacer — gap between image and course info
//   4. Columns 50/50 (stacks on mobile):
//      Left:  CourseHeader → RichText → CourseInfo
//      Right: BookingForm
//   5. Spacer — breathing room below content before footer
// RichText keeps __LEGACY_CONTENT__ so migrated courses retain their description.
export const defaultCourseTemplate = JSON.stringify({
  content: [
    { type: 'Spacer', props: { id: 'course-spacer-header', sectionBg: 'transparent', size: 'large' } },
    {
      type: 'ImageBlock',
      props: {
        id: 'course-image',
        sectionBg: 'transparent',
        src: '',
        alt: '',
        caption: '',
        size: 'full',
        alignment: 'center',
        rounded: 'large',
        shadow: 'none',
        border: 'none',
        link: '',
        aspectRatio: '21/9',
        maxHeight: '25vh',
      },
    },
    { type: 'Spacer', props: { id: 'course-spacer-top', sectionBg: 'transparent', size: 'small' } },
    {
      type: 'Columns',
      props: {
        id: 'course-layout',
        sectionBg: 'transparent',
        layout: '50-50',
        gap: 'large',
        verticalAlignment: 'top',
        stackOnMobile: true,
      },
    },
    { type: 'Spacer', props: { id: 'course-spacer-bottom', sectionBg: 'transparent', size: 'medium' } },
  ],
  root: { props: {} },
  zones: {
    'course-layout:column-1': [
      { type: 'CourseHeader', props: { id: 'course-header', sectionBg: 'transparent', subtitle: '' } },
      { type: 'RichText', props: { id: 'course-content', sectionBg: 'transparent', content: '__LEGACY_CONTENT__', maxWidth: 'full' } },
      { type: 'CourseInfo', props: { id: 'course-info', sectionBg: 'transparent', showDeadline: true, showEmpty: true, layout: 'stacked' } },
    ],
    'course-layout:column-2': [
      {
        type: 'BookingForm',
        props: {
          id: 'course-booking-form',
          sectionBg: 'transparent',
          showSummary: false,
          showOrganization: true,
          showNotes: true,
        },
      },
    ],
  },
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

export const defaultProductTemplate = JSON.stringify({
  content: [
    { type: 'PageHeader', props: { id: 'product-header', heading: '__PRODUCT_TITLE__', backLinkText: 'Allt material', backLinkUrl: '/material' } },
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
  ],
  root: { props: {} },
  zones: {},
})
