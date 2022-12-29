const fs = require("fs");
var sha256 = require('js-sha256')
const { parse } = require("csv-parse");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
require('dotenv').config();

const csvFilePath ='./data.csv'; // FILE URL
const access_token = process.env.ACCESS_TOKEN; 
const pixel_id = process.env.ACCESS_TOKEN;

const converted_data = []; // EMPTY ARRAY TO STORE AND LOG THE DATA

fs.createReadStream(csvFilePath) //START CSV READING STREAM
    .pipe(parse({ 
        delimiter: ",", //SET COLUMN DELIMITER      
        from_line: 2 
    }))
    .on("data", (row) => {
        const values = parseFloat(row[11].replace(/[^0-9\.,-]+/g,"")); // PRICE WITHOUT "$, €"
        const names = row[5].split(" "); //SPLIT NAME COLUMN IN TWO
        const unixTimestamp = Math.floor(new Date(row[10]).getTime()/1000) // CHECKOUT DATE TO UNIXTIME
        converted_data.push({
            'em': sha256(row[0]),   // EMAIL
            'ph': sha256(row[3]),   // PHONE NUMBER
            'fn': sha256(names[0]), // FIRST NAME
            'ln': sha256(names[1]), // LAST NAME
            'zp': sha256(row[6]),   // ZIP CODE
            'country': sha256(row[7]), //COUNTRY
            'ge': sha256(row[8]),      // GENDER
            'event_name': row[9],  
            'event_time': unixTimestamp, 
            'value': values,   // PRICE
            'action_source': 'physical_store'
        })
        const dataJson = 
        [
            {
                "event_name": sha256(row[9]),
                "event_time": unixTimestamp,
                "event_id": sha256(row[4]),       
                "action_source": 'physical_store',    
                "user_data": {
                    "client_user_agent": "adsamurai",
                    "em": [
                        sha256(row[0])
                    ],
                    "ph": [
                        sha256(row[3])
                    ],
                    "fn": [
                        sha256(names[0])
                    ],
                    "ln": [
                        sha256(names[1])
                    ],
                    "ge": [
                        sha256(row[8])
                    ],
                    "zp": [
                        sha256(row[6])
                    ],
                    "country": [
                        sha256(row[7])
                    ],
                 },
                 "custom_data": {
                    "value": values,
                    "currency": "EUR",
                 }
            }
        ]
    
    data = JSON.stringify(dataJson); 
    console.log(data);
    const httpPayload =
      "&data=" + data;
    
    // Send Offline Conversion Event
    http = new XMLHttpRequest();
    http.open(
      "POST",
      `https://graph.facebook.com/v15.0/${pixel_id}/events?access_token=${access_token}`,
      false
    );
    http.send(httpPayload);
    console.log("Offline Conversion Result: HTTP " + http.status);
    console.log(http.responseText)
    })
    .on("error", (error) => {
        console.log(error.message);
    })
    .on("end", () => {
        console.log(converted_data);
    });
