'use strict'
const fs = require('fs')
const yargs = require('yargs');
const SwaggerClient = require('swagger-client');
const ESI_URL = 'https://esi.evetech.net/latest/swagger.json';
const argv = yargs
    .option('corporations', {
        alias: 'c',
        description: 'get all NPC corporations and generate loyalty store offers json.',
        type: 'boolean',
    })
    .option('cropdesc', {
        alias: 'd',
        description: 'generate NPC corporations name.',
        type: 'boolean',
    })
    .option('itemdescription', {
        alias: 'i',
        description: 'generate loyalty store offers item description.',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;

if (argv.corporations) {
    // request ESI to get all NPC corporations

    var hasLoyalty = [];

    new SwaggerClient(ESI_URL).then(
        client => {
            client.apis.Corporation.get_corporations_npccorps()
                .then(
                    ret => {
                        // request ESI to Check it has lp store or not

                        var promise = Promise.resolve();
                        var interval = 1000;

                        ret.body.forEach(element => {

                            promise = promise.then(function () {
                                client.apis.Loyalty.get_loyalty_stores_corporation_id_offers({ corporation_id: element })
                                    .then(
                                        offersRet => {
                                            if (offersRet.data != "[]") {
                                                console.log(element + ' has offers.');
                                                hasLoyalty.push(element);

                                                fs.access("./public/LPStore/" + element, fs.constants.F_OK, (err) => {
                                                    if (err)
                                                        fs.mkdirSync("./public/LPStore/" + element);

                                                    fs.open("./public/LPStore/" + element + "/loyalty.json", "w", (err, fd) => {
                                                        fs.write(fd, offersRet.data, (err, fd) => {
                                                            fs.close(fd, () => { });
                                                        });
                                                    });

                                                });
                                            }
                                            else {
                                                console.log(element + ' has offers,but is empty.');
                                            }
                                        },
                                        reason => {
                                            console.log(element + ' failed on api call: ' + reason.response.data)
                                        }
                                    )

                                return new Promise(function (resolve) {
                                    setTimeout(resolve, interval);
                                });
                            });
                        });

                        promise.then(function () {
                            console.log('Finished.');

                            fs.open("./public/LPStore/corporation.json", "w", (err, fd) => {
                                fs.write(fd, JSON.stringify(hasLoyalty), (err, fd) => {
                                    fs.close(fd, () => { });
                                });
                            });
                        });
                    },
                    reason => console.error('failed on api call: ' + reason)
                )
        },
        reason => console.error('failed to load the spec: ' + reason)
    );
}

if (argv.cropdesc) {
    fs.open("./public/LPStore/corporation.json", "r+", (err, fd) => {
        if (err) {
            console.error("Can't find corporation.json,generate first");
            return;
        }

        fs.readFile(fd, (err, data) => {
            if (err) {
                console.error("Read corporation.json error");
                return;
            }
            fs.close(fd, () => { });

            var corporations = JSON.parse(data);

            new SwaggerClient(ESI_URL).then(
                client => {
                    client.apis.Universe.post_universe_names(
                        {
                            ids: corporations
                        }
                    )
                        .then(
                            ret => {
                                fs.open("./public/LPStore/corporation_description.json", "w", (err, fd) => {
                                    fs.write(fd, ret.data, (err, fd) => {
                                        fs.close(fd, () => { });
                                    });
                                });
                            },
                            reason => console.error('failed on api call: ' + reason)
                        );
                },
                reason => console.error('failed to load the spec: ' + reason)
            );
        });
    });
}

if (argv.itemdescription) {
    fs.open("./public/LPStore/corporation.json", "r+", (err, fd) => {
        if (err) {
            console.error("Can't find corporation.json,generate first");
            return;
        }

        fs.readFile(fd, (err, data) => {
            if (err) {
                console.error("Read corporation.json error");
                return;
            }
            fs.close(fd, () => { });

            var corporationsID = JSON.parse(data);
            var items = new Map();

            new SwaggerClient(ESI_URL).then(
                client => {
                    for (var i = 0; i < corporationsID.length; i++)
                    {
                        var element = corporationsID[i];
                        fd = fs.openSync("./public/LPStore/" + element + "/loyalty.json", "r+");
                        data = fs.readFileSync(fd);
                        fs.closeSync(fd);

                        var loyaltys = JSON.parse(data);

                        for (var j = 0; j < loyaltys.length; j++)
                        {
                            var loyalty = loyaltys[j];
                            items.set(loyalty.type_id, { name: "", desc: "" });
                            for (var k = 0; k < loyalty.required_items.length; k++)
                            {
                                var required_item = loyalty.required_items[k];
                                items.set(required_item.type_id, { name: "", desc: "" });
                            }
                        }
                    }

                    var promise = Promise.resolve();
                    var interval = 1000;
                    var index = 0;
                    var all = items.size;

                    items.forEach((value,key) => {

                        promise = promise.then(function () {
                            client.apis.Universe.get_universe_types_type_id({ "Accept-Language": "zh", language : "zh", type_id : key})
                                .then(
                                    ret => {
                                        index++;
                                        console.log(index + '/' + all);
                                        value.name = ret.body.name;
                                        value.description = ret.body.description;
                                    },
                                    reason => {
                                        console.log(element + ' failed on api call: ' + reason.response.data)
                                    }
                                )

                            return new Promise(function (resolve) {
                                setTimeout(resolve, interval);
                            });
                        });
                    });

                    promise.then(function () {
                        console.log('Finished.');

                        fd = fs.openSync("./public/LPStore/loyalty_description.json", "w");
                        fs.writeSync(fd, JSON.stringify(Array.from(items.entries())));
                        fs.closeSync(fd);
                    });

                },
                reason => console.error('failed to load the spec: ' + reason)
            );
        });
    });
}