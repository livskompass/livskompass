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

export const defaultPostTemplate = JSON.stringify({
  content: [
    { type: 'PostHeader', props: { id: 'post-header', showBackLink: true, backLinkText: 'Alla inlägg', backLinkUrl: '/nyhet' } },
    { type: 'RichText', props: { id: 'content', content: '__LEGACY_CONTENT__', maxWidth: 'medium' } },
  ],
  root: { props: {} },
  zones: {},
})
