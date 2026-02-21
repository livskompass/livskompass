// Re-export context from shared package
// This allows web pages to import from a local path while using the shared definitions.
export { CourseContext, PostContext, useCourseData, usePostData } from '@livskompass/shared'
export type { CourseContextValue, PostContextValue } from '@livskompass/shared'
