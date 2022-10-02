export function getBackendAddress(): string{
    if(process.env.BACKEND_ADDRESS){
        return process.env.BACKEND_ADDRESS;
    }
    return '';
};
