// ── Centralized Swedish UI strings ──
// Single source of truth for all user-facing text across the application.
// These serve as defaults; customized versions can be stored in the DB
// and fetched via the /api/site-settings/ui-strings endpoint.

export const UI_STRINGS = {
  // ── Booking page (packages/web BookingPage.tsx) ──
  booking: {
    pageTitle: 'Boka plats',
    heading: 'Boka plats',
    cannotBook: 'Kan inte boka',
    completedBadge: 'Genomförd',
    fullBadge: 'Fullbokad',
    completedMessage: 'Denna utbildning har redan genomförts.',
    fullMessage: 'Denna utbildning är fullbokad.',
    seeOtherCourses: 'Se andra utbildningar',
    back: 'Tillbaka',
    yourDetails: 'Dina uppgifter',
    nameLabel: 'Namn *',
    emailLabel: 'E-post *',
    phoneLabel: 'Telefon',
    organizationLabel: 'Organisation/företag',
    participantsLabel: 'Antal deltagare *',
    messageLabel: 'Meddelande',
    messagePlaceholder: 'Eventuella frågor eller önskemål...',
    totalToPay: 'Totalt att betala',
    perPerson: 'kr/person',
    submitButton: 'Gå till betalning',
    processingButton: 'Bearbetar...',
    stripeRedirectNote: 'Du kommer att dirigeras till Stripe för säker betalning',
    errorPaymentStart: 'Kunde inte starta betalningen. Försök igen.',
    errorGeneric: 'Något gick fel. Försök igen.',
  },

  // ── Booking confirmation (packages/web BookingConfirmation.tsx) ──
  confirmation: {
    pageTitle: 'Bokningsbekräftelse',
    noBookingHeading: 'Ingen bokning hittades',
    seeCourses: 'Se utbildningar',
    cancelledHeading: 'Betalning avbruten',
    cancelledMessage: 'Betalningen avbrotades. Ingen debitering har gjorts.',
    backToCourses: 'Tillbaka till utbildningar',
    confirming: 'Bekräftar bokning...',
    processingHeading: 'Behandlar betalning...',
    processingMessage: 'Vi behandlar din bokning. Vänligen vänta...',
    successHeading: 'Tack för din bokning!',
    successMessage: 'Din bokning är bekräftad. Spara ditt bokningsnummer. Kontakta oss vid frågor.',
    bookingNumberLabel: 'Bokningsnummer',
    confirmedBadge: 'Bekräftad',
    toHomepage: 'Till startsidan',
    errorHeading: 'Något gick fel',
    errorMessage: 'Det uppstod ett problem med din betalning. Kontakta oss om du har frågor.',
    contactUs: 'Kontakta oss',
  },

  // ── Contact form (shared blocks/ContactForm.tsx) ──
  contact: {
    heading: 'Kontakta oss',
    description: 'Har du frågor? Hör av dig så återkommer vi så snart vi kan.',
    nameLabel: 'Namn *',
    emailLabel: 'E-post *',
    phoneLabel: 'Telefon',
    subjectLabel: 'Ämne',
    messageLabel: 'Meddelande *',
    submitButton: 'Skicka meddelande',
    submittingButton: 'Skickar...',
    successHeading: 'Tack för ditt meddelande!',
    successMessage: 'Vi återkommer så snart vi kan.',
    errorSend: 'Kunde inte skicka meddelandet',
    errorGeneric: 'Något gick fel',
  },

  // ── Course list (shared blocks/CourseList.tsx) ──
  courses: {
    readMore: 'Läs mer',
    bookButton: 'Boka plats',
    fullLabel: 'Fullbokad',
    emptyText: 'Det finns inga utbildningar planerade just nu.',
    spotsLeft: 'platser kvar',
  },

  // ── Course info (shared blocks/CourseInfo.tsx) ──
  courseInfo: {
    locationLabel: 'Plats',
    dateLabel: 'Datum',
    priceLabel: 'Pris',
    spotsLabel: 'Platser',
    deadlineLabel: 'Sista anmälningsdag',
    fullLabel: 'Fullbokad',
    placeholder: 'Kursdetaljer visas när en utbildning är vald.',
    spotsOf: 'av',
    spotsRemaining: 'kvar',
  },

  // ── Product list (shared blocks/ProductList.tsx) ──
  products: {
    buyButton: 'Köp',
    freeLabel: 'Gratis',
    outOfStockLabel: 'Slut i lager',
    emptyText: 'Inga produkter hittades.',
    typeLabels: {
      book: 'Böcker',
      cd: 'CD-skivor',
      cards: 'Kort',
      app: 'Appar',
      download: 'Nedladdningar',
    } as Record<string, string>,
  },

  // ── Booking form (shared blocks/BookingForm.tsx) ──
  bookingForm: {
    nameLabel: 'Namn *',
    emailLabel: 'E-post *',
    phoneLabel: 'Telefon',
    organizationLabel: 'Organisation',
    participantsLabel: 'Antal deltagare *',
    messageLabel: 'Meddelande',
    submitButton: 'Gå till betalning',
    processingText: 'Bearbetar...',
    fullMessage: 'Denna utbildning är fullbokad.',
    completedMessage: 'Denna utbildning har genomförts.',
    totalLabel: 'Totalt',
    placeholder: 'Bokningsformuläret visas när en utbildning är vald.',
    perPerson: 'kr/person',
    errorCreate: 'Kunde inte skapa bokning',
    errorGeneric: 'Något gick fel',
  },

  // ── Booking CTA (shared blocks/BookingCTA.tsx) ──
  bookingCTA: {
    buttonText: 'Boka plats',
    heading: 'Intresserad av att delta?',
    description: 'Boka din plats redan idag',
    completedMessage: 'Denna utbildning har genomförts.',
    fullMessage: 'Denna utbildning är fullbokad.',
    fullSubMessage: 'Kontakta oss om du vill ställas i kö.',
    placeholder: 'Boknings-CTA visas när en utbildning är vald.',
  },

  // ── Post header (shared blocks/PostHeader.tsx) ──
  postHeader: {
    placeholder: 'Inläggsrubrik visas här (data-bunden)',
    backLinkText: 'Alla inlägg',
    backLinkUrl: '/nyhet',
  },

  // ── Error messages ──
  errors: {
    generic: 'Något gick fel',
    notFound: 'Hittades inte',
    unauthorized: 'Inte behörig',
    paymentFailed: 'Betalningen misslyckades',
    blockRenderFailed: 'Kunde inte ladda sidinnehåll.',
  },

  // ── Common strings ──
  common: {
    currency: 'kr',
    fullLabel: 'Fullbokad',
    loading: 'Laddar...',
    save: 'Spara',
    cancel: 'Avbryt',
    delete: 'Radera',
    edit: 'Redigera',
    back: 'Tillbaka',
    contactUs: 'Kontakta oss',
    toHomepage: 'Till startsidan',
  },

  // ── 404 page (packages/web NotFound.tsx) ──
  notFound: {
    pageTitle: 'Sidan hittades inte',
    heading: 'Sidan hittades inte',
    message: 'Sidan du letar efter finns inte eller har flyttats.',
    toHomepage: 'Till startsidan',
    contactUs: 'Kontakta oss',
  },

  // ── Universal page (packages/web UniversalPage.tsx) ──
  page: {
    fallbackTitle: 'Sida',
  },

  // ── Edit toolbar (shared editor/ComponentToolbar.tsx) ──
  editToolbar: {
    saving: 'Sparar',
    saved: 'Sparat',
    saveError: 'Fel vid sparning',
    openInCMS: 'Öppna i CMS',
    hide: 'Dölj',
    editMode: 'Redigeringsläge',
    editItems: 'Edit items ▶',
    on: 'On',
    off: 'Off',
  },
} as const

export type UIStrings = typeof UI_STRINGS
export type UIStringKey = keyof UIStrings
