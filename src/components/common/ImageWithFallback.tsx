import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackComponent?: React.ReactNode;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = '/assets/img_app_icon.jpg',
  fallbackComponent,
  ...props
}) => {
  const [error, setError] = useState(false);

  if (error) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        {...props}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
};
