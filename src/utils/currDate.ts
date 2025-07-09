export function getCurrDate() {
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date((new Date()).getTime() + istOffsetMs);

    const day = istDate.getUTCDate();
    const monthName = istDate.toLocaleString('en-US', {
        timeZone: "UTC",
        month: 'long'
    });
    const year = istDate.getUTCFullYear();

    const formattedDate = `${day} ${monthName}, ${year}`;
    return formattedDate;
}

getCurrDate()