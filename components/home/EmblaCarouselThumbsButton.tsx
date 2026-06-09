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

  return (
    <div
      className={'embla-thumbs__slide '.concat(
        selected ? ' embla-thumbs__slide--selected' : ''
      )}
    >
      <button
        onClick={onClick}
        className="embla-thumbs__slide__button"
        type="button"
      >
        <Image
          className="embla-thumbs__slide__img w-1/4"
          src={imgSrc}
          width={100}
          height={100}
          alt="Your alt text"
        />
      </button>
    </div>
  )
}
