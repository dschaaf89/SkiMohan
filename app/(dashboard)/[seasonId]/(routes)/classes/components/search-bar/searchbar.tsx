import React, { useState, ChangeEvent } from "react";
import axios from "axios";
import { Search } from 'lucide-react';

import "./SearchBar.css";

interface Student {
  NAME_FIRST: string;
  NAME_LAST: string;
  // Add other user properties as needed
}

interface SearchBarProps {
  setResults: (results: Student[]) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ setResults }) => {
  const [input, setInput] = useState<string>("");

  const fetchData = async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      const response = await axios.get(`/api/[seasonId]/students/findStudent`, {
        params: { lastName: value }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setResults([]);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInput(value);

    // Debounce the API call
    const timer = setTimeout(() => {
      fetchData(value);
    }, 500);

    return () => clearTimeout(timer);
  };

  return (
    <div className="input-wrapper">
      <Search id="search-icon" />
      <input
        type="text"
        placeholder="Type to search..."
        value={input}
        onChange={handleChange}
      />
    </div>
  );
};
