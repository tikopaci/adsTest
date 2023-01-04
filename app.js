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
                    "match_keys": {
                        "email": [
                            sha256(row[0]),
                            sha256(row[1]),
                            sha256(row[2])
                        ],      
                        "phone": [
                            sha256(row[3])
                        ],
                        "fn": [
                            sha256(names[0])
                        ],
                        "ln": [
                            sha256(names[1])
                        ],
                        "gen": [
                            sha256(row[8])
                        ],
                        "zp": [
                            sha256(row[6])
                        ],
                        "country": [
                            sha256(row[7])
                        ]
                    },
                    "event_name": row[9],
                    "value": values,
                    "currency": "EUR",
                    "event_time": unixTimestamp,
                    "order_id": row[4],
                    "custom_data": {
                        event_source: "in_store"
                    },
                }
            ]
        }

        data = JSON.stringify(dataJson); // JSON TO STRING
        console.log(data);
        const httpPayload =
            "&access_token=" + access_token;
            "&upload_tag=in store purchase";
            "&data=" + data;
        
        // Send Offline Conversion Event
        http = new XMLHttpRequest();
        http.open(
        "POST",
        `https://graph.facebook.com/v15.0/${pixel_id}/events`,
        false
        );
        http.send(httpPayload);
        console.log("Offline Conversion Result: HTTP " + http.status); // LOG HTTP STATUS
        console.log(http.responseText) // LOG HTTP RESPONSE
    })
    .on("error", (error) => {
        console.log(error.message);
    })
    .on("end", () => {
        console.log("Finished");
    });
