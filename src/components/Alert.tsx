import React from 'react';

interface AlertProps {
    cookieAlertClick?: () => void;
    message: string;
    show_button?: boolean;
    class_name: string;
}

export const Alert: React.FC<AlertProps> = ({ cookieAlertClick, message, show_button, class_name }) => {
    return (
        <div className={class_name}>
            {message}
            {show_button && <button className="button" type="button" onClick={cookieAlertClick}>Ok</button>}
        </div>
    );
};
