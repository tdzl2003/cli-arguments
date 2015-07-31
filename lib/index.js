/**
 * Created by Yun on 2015/7/30.
 */
"use strict";

function parseShortcuts(option, shortcuts){
    if (option.shortcut){
        shortcuts[option.shortcut] = option;
    } else if(option.shortcuts) {
        for (let c of option.shortcuts) {
            shortcuts[c] = option;
        }
    }
}

function parse(config){
    let options = {};

    let shortcuts = {};
    for (let name in config.globalOptions){
        config.globalOptions[name].name = name;
        parseShortcuts(config.globalOptions[name], shortcuts);
        if (config.globalOptions[name].default){
            options[name] = config.globalOptions[name].default;
        }
    }

    let argv = process.argv.slice(2);
    let args = [];
    let command, commandName, commandOptions = {};

    if (config.useCommand){
        if (argv.length == 0 || argv[0][0] == '-'){
            commandName = config.defaultCommand;
            if (!commandName){
                throw new Error("No default command. Must provide a command.");
            }
        } else {
            commandName = argv.shift();
        }
        command = config.commands[commandName];
        if (!command && !config.allowUnknownCommand) {
            throw new Error("Unknown command "+commandName);
        } else {
            commandOptions = command.options;
            for (let name in commandOptions) {
                commandOptions[name].name = name;
                parseShortcuts(commandOptions[name], shortcuts);
                if (commandOptions[name].default){

                }
            }
        }
    }

    for (var i = 0; i< argv.length; i++){
        let arg = argv[i];

        if (arg[0] == '-'){
            let option, value;
            if (arg[1] == '-'){
                let name = arg.substr(2);
                option = config.globalOptions[name] || commandOptions[name];
            } else {
                option = globalShortcuts[arg[1]];
                value = arg.substr(2);
            }
            if (!option){
                // Unknown option
                if (!config.allowUnknownOption){
                    throw new Error("Unknown option "+arg);
                }
                options[arg] = true;
                continue;
            }
            if (option.hasValue){
                if (!value && argv[i+1][0] != '-'){
                    value = argv[++i];
                }
                options[option.name] = value;
                if (!options[arg]){
                    throw new Error("Option "+arg+" should provide a value.");
                }
            } else {
                options[arg] = true;
            }
        } else {
            args.push(arg);
        }
    }

    if (config.useCommand) {
        return {
            command: commandName,
            options,
            args
        }
    } else {
        return {
            options,
            args
        }
    }
}

exports.parse = parse;

function displayHelp(config, command){
    throw new Error("Not implemented yet.");
}

exports.displayHelp = displayHelp;
