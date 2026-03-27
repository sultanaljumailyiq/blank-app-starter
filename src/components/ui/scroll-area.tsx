import * as React from "react"

export interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ScrollAreaViewportProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface ScrollAreaScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className || ''}`}
      {...props}
    >
      <div className="h-full w-full overflow-auto">
        {children}
      </div>
    </div>
  )
)
ScrollArea.displayName = "ScrollArea"

const ScrollAreaViewport = React.forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={className} {...props} />
  )
)
ScrollAreaViewport.displayName = "ScrollAreaViewport"

const ScrollAreaScrollbar = React.forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex touch-none select-none transition-colors ${className || ''}`}
      {...props}
    />
  )
)
ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar"

export { ScrollArea, ScrollAreaViewport, ScrollAreaScrollbar }
