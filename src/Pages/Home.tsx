import Header from "../components/Header";
import Dropdown from "../components/Dropdown";
import DataTable from "../components/DataTable";
import ContactForm from "../components/ContactForm";
import Spinner from "../components/Spinner";
import { UserPlus, Filter, User } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFunctions } from "../services/api";
import { isTripDateExpired } from "../utils/dateUtils";
import type { Contact, Camp, Lead } from "../types";

interface HomeProps {
  onLogout: () => void;
}

interface User {
  _id: string;
  username: string;
}

const Home = ({ onLogout }: HomeProps) => {
  const [selectedTrip, setSelectedTrip] = useState<string>("");
  const [selectedContactStatus, setSelectedContactStatus] = useState<string>(
    () => {
      return localStorage.getItem("pathemari::contactStatusFilter") || "all";
    }
  );
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isLoadingCamps, setIsLoadingCamps] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [tripOptions, setTripOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isTripExpired, setIsTripExpired] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>(() => {
    return localStorage.getItem("pathemari::assigneeFilter") || "all";
  });
  const [assigneeOptions, setAssigneeOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const username = localStorage.getItem("pathemari::userName");

  useEffect(() => {
    const fetchCamps = async () => {
      try {
        setIsLoadingCamps(true);
        const res = await apiFunctions.listCamps();
        const tripOptionsData =
          res?.data?.map((camp: Camp) => ({
            value: camp._id,
            label: camp.name,
          })) || [];
        setTripOptions(tripOptionsData);

        // Automatically select the first trip if available
        if (tripOptionsData.length > 0 && !selectedTrip) {
          setSelectedTrip(tripOptionsData[0].value);
        }
      } catch (error) {
        console.error("Error fetching camps:", error);
      } finally {
        setIsLoadingCamps(false);
      }
    };

    fetchCamps();
  }, [selectedTrip]);

  // Update selected trip data and check if expired when selectedTrip changes
  useEffect(() => {
    const fetchCamps = async () => {
      try {
        const res = await apiFunctions.listCamps();
        const selectedCamp = res?.data?.find(
          (camp: Camp) => camp._id === selectedTrip
        );

        if (selectedCamp?.date) {
          const expired = isTripDateExpired(selectedCamp.date);
          setIsTripExpired(expired);
        } else {
          setIsTripExpired(false);
        }
      } catch (error) {
        console.error("Error fetching camp data:", error);
        setIsTripExpired(false);
      }
    };

    if (selectedTrip) {
      fetchCamps();
    } else {
      setIsTripExpired(false);
    }
  }, [selectedTrip]);

  // Load leads when a trip is selected
  useEffect(() => {
    if (selectedTrip) {
      const fetchContacts = async () => {
        try {
          setIsLoadingContacts(true);
          const res = await apiFunctions.listLeads(selectedTrip);
          // Transform the API response to match our Contact interface
          const transformedContacts = res.data.map((contact: Lead) => ({
            ...contact,
            status: contact.status || "new",
          }));
          setContacts(transformedContacts);
        } catch (error) {
          console.error("Error fetching contacts:", error);
          setContacts([]);
        } finally {
          setIsLoadingContacts(false);
        }
      };

      fetchContacts();
    } else {
      setContacts([]);
    }
  }, [selectedTrip]);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "pathemari::contactStatusFilter",
      selectedContactStatus
    );
  }, [selectedContactStatus]);

  useEffect(() => {
    localStorage.setItem("pathemari::assigneeFilter", selectedAssignee);
  }, [selectedAssignee]);

  // Fetch users for assignee filter
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFunctions.listUsers();
        const options = [
          { value: "all", label: "All" },
          { value: "unassigned", label: "Unassigned" },
          ...res.data.map((user: User) => ({
            value: user._id,
            label: user.username,
          })),
        ];
        setAssigneeOptions(options);
      } catch {
        setAssigneeOptions([
          { value: "all", label: "All" },
          { value: "unassigned", label: "Unassigned" },
        ]);
      }
    };
    fetchUsers();
  }, []);

  const contactStatusOptions = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "waiting for payment", label: "Waiting for payment" },
    { value: "cancelled", label: "Cancelled" },
    { value: "confirmed", label: "Confirmed" },
  ];

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsContactFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsContactFormOpen(false);
    setSelectedContact(null);
  };

  const handleAddNewContact = () => {
    setSelectedContact(null); // Clear any selected lead
    setIsContactFormOpen(true);
  };

  const handleSaveContact = async (updatedContact: Contact) => {
    // Update the local state instead of refetching from API
    setContacts((prevContacts) => {
      // Check if this lead already exists in our list
      const existingContact = prevContacts.find(
        (contact) => contact._id === updatedContact._id
      );

      if (existingContact) {
        // Update existing lead
        return prevContacts.map((contact) =>
          contact._id === updatedContact._id ? updatedContact : contact
        );
      } else {
        // Add new lead
        return [...prevContacts, updatedContact];
      }
    });
  };

  // Filter leads by status and assignee before passing to DataTable
  const filteredContacts = contacts.filter((contact) => {
    const statusMatch =
      selectedContactStatus === "all" ||
      contact.status === selectedContactStatus;
    const assigneeMatch =
      selectedAssignee === "all" ||
      (selectedAssignee === "unassigned" && !contact.assignedTo) ||
      (contact.assignedTo && contact.assignedTo._id === selectedAssignee);
    return statusMatch && assigneeMatch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <Header onLogout={onLogout} username={username || "Unknown User"} />

      {isLoadingCamps ? (
        <main className="flex-1 pt-[60px] pb-safe pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <Spinner />
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                Loading...
              </span>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 pt-[60px] pb-safe pb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Top Controls Section */}
            <div className="mt-6 mb-6">
              <div className="flex gap-2 items-center">
                <Dropdown
                  options={tripOptions}
                  value={selectedTrip}
                  onChange={setSelectedTrip}
                  placeholder="Select a trip"
                  className="flex-1"
                />
                <button
                  className="h-[40px] px-4 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 font-normal border border-gray-300 dark:border-gray-600 shadow-sm flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:text-gray-600 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
                  onClick={handleAddNewContact}
                  disabled={isTripExpired}
                >
                  <UserPlus size={18} />
                  New Lead
                </button>
              </div>
              {selectedTrip && (
                <div className="flex gap-2 mt-4">
                  <div className="flex-[2]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Filter className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        Status
                      </span>
                    </div>
                    <Dropdown
                      options={contactStatusOptions}
                      value={selectedContactStatus}
                      onChange={setSelectedContactStatus}
                      placeholder="Select a lead status"
                      className="h-[40px]"
                    />
                  </div>
                  <div className="flex-[2]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                        Assignee
                      </span>
                    </div>
                    <Dropdown
                      options={assigneeOptions}
                      value={selectedAssignee}
                      onChange={setSelectedAssignee}
                      placeholder="Select assignee"
                      className="h-[40px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Data Table Section */}
            {selectedTrip ? (
              <div className="flex-1 min-h-0">
                {isLoadingContacts ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner />
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      Loading leads...
                    </span>
                  </div>
                ) : (
                  <DataTable
                    data={filteredContacts}
                    itemsPerPage={10}
                    statusFilter={selectedContactStatus}
                    assigneeFilter={selectedAssignee}
                    onContactClick={handleContactClick}
                    isTripExpired={isTripExpired}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-20 text-gray-500 dark:text-gray-400">
                Please select a trip to view leads
              </div>
            )}
          </div>
        </main>
      )}

      {isContactFormOpen && (
        <ContactForm
          contact={selectedContact}
          isOpen={isContactFormOpen}
          onSave={handleSaveContact}
          onClose={handleCloseForm}
          selectedTrip={selectedTrip}
          isTripExpired={isTripExpired}
        />
      )}
    </div>
  );
};

export default Home;
