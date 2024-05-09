"use client";
// Import dependencies
import React, { MouseEvent, useEffect, useState } from "react";
import Image from "next/image";

// Constants for magnifier size and zoom level
const MAGNIFIER_SIZE = 150;
const ZOOM_LEVEL = 1.8;

interface ImageEffectProps {
  src: string;
  classNames: string;
}
// ImageEffect component
const ImageEffect = ({ src, classNames }: ImageEffectProps) => {
  // State variables
  const [zoomable, setZoomable] = useState(true);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [position, setPosition] = useState({
    x: 100,
    y: 100,
    mouseX: 0,
    mouseY: 0,
  });

  // Event handlers
  const handleMouseEnter = (e: MouseEvent) => {
    let element = e.currentTarget;
    let { width, height } = element.getBoundingClientRect();
    setImageSize({ width, height });
    setZoomable(true);
    updatePosition(e);
  };

  const handleMouseLeave = (e: MouseEvent) => {
    setZoomable(false);
    updatePosition(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    updatePosition(e);
  };

  const updatePosition = (e: MouseEvent) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - left;
    let y = e.clientY - top;
    setPosition({
      x: -x * ZOOM_LEVEL + MAGNIFIER_SIZE / 2,
      y: -y * ZOOM_LEVEL + MAGNIFIER_SIZE / 2,
      mouseX: x - MAGNIFIER_SIZE / 2,
      mouseY: y - MAGNIFIER_SIZE / 2,
    });
  };

  // Render method
  return (
    <div className="flex justify-center items-center p-2 py-4">
      <div
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        className="w-full h-full relative overflow-hidden "
      >
        <Image
          //   className="object-cover border z-10 h-full h-full"
          className={classNames}
          alt=""
          width={1000}
          height={1000}
          src={src}
        />
        <div
          style={{
            backgroundPosition: `${position.x}px ${position.y}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${imageSize.width * ZOOM_LEVEL}px ${
              imageSize.height * ZOOM_LEVEL
            }px`,
            backgroundRepeat: "no-repeat",
            display: zoomable ? "block" : "none",
            top: `${position.mouseY}px`,
            left: `${position.mouseX}px`,
            width: `${MAGNIFIER_SIZE}px`,
            height: `${MAGNIFIER_SIZE}px`,
          }}
          className={`z-50  rounded-xl  pointer-events-none absolute `}
        />
      </div>
    </div>
  );
};

export default ImageEffect;
