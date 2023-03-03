import React from 'react';

interface LoaderBoxProps {

}

export const LoaderBox: React.FC<LoaderBoxProps> = () => {
    return (
        <div className="loader-box">
            <div className="loader" />
        </div>
    );
};
