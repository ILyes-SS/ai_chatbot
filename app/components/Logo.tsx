import React from 'react'

const Logo = ({size=40}:{size?:number}) => {
  return (
    <svg className='shrink-0 mb-2 hover:animate-spin' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width={size} height={size}>
  <defs>
    <g id="arm" className='fill-primary' >
      <rect x="485" y="150" width="30" height="350" />
      <path d="M 420 140 C 460 135, 485 100, 485 50 L 515 50 C 515 100, 540 135, 580 140 Z" />
      <circle cx="500" cy="35" r="35" />
    </g>
  </defs>

  <use href="#arm" />
  <use href="#arm" transform="rotate(45, 500, 500)" />
  <use href="#arm" transform="rotate(90, 500, 500)" />
  <use href="#arm" transform="rotate(135, 500, 500)" />
  <use href="#arm" transform="rotate(180, 500, 500)" />
  <use href="#arm" transform="rotate(225, 500, 500)" />
  <use href="#arm" transform="rotate(270, 500, 500)" />
  <use href="#arm" transform="rotate(315, 500, 500)" />

  <circle cx="500" cy="500" r="335" className='stroke-primary fill-none' strokeWidth="75" />
  
  <circle cx="500" cy="500" r="55" className='fill-primary'  />
</svg>
  )
}

export default Logo