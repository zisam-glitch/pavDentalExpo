import React from 'react';
import Svg, { Polyline } from 'react-native-svg';

interface ArrowIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const ArrowIcon: React.FC<ArrowIconProps> = ({
  size = 24,
  color = '#000',
  strokeWidth = 1.5,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
      <Polyline
        points="11 17 16 12 11 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
};

export default ArrowIcon;
