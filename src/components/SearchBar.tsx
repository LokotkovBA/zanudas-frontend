import { ChangeEventHandler } from 'react'
import { Link } from "react-scroll";

interface SearchBarProps {
    searchHandleChange: ChangeEventHandler<HTMLInputElement>;
    searchTerm: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({searchHandleChange, searchTerm}) => {
        return (
        <div className='top-bar'>
            <Link to='menu' smooth={true}>
                <button className='top-button'>Up</button>
            </Link>
            <input className='search-bar' type='text' placeholder='Search' onChange={searchHandleChange} value={searchTerm} />
        </div>);
}