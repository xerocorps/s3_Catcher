// Use the provided regex to extract URLs from the webpage source code
const regex = /(?:https?|ftp|smtp|unknown|sftp|file|data|telnet|ssh|ws|wss|git|svn|gopher):\/\/(?:[^\s:@'"]+(?::[^\s:@'"]*)?@)?(?:[_A-Z0-9.-]+|\[[_A-F0-9]*:[_A-F0-9:]+\])(?::\d{1,5})?(?:\/[^\s'"]*)?(?:\?[^\s'"]*)?(?:#[^\s'"]*)?/gi;
const urls = [...document.documentElement.innerHTML.matchAll(regex)].map(match => match[0]);

// Send the extracted URLs along with the current tab URL to the background script for processing
chrome.runtime.sendMessage({ action: "extracted_urls", urls });
