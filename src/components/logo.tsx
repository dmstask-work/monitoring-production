import * as React from "react"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
}

export function Logo({ size = 24, color = '#ef4444', className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      {...props}
    >
      <text
        x="50%"
        y="50%"
        dy=".1em" /* Slight visual alignment adjustment */
        fill={color}
        fontSize="20px"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        IG
      </text>
    </svg>
  )
}
