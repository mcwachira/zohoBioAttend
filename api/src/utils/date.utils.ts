// const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
//     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//
// export function formatDate(date: Date): string {
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = MONTHS[date.getMonth()];
//     const year = date.getFullYear();
//     return `${day}-${month}-${year}`;
// }
//
// export function formatDateTime(date: Date): string {
//     const day = String(date.getDate()).padStart(2, "0");
//     const month = MONTHS[date.getMonth()];
//     const year = date.getFullYear();
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");
//     return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
// }


// date.utils.ts
export function formatDate(date: Date) {
    const day = date.toLocaleString("en-US", { day: "2-digit" });
    const month = date.toLocaleString("en-US", { month: "short" }); // ✅ "Sep"
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

export function formatDateTime(date: Date) {
    const formattedDate = formatDate(date);
    const time = date.toLocaleTimeString("en-US", { hour12: false });
    return `${formattedDate} ${time}`;
}
