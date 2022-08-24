export function assert(condition, message: string | null = null, more: any = null) {
    if (!condition) {
        if (more) throw message + " " + more;
        else if (message) throw message;
        else throw "Assertion failed";
    }
}

export function htmlEntities(str: string): string {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
