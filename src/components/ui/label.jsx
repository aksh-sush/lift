// src/app/components/ui/label.jsx  (or src/components/ui/label.jsx)
"use client";

import * as React from "react";

// tiny classnames helper
const cn = (...classes) => classes.filter(Boolean).join(" ");

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium text-black dark:text-white leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

export default Label;
