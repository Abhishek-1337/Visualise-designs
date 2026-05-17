import React from 'react';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
}

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}: ImageProps) {

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/assets/images/no_image.png"
      }}
      {...props}
    />
  );
}

export default Image;
