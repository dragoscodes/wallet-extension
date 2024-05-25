console.log("Content script loaded");

var providerAnnonced = false;

// Function to dispatch the announce event
function announceProvider(providerInfo, provider) {
    const announceEvent = new CustomEvent("eip6963:announceProvider", {
        detail: Object.freeze({ info: providerInfo, provider }),
    });
    window.dispatchEvent(announceEvent);
}

// Event listener for the requestProvider event
window.addEventListener("eip6963:requestProvider", () => {
    announceProvider();
    providerAnnonced = true;
});

document.addEventListener("DOMContentLoaded", () => {
    if (!providerAnnonced) {
        // Get provider info and provider from your background script
        chrome.runtime.sendMessage({ type: "wallet_getProviderInfo" }, (response) => {
            providerInfo = response.providerInfo;
            provider = response.provider;
            announceProvider(providerInfo, provider); // Announce the provider after getting the details
        });
    }
    const injectScript = (file_path, tag_id) => {
        const node = document.getElementsByTagName('body')[0];
        const script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', file_path);
        script.setAttribute('id', tag_id);
        node.appendChild(script);
    }

    injectScript(chrome.runtime.getURL('injected.js'), 'myInjectedScript');
});
