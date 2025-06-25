export interface Contact {
  _id: string;
  name: string;
  phone: string;
  status: string;
  assignedTo?: {
    _id: string;
    username: string;
  };
  note?: string;
}

export interface Camp {
  _id: string;
  name: string;
  date?: string;
}

export interface Lead {
  _id: string;
  name: string;
  phone: string;
  status?: string;
  assignedTo?: {
    _id: string;
    username: string;
  };
  note?: string;
  camp?: string;
}
