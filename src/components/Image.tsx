import React from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  priority?: boolean;
  unoptimized?: boolean;
  sizes?: string;
}

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ src, alt, width, height, fill, priority, unoptimized, className = '', style, ...rest }, ref) => {
    const combinedStyle: React.CSSProperties = {
      ...(fill
        ? {
            position: 'absolute',
            height: '100%',
            width: '100%',
            inset: 0,
            color: 'transparent',
          }
        : {}),
      ...style,
    };

    return (
      <img
        ref={ref}
        src={src}
        alt={alt || ''}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className={className}
        style={combinedStyle}
        {...rest}
      />
    );
  }
);

Image.displayName = 'Image';
export default Image;
