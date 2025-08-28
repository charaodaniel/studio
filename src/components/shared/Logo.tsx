
import type { ComponentProps } from 'react';

// Omit 'src' and 'alt' to enforce them, and allow other Image props to be passed.
type LogoProps = Omit<ComponentProps<'svg'>, 'alt'> & {
  alt?: string;
};


export default function Logo({ alt = "CEOLIN Mobilidade Urbana Logo", ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 150"
      aria-labelledby="logoTitle logoDesc"
      role="img"
      {...props}
    >
      <title id="logoTitle">{alt}</title>
      <desc id="logoDesc">Logo da CEOLIN Mobilidade Urbana, com um carro estilizado e o nome da empresa.</desc>
      <style>
        {`
          .car-body { fill: #1E3A8A; }
          .headlights { fill: #DC2626; }
          .text-ceolin { fill: #DC2626; font-family: 'Space Grotesk', sans-serif; font-weight: bold; font-size: 38px; }
          .text-tagline { fill: #1E3A8A; font-family: 'Space Grotesk', sans-serif; font-weight: 500; font-size: 14px; }
          .text-phone { fill: #DC2626; font-family: 'Space Grotesk', sans-serif; font-weight: bold; font-size: 16px; }
        `}
      </style>
      <g>
        {/* Car body */}
        <path
          className="car-body"
          d="M167.3,60.1c-1.3-4.5-5-8.1-9.6-9.4l-11.8-3.4c-3.2-0.9-6.5-1.4-9.9-1.4H64c-3.4,0-6.7,0.5-9.9,1.4L42.3,50.7
	c-4.6,1.3-8.3,4.9-9.6,9.4L25,80.6V90h150V80.6L167.3,60.1z M56.5,40.3c1.7-5.2,6.7-9.1,12.3-9.1h62.4c5.7,0,10.6,3.9,12.3,9.1
	l4.8,14.7H51.7L56.5,40.3z"
        />
        {/* Headlights */}
        <path
          className="headlights"
          d="M86.1,73.5c-4.4-0.3-8.2-3.6-8.9-8c-0.7-4.4,2-8.6,6.4-9.3c4.4-0.7,8.6,2,9.3,6.4C93.6,67,90.5,71.2,86.1,73.5z"
        />
        <path
          className="headlights"
          d="M113.9,73.5c4.4-0.3,8.2-3.6,8.9-8c0.7-4.4-2-8.6-6.4-9.3c-4.4-0.7-8.6,2-9.3,6.4C106.4,67,109.5,71.2,113.9,73.5z"
        />
      </g>
      <text x="100" y="105" textAnchor="middle" className="text-ceolin">
        CEOLIN
      </text>
      <text x="100" y="122" textAnchor="middle" className="text-tagline">
        mobilidade urbana
      </text>
      <text x="100" y="140" textAnchor="middle" className="text-phone">
        (55) 9.9844.6467
      </text>
    </svg>
  );
}
