// ── Centralized UI strings ──
// Single source of truth for all user-facing text across the application.
// These serve as defaults; customized versions can be stored in the DB
// and fetched via the /api/site-settings/ui-strings endpoint.

export const UI_STRINGS = {
  // ── Booking page (packages/web BookingPage.tsx) ──
  booking: {
    pageTitle: 'Book a spot',
    heading: 'Book a spot',
    cannotBook: 'Cannot book',
    completedBadge: 'Completed',
    fullBadge: 'Fully booked',
    completedMessage: 'This course has already been completed.',
    fullMessage: 'This course is fully booked.',
    seeOtherCourses: 'See other courses',
    back: 'Back',
    yourDetails: 'Your details',
    nameLabel: 'Name *',
    emailLabel: 'Email *',
    phoneLabel: 'Phone',
    organizationLabel: 'Organization / company',
    participantsLabel: 'Number of participants *',
    messageLabel: 'Message',
    messagePlaceholder: 'Any questions or requests...',
    totalToPay: 'Total to pay',
    perPerson: 'SEK/person',
    submitButton: 'Proceed to payment',
    processingButton: 'Processing...',
    stripeRedirectNote: 'You will be redirected to Stripe for secure payment',
    errorPaymentStart: 'Could not start payment. Please try again.',
    errorGeneric: 'Something went wrong. Please try again.',
  },

  // ── Booking confirmation (packages/web BookingConfirmation.tsx) ──
  confirmation: {
    pageTitle: 'Booking confirmation',
    noBookingHeading: 'No booking found',
    seeCourses: 'See courses',
    cancelledHeading: 'Payment cancelled',
    cancelledMessage: 'The payment was cancelled. No charge was made.',
    backToCourses: 'Back to courses',
    confirming: 'Confirming booking...',
    processingHeading: 'Processing payment...',
    processingMessage: 'We are processing your booking. Please wait...',
    successHeading: 'Thank you for your booking!',
    successMessage: 'Your booking is confirmed. Save your booking number. Contact us if you have questions.',
    bookingNumberLabel: 'Booking number',
    confirmedBadge: 'Confirmed',
    toHomepage: 'To homepage',
    errorHeading: 'Something went wrong',
    errorMessage: 'There was a problem with your payment. Contact us if you have questions.',
    contactUs: 'Contact us',
  },

  // ── Contact form (shared blocks/ContactForm.tsx) ──
  contact: {
    heading: 'Contact us',
    description: 'Have questions? Get in touch and we will get back to you as soon as we can.',
    nameLabel: 'Name *',
    emailLabel: 'Email *',
    phoneLabel: 'Phone',
    subjectLabel: 'Subject',
    messageLabel: 'Message *',
    submitButton: 'Send message',
    submittingButton: 'Sending...',
    successHeading: 'Thank you for your message!',
    successMessage: 'We will get back to you as soon as we can.',
    errorSend: 'Could not send the message',
    errorGeneric: 'Something went wrong',
  },

  // ── Course list (shared blocks/CourseList.tsx) ──
  courses: {
    readMore: 'Read more',
    bookButton: 'Book a spot',
    fullLabel: 'Fully booked',
    emptyText: 'There are no courses scheduled at this time.',
    spotsLeft: 'spots left',
  },

  // ── Course info (shared blocks/CourseInfo.tsx) ──
  courseInfo: {
    locationLabel: 'Location',
    dateLabel: 'Date',
    priceLabel: 'Price',
    spotsLabel: 'Spots',
    deadlineLabel: 'Registration deadline',
    fullLabel: 'Fully booked',
    placeholder: 'Course details are shown when a course is selected.',
    spotsOf: 'of',
    spotsRemaining: 'remaining',
  },

  // ── Product list (shared blocks/ProductList.tsx) ──
  products: {
    buyButton: 'Buy',
    freeLabel: 'Free',
    outOfStockLabel: 'Out of stock',
    emptyText: 'No products found.',
    typeLabels: {
      book: 'Books',
      cd: 'CDs',
      cards: 'Cards',
      app: 'Apps',
      download: 'Downloads',
    } as Record<string, string>,
  },

  // ── Booking form (shared blocks/BookingForm.tsx) ──
  bookingForm: {
    nameLabel: 'Name *',
    emailLabel: 'Email *',
    phoneLabel: 'Phone',
    organizationLabel: 'Organization',
    participantsLabel: 'Number of participants *',
    messageLabel: 'Message',
    submitButton: 'Proceed to payment',
    processingText: 'Processing...',
    fullMessage: 'This course is fully booked.',
    completedMessage: 'This course has been completed.',
    totalLabel: 'Total',
    placeholder: 'The booking form is shown when a course is selected.',
    perPerson: 'SEK/person',
    errorCreate: 'Could not create booking',
    errorGeneric: 'Something went wrong',
  },

  // ── Booking CTA (shared blocks/BookingCTA.tsx) ──
  bookingCTA: {
    buttonText: 'Book a spot',
    heading: 'Interested in participating?',
    description: 'Book your spot today',
    completedMessage: 'This course has been completed.',
    fullMessage: 'This course is fully booked.',
    fullSubMessage: 'Contact us to be placed on the waiting list.',
    placeholder: 'Booking CTA is shown when a course is selected.',
  },

  // ── Post header (shared blocks/PostHeader.tsx) ──
  postHeader: {
    placeholder: 'Post header is shown here (data-bound)',
    backLinkText: 'All posts',
    backLinkUrl: '/nyhet',
  },

  // ── Error messages ──
  errors: {
    generic: 'Something went wrong',
    notFound: 'Not found',
    unauthorized: 'Not authorized',
    paymentFailed: 'Payment failed',
    blockRenderFailed: 'Could not load page content.',
  },

  // ── Common strings ──
  common: {
    currency: 'SEK',
    fullLabel: 'Fully booked',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    contactUs: 'Contact us',
    toHomepage: 'To homepage',
  },

  // ── 404 page (packages/web NotFound.tsx) ──
  notFound: {
    pageTitle: 'Page not found',
    heading: 'Page not found',
    message: 'The page you are looking for does not exist or has been moved.',
    toHomepage: 'To homepage',
    contactUs: 'Contact us',
  },

  // ── Universal page (packages/web UniversalPage.tsx) ──
  page: {
    fallbackTitle: 'Page',
  },

  // ── Edit toolbar (shared editor/ComponentToolbar.tsx) ──
  editToolbar: {
    saving: 'Saving',
    saved: 'Saved',
    saveError: 'Save error',
    openInCMS: 'Open in CMS',
    hide: 'Hide',
    editMode: 'Edit mode',
    editItems: 'Edit items ▶',
    on: 'On',
    off: 'Off',
  },
} as const

export type UIStrings = typeof UI_STRINGS
export type UIStringKey = keyof UIStrings
