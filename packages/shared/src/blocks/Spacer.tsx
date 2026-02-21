export interface SpacerProps {
  size: 'xs' | 'small' | 'medium' | 'large' | 'xl'
}

const sizeMap = {
  xs: 'h-4',
  small: 'h-8',
  medium: 'h-16',
  large: 'h-24',
  xl: 'h-40',
}

export function Spacer({ size = 'medium' }: SpacerProps) {
  return <div className={sizeMap[size] || sizeMap.medium} aria-hidden="true" />
}
