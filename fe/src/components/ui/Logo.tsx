import React from 'react';

const Logo = ({ size = 120 }: { size?: number }) => (
  <svg
    width={size}
    height={size * 0.55}
    viewBox="0 0 600 330"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    {/* Large O */}
    <ellipse cx="90" cy="160" rx="80" ry="140" stroke="#16b6bb" strokeWidth="8" fill="none" />
    {/* LIVA */}
    <text x="180" y="110" fontFamily="Montserrat, Arial, sans-serif" fontWeight="500" fontSize="110" fill="#16b6bb" letterSpacing="8">LIVA</text>
    {/* SKIN • HAIR • BODY */}
    <text x="180" y="180" fontFamily="Montserrat, Arial, sans-serif" fontWeight="400" fontSize="38" fill="#222" letterSpacing="2">SKIN</text>
    <text x="295" y="180" fontFamily="Montserrat, Arial, sans-serif" fontWeight="400" fontSize="38" fill="#222">•</text>
    <text x="325" y="180" fontFamily="Montserrat, Arial, sans-serif" fontWeight="400" fontSize="38" fill="#222" letterSpacing="2">HAIR</text>
    <text x="440" y="180" fontFamily="Montserrat, Arial, sans-serif" fontWeight="400" fontSize="38" fill="#222">•</text>
    <text x="470" y="180" fontFamily="Montserrat, Arial, sans-serif" fontWeight="400" fontSize="38" fill="#222" letterSpacing="2">BODY</text>
    {/* CLINIC with lines */}
    <rect x="180" y="210" width="90" height="4" fill="#16b6bb" />
    <rect x="430" y="210" width="90" height="4" fill="#16b6bb" />
    <text x="300" y="245" fontFamily="Montserrat, Arial, sans-serif" fontWeight="500" fontSize="38" fill="#16b6bb" letterSpacing="8">CLINIC</text>
  </svg>
);

export default Logo; 