import { ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  fromColor?: string;
  toColor?: string;
}

export default function GradientText({
  children,
  className = '',
  as: Component = 'span',
  fromColor = '#1DA78A',
  toColor = '#0F638E',
}: GradientTextProps) {
  return (
    <Component className={className}>
      <span
        className="bg-gradient-to-r bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(to right, ${fromColor}, ${toColor})`,
        }}
      >
        {children}
      </span>
    </Component>
  );
}
