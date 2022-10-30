import React from 'react'
import { Link } from "react-scroll";

interface UpButtonProps {

}

export const UpButton: React.FC<UpButtonProps> = () => {
        return (
        <div className="up-zone">
            <Link to='menu' smooth={true}>
                <button className='top-button'>Up</button>
            </Link>
        </div>
        );
}