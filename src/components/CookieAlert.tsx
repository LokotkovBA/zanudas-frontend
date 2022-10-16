import React from 'react'

interface CookieAlertProps {
    cookieAlertClick: () => void;
}

export const CookieAlert: React.FC<CookieAlertProps> = ({cookieAlertClick}) => {
        return (
            <div className='cookie-alert'>
                This website uses cookies to keep you logged in!
                <button onClick={cookieAlertClick}>Ok</button>
            </div>
        );
}