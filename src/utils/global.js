
export const shortAddress = (addr) => {
    if(!addr) return "";
    const address  = addr?.trim().toString();
    const frontStr = address?.substring(0, 5);

    const afterStr = address?.substring(address.length - 4, address.length);

    return `${frontStr}...${afterStr}`;
};



