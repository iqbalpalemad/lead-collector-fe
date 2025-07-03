import React, { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
  label?: string;
  searchable?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  error,
  label,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search term and disabled status
  const filteredOptions = options.filter((option) => {
    if (option.disabled) return false;
    if (!searchable || !searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      option.value.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case "Enter":
        event.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        event.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm("");
        break;
    }
  };

  const handleOptionSelect = (option: DropdownOption) => {
    onChange(option.value);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm("");
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setHighlightedIndex(-1);
        setSearchTerm("");
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        <div
          className={`
            relative w-full border rounded-md shadow-sm cursor-pointer ${className}
            ${
              disabled
                ? "bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
            }
            ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
            ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}
          `}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between px-3 h-10">
            <div className="flex-1 min-w-0">
              <span
                className={`block truncate text-sm ${
                  selectedOption
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>

            <div className="ml-2 flex-shrink-0">
              <svg
                className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="px-2 pt-2 pb-1 bg-transparent">
                <div className="relative">
                  <Search className="absolute left-1 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                    className="w-full pl-6 pr-2 py-1.5 rounded-md text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-auto">
              {filteredOptions.length > 0 ? (
                <ul role="listbox" className="py-1">
                  {filteredOptions.map((option, index) => (
                    <li
                      key={option.value}
                      className={`
                        px-3 py-2 text-sm cursor-pointer select-none
                        ${
                          index === highlightedIndex
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }
                        ${
                          option.disabled ? "opacity-50 cursor-not-allowed" : ""
                        }
                      `}
                      onClick={() =>
                        !option.disabled && handleOptionSelect(option)
                      }
                      role="option"
                      aria-selected={option.value === value}
                    >
                      {option.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "No matching options found"
                    : "No options available"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;
