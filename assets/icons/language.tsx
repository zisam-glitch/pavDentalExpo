import React from 'react';
import Svg, { Line, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const Language: React.FC<IconProps> = ({
  size = 24,
  color = '#000',
  strokeWidth = 4,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      <Path
        d="M34.53 14.59s-1.6 18.21-24 32.78"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="7.35"
        y1="14.59"
        x2="41.46"
        y2="14.59"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="24.4"
        y1="9.08"
        x2="24.4"
        y2="14.59"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M16.76 22.05S25.2 36.8 32 41.33"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M33.55 54.92l10.74-25a.89.89 0 0 1 1.63 0l10.73 25"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1="37.25"
        y1="46.3"
        x2="52.96"
        y2="46.3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default Language;
