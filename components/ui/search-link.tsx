"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type SearchLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function withCurrentSearch(href: string) {
  return `${href}${window.location.search}`;
}

function isPlainClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function SearchLink({
  href,
  onClick,
  onAuxClick,
  replace,
  scroll,
  ...props
}: SearchLinkProps) {
  const router = useRouter();

  const carrySearch = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = withCurrentSearch(href);
  };

  return (
    <Link
      href={href}
      replace={replace}
      scroll={scroll}
      {...props}
      onAuxClick={(event) => {
        onAuxClick?.(event);
        carrySearch(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        carrySearch(event);
        if (!isPlainClick(event)) return;
        event.preventDefault();
        const target = withCurrentSearch(href);
        if (replace) router.replace(target, { scroll });
        else router.push(target, { scroll });
      }}
    />
  );
}
