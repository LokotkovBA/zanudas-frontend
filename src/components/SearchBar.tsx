import React, { ChangeEventHandler } from 'react';

interface SearchBarProps {
    searchHandleChange: ChangeEventHandler<HTMLInputElement>;
    searchTerm: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchHandleChange, searchTerm }) => {
    return (<input className="search" type="text" placeholder="Search" onChange={searchHandleChange} value={searchTerm} />);
};
