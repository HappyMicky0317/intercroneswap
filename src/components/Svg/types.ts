import { Colors } from '../../theme/styled';
import { SVGAttributes, ElementType } from 'react';
import { DefaultTheme } from 'styled-components';

export interface SvgProps extends SVGAttributes<HTMLOrSVGElement> {
  theme?: DefaultTheme;
  spin?: boolean;
}

export type IconComponentType = {
  icon: ElementType<any>;
  fillIcon?: ElementType<any>;
  isActive?: boolean;
  height?: string;
  width?: string;
  activeColor?: string;
  activeBackgroundColor?: keyof Colors;
} & SvgProps;
