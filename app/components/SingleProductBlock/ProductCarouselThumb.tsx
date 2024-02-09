import React from 'react'
import Image from 'next/image'

type PropType = {
  selected: boolean
  imgSrc: string
  index: number
  onClick: () => void
}

export const Thumb: React.FC<PropType> = (props) => {
  const { selected, imgSrc, index, onClick } = props
  let transform = (url: string) => {
    if (url.includes("300x300")) {
      // Remove '300x300' from the URL
      url = url.replace("-300x300", "");
    }
    return url;
  };

  
  return (
    <div
      className={'embla-thumbs__slide '.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      <button
        onClick={onClick}
        className="embla-thumbs__slide__button flex items-center"
        type="button"
      >
        <div className="embla-thumbs__slide__number">
          <span>{index + 1}</span>
        </div>
        <Image
          className="embla-thumbs__slide__img object-contain
           max-h-[75px] min-h-[75px] md:max-h-[100px] md:min-h-[100px]
           min-w-[75px] md:max-w-[100px] md:min-w-[100px]
           "
          src={transform(imgSrc)}
          width={100}
          height={100}
          alt="Your alt text"
        />
      </button>
    </div>
  )
}

export const CoreVariationThumb: React.FC<PropType> = (props) => {
  const { selected, imgSrc, index, onClick } = props

  return (
    <div
      className={'embla-thumbs__slide '.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      <button
        onClick={onClick}
        className="embla-thumbs__slide__button flex items-center"
        type="button"
      >
        <div className="embla-thumbs__slide__number">
          <span>{index + 1}</span>
        </div>
        <Image
          className="embla-thumbs__slide__img object-contain
           max-h-[75px] min-h-[75px]  md:max-h-[100px] md:min-h-[100px]
           min-w-[75px] md:max-w-[100px] md:min-w-[100px]
           "
          src={imgSrc}
          width={100}
          height={100}
          alt="Variation Image"
        />
      </button>
    </div>
  )
}

