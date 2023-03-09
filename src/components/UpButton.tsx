import React from 'react';
import { Link } from 'react-scroll';

interface UpButtonProps {
    show: boolean
}

export const UpButton: React.FC<UpButtonProps> = ({ show }) => {
    return (
        <Link className={`up-button up-button--${show ? 'show' : 'hide'}`} to="menu" smooth={true}>
            <button type="button" className="top-button">Up</button>
        </Link>
    );
};
