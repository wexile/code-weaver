
import * as React from "react"
import Image from "next/image"
import FirebaseStudioLogo from './firebase_studio.png';

export function FirebaseLogo(props: { className?: string }) {
  return <Image src={FirebaseStudioLogo} alt="Firebase Studio Logo" className={props.className} unoptimized />;
}
