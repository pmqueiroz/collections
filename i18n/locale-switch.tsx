"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  SegmentedControl,
  type SegmentedSize,
} from "../components/ui/segmented-control";
import { useDictionary, useLocale } from "./locale-provider";
import { LOCALE_NAME, LOCALES, type Locale, switchLocalePath } from "./locales";

const LOCALE_OPTIONS = LOCALES.map((value) => ({
  value,
  label: value.split("-")[0].toUpperCase(),
  name: LOCALE_NAME[value],
}));

export function useLocaleSwitch() {
  const locale = useLocale();
  const dict = useDictionary();
  const pathname = usePathname();
  const router = useRouter();

  const change = (next: Locale) => {
    if (next === locale) return;
    router.push(
      `${switchLocalePath(pathname, next)}${window.location.search}${window.location.hash}`,
    );
  };

  const current = LOCALE_OPTIONS.find((option) => option.value === locale);

  return {
    locale,
    label: dict.header.language,
    short: current?.label ?? locale,
    options: LOCALE_OPTIONS,
    change,
  };
}

export function LocaleSwitch({
  size,
  className,
}: {
  size?: SegmentedSize;
  className?: string;
}) {
  const { locale, label, options, change } = useLocaleSwitch();
  return (
    <SegmentedControl
      label={label}
      size={size}
      options={options}
      value={locale}
      onChange={change}
      className={className}
    />
  );
}
