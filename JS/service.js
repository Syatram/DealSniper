var re = new RegExp("https://www.roblox.com/catalog/*");
var lastItem; // The last link which was opened (To prevent the same link being opened twice. hopefully)

const ITEM_DETAILS_URL = "https://api.rolimons.com/items/v2/itemdetails";
const DEAL_ACTIVITY_URL = "https://api.rolimons.com/market/v1/dealactivity";
const EXTENSION_URL = "chrome-extension://jojjfakoooofcaklcobonkfcpmoojoji";

var port;

function tableThing(tag, info) {
    return {
        "type" : tag,
        "info" : info
    };
}

function GET(url, tag) {
    try {         
        fetch(url).then(r => r.json()).then(result => {
            console.log(result);
            port.postMessage(tableThing(tag, result));
        });
    } catch(error) {
        console.log(error);
    } 
}



function messaged(message) {
    if(message === "ITEM") { // Message is for getting item details
        GET(ITEM_DETAILS_URL, "ITEM");
    } else if(message === "DEAL") { // Message is for getting deal activities
        GET(DEAL_ACTIVITY_URL, "DEAL");
    } else if(re.test(message)) { // Message is an item link for a deal
        if(message === lastItem) { return; }
        lastItem = message;

        chrome.tabs.create({url : message});
        chrome.notifications.create(
        "deal-found" + new Date().getSeconds(),
        {
            type: "basic",
            iconUrl: EXTENSION_URL + "/Images/wojak.jpeg",
            title: "DEAL FOUND!",
            message: "I FOUND A DEAL!",
            silent: false
        },
        () => {});
    }
}

chrome.runtime.onConnect.addListener((port) => { 
    this.port = port;
    port.onMessage.addListener(messaged) 
});



