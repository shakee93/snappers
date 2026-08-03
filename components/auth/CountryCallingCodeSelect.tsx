"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronsUpDown } from "lucide-react";
import { countries, type Country } from "@/data/countries";
import { authInputClassName } from "@/components/auth/authStyles";
import { cn } from "@/lib/utils";

type CountryCallingCodeSelectProps = {
  id?: string;
  value: string;
  onChange: (countryCode: string) => void;
  disabled?: boolean;
};

const MAX_VISIBLE_OPTIONS = 60;
const PANEL_HEIGHT = 264;

/** Windows does not render emoji flags — use PNGs instead. */
function flagSrc(countryCode: string): string {
  return `https://flagcdn.com/20x15/${countryCode.toLowerCase()}.png`;
}

function CountryFlag({
  code,
  name,
  className,
}: {
  code: string;
  name: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny CDN flag; next/image not worth the remote config
    <img
      src={flagSrc(code)}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
      aria-hidden
      title={name}
      className={cn("shrink-0 rounded-[2px] object-cover", className)}
    />
  );
}

const CountryCallingCodeSelect = ({
  id = "auth-country-code",
  value,
  onChange,
  disabled = false,
}: CountryCallingCodeSelectProps) => {
  const selected =
    countries.find((country) => country.code === value) ??
    countries.find((country) => country.code === "LK") ??
    countries[0];

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [inputValue, setInputValue] = useState(selected.callingCode);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropUp, setDropUp] = useState(false);
  const deferredQuery = useDeferredValue(inputValue.trim().toLowerCase());

  // Keep the closed display in sync when the parent changes the selection
  // (e.g. reset), without clobbering an in-progress search.
  useEffect(() => {
    if (isOpen) return;
    setInputValue(selected.callingCode);
  }, [isOpen, selected]);

  const filteredCountries = useMemo(() => {
    if (!deferredQuery) {
      return countries.slice(0, MAX_VISIBLE_OPTIONS);
    }

    const matches: Country[] = [];
    for (const country of countries) {
      if (matches.length >= MAX_VISIBLE_OPTIONS) break;

      const haystack =
        `${country.name} ${country.code} ${country.callingCode}`.toLowerCase();
      if (haystack.includes(deferredQuery)) {
        matches.push(country);
      }
    }
    return matches;
  }, [deferredQuery]);

  const activeOptionIndex =
    activeIndex < filteredCountries.length ? activeIndex : -1;

  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;

    const activeOption = listRef.current?.querySelector<HTMLElement>(
      `[data-country-option-index="${activeIndex}"]`
    );
    activeOption?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
        setInputValue(selected.callingCode);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isOpen, selected]);

  useEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < PANEL_HEIGHT && rect.top > spaceBelow);
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement, { passive: true });
    window.addEventListener("scroll", updatePlacement, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("resize", updatePlacement);
      window.removeEventListener("scroll", updatePlacement, { capture: true });
    };
  }, [isOpen]);

  const commitCountry = useCallback(
    (country: Country) => {
      setInputValue(country.callingCode);
      onChange(country.code);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    [onChange]
  );

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    setActiveIndex(-1);
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Calling codes must come from the list — free text would break E.164.
    setInputValue(selected.callingCode);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const activeOptionId =
    isOpen && activeOptionIndex >= 0
      ? `${id}-country-option-${activeOptionIndex}`
      : undefined;

  return (
    <div ref={containerRef} className="relative w-[7.5rem] shrink-0">
      {!isOpen ? (
        <CountryFlag
          code={selected.code}
          name={selected.name}
          className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2"
        />
      ) : null}
      <input
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        aria-label={`Country calling code, ${selected.name}`}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={`${id}-country-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={activeOptionId}
        className={cn(
          authInputClassName,
          "mt-0 truncate pr-8 text-sm",
          isOpen ? "pl-4" : "pl-10"
        )}
        value={inputValue}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          setIsOpen(true);
          setInputValue("");
          setActiveIndex(-1);
        }}
        onBlur={handleInputBlur}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!filteredCountries.length) return;
            setIsOpen(true);
            setActiveIndex((prev) =>
              prev < filteredCountries.length - 1 ? prev + 1 : 0
            );
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            if (!filteredCountries.length) return;
            setIsOpen(true);
            setActiveIndex((prev) =>
              prev > 0 ? prev - 1 : filteredCountries.length - 1
            );
            return;
          }

          if (event.key === "Enter") {
            event.preventDefault();
            if (isOpen && activeOptionIndex >= 0) {
              commitCountry(filteredCountries[activeOptionIndex]);
            }
            return;
          }

          if (event.key === "Escape") {
            setIsOpen(false);
            setActiveIndex(-1);
            setInputValue(selected.callingCode);
          }
        }}
      />
      <button
        type="button"
        disabled={disabled}
        className="absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500 disabled:opacity-60"
        aria-label="Toggle country suggestions"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setIsOpen((open) => {
            if (open) {
              setInputValue(selected.callingCode);
              return false;
            }
            setInputValue("");
            return true;
          });
          setActiveIndex(-1);
        }}
      >
        <ChevronsUpDown className="h-4 w-4" />
      </button>
      {isOpen ? (
        <ul
          ref={listRef}
          id={`${id}-country-listbox`}
          role="listbox"
          className={cn(
            "absolute z-30 max-h-64 min-w-full overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-xl [scrollbar-width:thin] dark:border-neutral-700 dark:bg-neutral-900",
            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-neutral-300 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5",
            dropUp ? "bottom-full mb-2" : "top-full mt-2"
          )}
        >
          {filteredCountries.length ? (
            <>
              {filteredCountries.map((country, index) => {
                const isActive = index === activeOptionIndex;
                const isCurrent = country.code === value;
                return (
                  <li key={country.code} role="presentation">
                    <button
                      type="button"
                      id={`${id}-country-option-${index}`}
                      data-country-option-index={index}
                      role="option"
                      aria-selected={isActive}
                      tabIndex={-1}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-header-cream dark:hover:bg-neutral-800",
                        isActive ? "bg-header-cream dark:bg-neutral-800" : "",
                        isCurrent ? "font-semibold" : ""
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => commitCountry(country)}
                    >
                      <CountryFlag code={country.code} name={country.name} />
                      <span className="text-neutral-600 dark:text-neutral-300">
                        {country.callingCode}
                      </span>
                    </button>
                  </li>
                );
              })}
              {!deferredQuery ? (
                <li
                  className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400"
                  role="presentation"
                >
                  Keep typing to narrow the country list.
                </li>
              ) : null}
            </>
          ) : (
            <li
              className="px-3 py-2 text-sm text-neutral-500 dark:text-neutral-400"
              role="presentation"
            >
              No matches found.
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
};

export default CountryCallingCodeSelect;
