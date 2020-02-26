export default function getChannelName(): string {
    const url = window.location.href;
    const reg = /\/c\/(.*)\//g
    const match = reg.exec(url);
    if(match) return match[1];
    else return "NaN"
}