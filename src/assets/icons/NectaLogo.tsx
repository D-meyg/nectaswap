// 1. Import the actual SVG file here so your bundler processes it
import logo from "./logo.svg";

interface NectaLogoProps {
  height?: number;
  className?: string;
}

export function NectaLogo({ height = 32, className }: NectaLogoProps) {
  return (
    <img
      src={logo}
      alt="NectaSwap"
      height={height}
      style={{ height: `${height}px`, width: "150px" }}
      className={className}
    />
  );
}
