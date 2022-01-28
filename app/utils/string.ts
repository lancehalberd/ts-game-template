export const formatNumber = (
    origValue: string | number,
    isCurrency: boolean = false,
    isDistance: boolean = false,
    minimumFractionDigits: number = 0
): string => {
    const currencySymbol = '$';
    const asNum = Number(origValue);
    const adjustedValue =
        isDistance && asNum > 1000000 ? Math.round(asNum / 1000) : asNum;
    let updatedString = adjustedValue.toLocaleString(undefined, {
        minimumFractionDigits,
    });
    if (isDistance) updatedString = `${updatedString} km`;
    return isCurrency ? `${currencySymbol}${updatedString}` : updatedString;
};
