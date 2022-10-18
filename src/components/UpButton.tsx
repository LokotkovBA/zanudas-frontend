import React from 'react'
import { Link } from "react-scroll";

interface UpButtonProps {

}

export const UpButton: React.FC<UpButtonProps> = () => {
        return (
        <Link to='menu' smooth={true}>
            <button className='top-button'>Up</button>
        </Link>);
}