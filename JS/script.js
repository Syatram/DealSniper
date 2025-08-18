var itemsData;

// String consts
const URL_START = "https://www.roblox.com/catalog/";
const DEAL_TAG = "DEAL";
const ITEM_TAG = "ITEM"

// Number consts
const DEAL_THRESHOLD = -1.0;
const VALUE_THRESHOLD = 0;
const ITEM_TIME_TO_RESET = 60;
const DEALS_TIME_TO_RESET = 2;

const port = chrome.runtime.connect();

function periodicMessage(tag, timeToReset) {
    var timestamp = new Date().getSeconds; // Set the timestamp for the first time

    setInterval(() => {
        if(new Date().getSeconds - timestamp < timeToReset) return; 

        timestamp = new Date().getSeconds;
        port.postMessage(tag); 
    }, timeToReset)
}

function onDealMessage(message) {
    var activities = message["activities"];
    timestampDeals = new Date().getSeconds;
    
    
    for(let i = 0; i < activities.length; i++) {
        const activity = activities[i];
        const item = itemsData['items'][activity[2]];
        const ITEM_VALUE = item[4];
        
        if(
            item[7] == 1 // Is projected?
            //|| item[2] > -1 // Is valued?
            || (ITEM_VALUE - activity[3])  / ITEM_VALUE < DEAL_THRESHOLD // Is below deal threshold?
            || ITEM_VALUE < VALUE_THRESHOLD // Is below value threshold?
        ) continue;

        port.postMessage(URL_START + activity[2]);
    }
}

function onItemMessage(message) { itemsData = message; }

function messaged(message) {
    var type = message["type"];
    
    console.log("Message received: " + type);
    if(type === DEAL_TAG && itemsData) {
        onDealMessage(message["info"]);
    } else if(type === ITEM_TAG) {
        onItemMessage(message["info"]);
    }
}


port.onMessage.addListener(messaged)


port.postMessage(ITEM_TAG);
port.postMessage(DEAL_TAG); 

periodicMessage(ITEM_TAG, 20000);
periodicMessage(DEAL_TAG, 2000);