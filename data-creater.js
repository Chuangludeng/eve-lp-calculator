'use strict'
const fs = require('fs')
const yargs = require('yargs');

const argv = yargs
    .option('get-corporations', {
        alias: 'c',
        description: 'get all NPC corporations ',
        type: 'boolean',
    })
    .help()
    .alias('help', 'h')
    .argv;

if(argv.c)
{
    // request ESI to get all NPC corporations

    
}