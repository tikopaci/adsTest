const fs = require("fs");
const sha256 = require('js-sha256')
const { parse } = require("csv-parse");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
require('dotenv').config();

const csvFilePath ='./data.csv'; // FILE URL
const access_token = process.env.ACCESS_TOKEN; 
const pixel_id = process.env.ACCESS_TOKEN;

fs.createReadStream(csvFilePath) //START CSV READING STREAM
    .pipe(parse({ 
        delimiter: ",", //SET COLUMN DELIMITER      
        from_line: 2 
    }))
    .on("data", (row) => {
        const values = parseFloat(row[11].replace(/[^0-9\.,-]+/g,"")); // PRICE WITHOUT "$, €"
        const names = row[5].split(" "); //SPLIT NAME COLUMN IN TWO
        const unixTimestamp = Math.floor(new Date(row[10]).getTime()/1000) // CHECKOUT DATE TO UNIXTIME

        const dataJson = {
            "data": [
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
            ],
            "test_event_code": "TEST123"
        }
        
    
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
        console.log("Finished");
    });
