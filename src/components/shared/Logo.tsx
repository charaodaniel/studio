import Image from 'next/image';
import type { ComponentProps } from 'react';

// Omit 'src' and 'alt' to enforce them, and allow other Image props to be passed.
type LogoProps = Omit<ComponentProps<typeof Image>, 'src' | 'alt'> & {
  alt?: string;
};


export default function Logo({ alt = "CEOLIN Mobilidade Urbana Logo", ...props }: LogoProps) {
  // Default width and height can be provided, but can be overridden by props
  const { width = 150, height = 150, ...rest } = props;
    
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={width}
      height={height}
      priority // The logo is likely LCP, so we prioritize its loading
      {...rest}
    />
  );
}
