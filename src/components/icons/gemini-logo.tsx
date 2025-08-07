
import * as React from "react"
import Image from "next/image"
import GeminiSvg from './gemini.png';

export function GeminiLogo(props: { className?: string }) {
  return <Image src={GeminiSvg} alt="Gemini Logo" className={props.className} unoptimized />;
}
