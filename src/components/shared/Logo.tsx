
import type { ComponentProps } from 'react';

// Omit 'src' and 'alt' to enforce them, and allow other Image props to be passed.
type LogoProps = Omit<ComponentProps<'svg'>, 'alt'> & {
  alt?: string;
};


export default function Logo({ alt = "CEOLIN Mobilidade Urbana Logo", ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 160 40"
      aria-labelledby="logoTitle logoDesc"
      role="img"
      {...props}
    >
      <title id="logoTitle">{alt}</title>
      <desc id="logoDesc">Logo da CEOLIN Mobilidade Urbana, com o nome da empresa e a tagline.</desc>
      <defs>
        <style>
          {`
            .text-ceolin { fill: #1E3A8A; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 24px; letter-spacing: -1px;}
            .text-tagline { fill: #DC2626; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 8px; letter-spacing: 0.5px; text-transform: uppercase; }
          `}
        </style>
      </defs>
      <text x="0" y="20" className="text-ceolin">
        CEOLIN
      </text>
      <text x="1.5" y="30" className="text-tagline">
        Mobilidade Urbana
      </text>
    </svg>
  );
}
