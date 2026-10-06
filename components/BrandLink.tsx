import Link from "next/link";

export default function BrandLink({ href = "/", className = "wordmark" }: { href?: string; className?: string }) {
  return (
    <Link className={className} href={href} aria-label="ISMAGIC Ar4i Frame — на главную">
      <span className="brand-main">ISMAGIC</span><span className="brand-mark" aria-hidden="true">✳</span><span className="brand-sub">AR4I FRAME</span>
    </Link>
  );
}
