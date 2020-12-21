const fs = require('fs');
const ConsoleGrid = require("console-grid");

// Helper functions:
const isInteger = (str) => {
    const regex = /^\d+$/;
    return regex.exec(str) !== null;
}

const isFloat = (str) => {
    const regex = /^[\d\.,]+$/;
    return regex.exec(str) !== null;
}

const parseString = str => {
    if(isInteger(str)) return parseInt(str);
    if(isFloat(str)) return parseFloat(str);
    return str;
}

const loadConfig = () => {
    const config = JSON.parse(fs.readFileSync('config.json').toString());
    return config;
}


const loadEquimentInformation = () =>  {
    const lines = fs.readFileSync('inputs.csv').toString()
        // Split into lines
        .split('\n')
        // Trim empty chars from lines
        .map(l => l.trim())
        // Filter out empty lines (-> Some editors append an empty last line)
        .filter(l => !!l)
        // Split lines into individual elements (and remove leading/trailing spaces)
        .map(l => l.split(',').map(e => e.trim()));
    const header = lines[0];

    // Transform into array of objects:
    return lines.slice(1).map(l => {

        // Use reduce to create an object from the csv-line + header
        return l.reduce((obj, e, index) => {
            const key = header[index];
            const value = parseString(e)
            obj[key] = value;
            return obj;
        }, {})
        
    })
}

// Calculate best filling for a transport given the list of items
// Performs a simple greedy fill algorithm, most useful first -> since items are sorted.
// And the just fills remaining space with anything.
const calculateBestFill = (transport, items) => {
    let capacity = transport.capacity - transport.driver_weight;
    let filled = false;
    const fillList = {}
    while(!filled){
        bestItemIndex = items.findIndex(i => i.weight < capacity && i.amount > 0);
        if(bestItemIndex === -1) {
            filled = true
            break;
        };

        capacity -= items[bestItemIndex].weight;
        items[bestItemIndex].amount -= 1;

        const { name } = items[bestItemIndex];
        if(!fillList[name]){
            fillList[name] = 0;
        };
        fillList[name] += 1;
        // console.log(`Capacity remaining: ${capacity}`)
    }

    // console.log(`Capacity Left: ${capacity} in transport: ${transport.name}`)
    return fillList;
}

const solveShipping = (options) => {
    const { items, config: { transports }} = options;

    // Create a local copy of items, so we can modify them
    // and sort by usefullness
    const localItems = JSON.parse(JSON.stringify(items))
        .sort((a, b) => b.usefullness - a.usefullness);
    let itemsToShip = localItems.reduce((total, item) => total + item.amount, 0);

    const shippingLists = []

    while(itemsToShip > 0 ){
        // fill the transports:
        const shippingList = transports.reduce((list, transport) => {
            const { name } = transport;
            const shippingList = calculateBestFill(transport, localItems);
            list[name] = shippingList;
            return list;
        }, {});
        shippingLists.push(shippingList)

        // Calculate amount of items remaining
        itemsToShip = localItems.reduce((total, item) => total + item.amount, 0);
        console.log(`Solving Shipping List, ${itemsToShip} items remaining.`)
    }


    return shippingLists;
}

const eqInformation = loadEquimentInformation()
const config = loadConfig();

/* pretty-prints a shipping list. [relies on closure access to eqInformation]*/
const ppShippingList = (shippingList) => {
    const transporterNames = Object.keys(shippingList);

    // Print as transporter id | item name | amount | item weight | total weight
    // Print the header
    const grid = new ConsoleGrid();

    // console.log('transporterName \t\t Item Name \t\t Amount \t\t Weight \t\t totalWeight')
    const rows = []
    for(const transporterName of transporterNames){
        const items = Object.keys(shippingList[transporterName])
            .map(itemName => eqInformation.find(eqItem => eqItem.name === itemName))
        let totalTransporterWeight = 0;
        const itemrows = [];

        for(const item of items){
            const amount = shippingList[transporterName][item.name];
            const totalWeight = amount * item.weight;
            totalTransporterWeight += totalWeight;

            const itemInfo = {
                transporter: transporterName,
                itemname: item.name,
                amount,
                weight: item.weight,
                totalWeight
            }
            itemrows.push(itemInfo)
        }

        const transporterrow = {
            name: transporterName,
            capacity: config.transports.find(tr => tr.name === transporterName).capacity,
            load: totalTransporterWeight + config.transports.find(tr => tr.name === transporterName).driver_weight,
            subs: itemrows,
        }
        rows.push(transporterrow);
    }

    const data = {
        columns: [
            {
                id: "name",
                name: "Transporter Name",
                type: "string",
            },
            {
                id: "capacity",
                name: "Transporter Capacity (g)",
                type: "number",
            },
            {
                id: "load",
                name: "Transporter Load (g)",
                type: "number",
            },
            {
                id: "itemname",
                name: "Item Name",
                type: "string",
            },
            {
                id: "amount",
                name: "Item Amount",
                type: "number",
            },
            {
                id: "weight",
                name: "Item Weight (g)",
                type: "number",
            },
            {
                id: "totalWeight",
                name: "Total Item weight (g)",
                type: "number",
            }
        ],
        rows
    }

    grid.render(data);

}


const shippingLists = solveShipping({ items: eqInformation, config})
shippingLists.map(ppShippingList)

