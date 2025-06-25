import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Users,
  Phone,
  CircleDashed,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  PhoneCall,
  User,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import whatsappIcon from "../assets/whatsapp-icon.svg";
import type { Contact } from "../types";

interface DataTableProps {
  data: Contact[];
  itemsPerPage?: number;
  className?: string;
  loading?: boolean;
  statusFilter?: string;
  assigneeFilter?: string;
  onContactClick?: (contact: Contact) => void;
  isTripExpired?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  itemsPerPage = 10,
  className = "",
  loading = false,
  statusFilter = "",
  assigneeFilter = "all",
  onContactClick,
  isTripExpired = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<
    "name" | "phone" | "status" | "assignedTo"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentItemsPerPage, setCurrentItemsPerPage] = useState(itemsPerPage);
  const tableRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const previousPage = useRef(currentPage);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchStartTime = useRef<number>(0);

  // Available items per page options
  const itemsPerPageOptions = [5, 10, 20, 50, 100];

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = data.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.phone.includes(searchTerm) ||
          (contact.assignedTo &&
            contact.assignedTo.username
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }

    // Apply assignee filter
    if (assigneeFilter && assigneeFilter !== "all") {
      if (assigneeFilter === "unassigned") {
        filtered = filtered.filter((contact) => !contact.assignedTo);
      } else {
        filtered = filtered.filter(
          (contact) =>
            contact.assignedTo && contact.assignedTo._id === assigneeFilter
        );
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (sortField === "assignedTo") {
        aValue = (a.assignedTo?.username || "").toLowerCase();
        bValue = (b.assignedTo?.username || "").toLowerCase();
      } else {
        aValue = a[sortField].toLowerCase();
        bValue = b[sortField].toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  }, [
    data,
    searchTerm,
    sortField,
    sortDirection,
    statusFilter,
    assigneeFilter,
  ]);

  // Calculate pagination
  const totalPages = Math.ceil(
    filteredAndSortedData.length / currentItemsPerPage
  );
  const startIndex = (currentPage - 1) * currentItemsPerPage;
  const endIndex = startIndex + currentItemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to first page when search term changes or items per page changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, currentItemsPerPage]);

  // Scroll to top when page changes
  React.useEffect(() => {
    // Only scroll if the page actually changed (not on initial load or filter changes)
    if (previousPage.current !== currentPage && previousPage.current !== 0) {
      if (searchRef.current) {
        searchRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    previousPage.current = currentPage;
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(newPage);
  };

  const handleSort = (field: "name" | "phone" | "status" | "assignedTo") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setCurrentItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      new: {
        color:
          "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200",
        dot: "bg-blue-500",
        icon: Star,
        priority: 1,
        description: "New inquiry",
        action: "Lead",
      },
      pending: {
        color:
          "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200",
        dot: "bg-yellow-500",
        icon: Clock,
        priority: 2,
        description: "Awaiting response",
        action: "Follow up",
      },
      "waiting for payment": {
        color:
          "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200",
        dot: "bg-orange-500",
        icon: CreditCard,
        priority: 3,
        description: "Waiting for payment",
        action: "Send invoice",
      },
      confirmed: {
        color:
          "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200",
        dot: "bg-green-500",
        icon: CheckCircle,
        priority: 4,
        description: "Trip confirmed",
        action: "View details",
      },
      cancelled: {
        color:
          "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200",
        dot: "bg-red-500",
        icon: XCircle,
        priority: 5,
        description: "Cancelled",
        action: "Archive",
      },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        color:
          "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-200",
        dot: "bg-gray-500",
        icon: CircleDashed,
        priority: 0,
        description: "Unknown status",
        action: "Review",
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        <IconComponent className="w-3 h-3 mr-1.5" />
        <span className="hidden sm:inline">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <span className="sm:hidden">{status.charAt(0).toUpperCase()}</span>
      </div>
    );
  };

  const SortIcon = ({
    field,
  }: {
    field: "name" | "phone" | "status" | "assignedTo";
  }) => {
    if (sortField !== field) {
      return <div className="w-4 h-4" />;
    }

    return (
      <svg
        className={`w-4 h-4 ml-1 transition-transform ${
          sortDirection === "desc" ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  };

  // Mobile Card Component
  const ContactCard = ({ contact }: { contact: Contact }) => {
    const config = getStatusConfig(contact.status);

    return (
      <div
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-shadow duration-200 ${
          isTripExpired
            ? "opacity-75 hover:shadow-sm cursor-pointer"
            : "hover:shadow-md cursor-pointer"
        }`}
        onClick={() => onContactClick?.(contact)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center flex-1 min-w-0">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                {contact.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                {contact.name}
              </h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{contact.phone}</span>
              </div>
              {contact.assignedTo && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <User className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">
                    Assigned: {contact.assignedTo.username}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end ml-3 flex-shrink-0">
            {getStatusBadge(contact.status)}
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1 text-right">
              {config.description}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {isTripExpired ? "Tap to view" : "Tap to edit"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleCall(contact.phone, e)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200 font-medium text-xs border border-blue-200 dark:border-blue-700"
              title="Call lead"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Call
            </button>
            <button
              onClick={(e) => handleWhatsApp(contact.phone, e)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md transition-colors duration-200 font-medium text-xs border border-green-200 dark:border-green-700"
              title="WhatsApp lead"
            >
              <img src={whatsappIcon} alt="WhatsApp" className="w-3.5 h-3.5" />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Only handle touch events if there's more than one page
    if (totalPages <= 1) return;

    // Don't handle touch events on clickable elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input")
    ) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX; // Initialize touchEndX to prevent false swipes
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Only handle touch events if there's more than one page
    if (totalPages <= 1) return;

    // Don't handle touch events on clickable elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input")
    ) {
      return;
    }

    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    // Only handle touch events if there's more than one page
    if (totalPages <= 1) return;

    // Prevent swipe detection if it's a short touch (likely a click)
    const touchDuration = Date.now() - touchStartTime.current;
    const swipeThreshold = 50; // Reduced from 100 to 50 for higher sensitivity
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 30; // Reduced from 50 to 30 for higher sensitivity
    const maxTouchDuration = 800; // Increased from 500 to 800ms to allow slower swipes

    // Only process as swipe if:
    // 1. Touch duration is between 50ms and 800ms (reduced minimum, increased maximum)
    // 2. Swipe distance is significant enough
    // 3. Touch coordinates are properly initialized (not 0)
    // 4. Swipe velocity is reasonable (distance/duration)
    if (
      touchDuration > 50 && // Reduced from 100 to 50ms
      touchDuration < maxTouchDuration &&
      Math.abs(swipeDistance) > minSwipeDistance &&
      touchStartX.current !== 0 &&
      touchEndX.current !== 0
    ) {
      const swipeVelocity = Math.abs(swipeDistance) / touchDuration;

      // Only trigger if velocity is reasonable (reduced minimum velocity for higher sensitivity)
      if (swipeVelocity > 0.05 && swipeVelocity < 3.0) {
        // Reduced from 0.1 to 0.05, increased max from 2.0 to 3.0
        if (Math.abs(swipeDistance) > swipeThreshold) {
          if (swipeDistance > 0) {
            // Swipe left - go to next page
            if (currentPage < totalPages) {
              handlePageChange(currentPage + 1);
            }
          } else {
            // Swipe right - go to previous page
            if (currentPage > 1) {
              handlePageChange(currentPage - 1);
            }
          }
        }
      }
    }

    // Reset touch coordinates
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    const cleanedPhone = phone.replace(/\D/g, "");
    window.location.href = `tel:${cleanedPhone}`;
  };

  const handleWhatsApp = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the row click
    const cleanedPhone = phone.replace(/\D/g, "");

    // Add +91 country code if not already present
    const phoneWithCountryCode = cleanedPhone.startsWith("91")
      ? `+${cleanedPhone}`
      : `+91${cleanedPhone}`;

    // Use WhatsApp app link that works on mobile devices
    const whatsappUrl = `whatsapp://send?phone=${phoneWithCountryCode}`;

    // Try to open WhatsApp app, fallback to web if needed
    try {
      window.location.href = whatsappUrl;
    } catch {
      // Fallback to web version if app is not available
      window.open(`https://wa.me/${phoneWithCountryCode}`, "_blank");
    }
  };

  return (
    <div
      ref={tableRef}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Search Bar */}
      <div
        ref={searchRef}
        className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
      >
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-[15px]"
            />
          </div>
          {/* Items per page dropdown - inline and compact */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Show
            </span>
            <div className="relative">
              <select
                id="itemsPerPage"
                value={currentItemsPerPage}
                onChange={(e) =>
                  handleItemsPerPageChange(Number(e.target.value))
                }
                className="appearance-none pl-3 pr-6 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm cursor-pointer min-w-[48px]"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Page Number Indicator */}
      <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-25 dark:bg-gray-900">
        <div className="flex items-center justify-center">
          {totalPages > 1 && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
          )}
          <span
            className={`text-xs text-gray-500 dark:text-gray-400 ${
              totalPages > 1 ? "ml-2" : ""
            }`}
          >
            ({filteredAndSortedData.length} results)
          </span>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="block lg:hidden">
        <div className="p-4 space-y-4">
          {loading ? (
            // Loading skeleton for mobile
            Array.from({ length: currentItemsPerPage }).map((_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-600 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                </div>
              </div>
            ))
          ) : currentData.length > 0 ? (
            currentData.map((contact) => (
              <ContactCard key={contact._id} contact={contact} />
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {searchTerm || (statusFilter && statusFilter !== "all")
                  ? "No leads found"
                  : "No leads available"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                {searchTerm || (statusFilter && statusFilter !== "all")
                  ? "Try adjusting your search terms or filters."
                  : "Get started by adding your first lead."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  Lead Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                onClick={() => handleSort("phone")}
              >
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  Phone Number
                  <SortIcon field="phone" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  <CircleDashed className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
                onClick={() => handleSort("assignedTo")}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-400 dark:text-gray-500" />
                  Assigned To
                  <SortIcon field="assignedTo" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              // Loading skeleton
              Array.from({ length: currentItemsPerPage }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </td>
                </tr>
              ))
            ) : currentData.length > 0 ? (
              currentData.map((contact) => {
                const config = getStatusConfig(contact.status);
                return (
                  <tr
                    key={contact._id}
                    className={`transition-colors duration-150 group cursor-pointer ${
                      isTripExpired
                        ? "opacity-75 hover:bg-gray-50 dark:hover:bg-gray-800"
                        : "hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactClick?.(contact);
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-150">
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {contact.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                          {contact.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {getStatusBadge(contact.status)}
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {contact.assignedTo ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {contact.assignedTo.username}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500 italic">
                            Not assigned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleCall(contact.phone, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md transition-colors duration-200 font-medium text-xs border border-blue-200 dark:border-blue-700"
                          title="Call lead"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Call
                        </button>
                        <button
                          onClick={(e) => handleWhatsApp(contact.phone, e)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md transition-colors duration-200 font-medium text-xs border border-green-200 dark:border-green-700"
                          title="WhatsApp lead"
                        >
                          <img
                            src={whatsappIcon}
                            alt="WhatsApp"
                            className="w-3.5 h-3.5"
                          />
                          WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {searchTerm || (statusFilter && statusFilter !== "all")
                        ? "No leads found"
                        : "No leads available"}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                      {searchTerm || (statusFilter && statusFilter !== "all")
                        ? "Try adjusting your search terms or filters."
                        : "Get started by adding your first lead."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 text-center sm:text-left">
              <span className="font-medium">
                {startIndex + 1}-
                {Math.min(endIndex, filteredAndSortedData.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium">
                {filteredAndSortedData.length}
              </span>{" "}
              results
              {(searchTerm || (statusFilter && statusFilter !== "all")) && (
                <span className="text-gray-400 dark:text-gray-500 ml-2">
                  (filtered from {data.length} total)
                </span>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-end space-x-1">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 text-sm rounded-md min-w-[40px] font-medium transition-all duration-150 ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
