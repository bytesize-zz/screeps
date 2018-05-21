/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.explorer');
 * mod.thing == 'a thing'; // true
 
 home_room
 work_room
 target_room

 status = [work/travel/refuel]
travel
work
refuel
 */

var roleExplorer = {
    run: function(creep) {
        if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        else
        if (inTargetRoom(creep)){
            if(atPostition(creep, Game.flags[creep.memory.target_room]))
            {
                looting(creep);
            }
        }
    }
};

function atPostition(creep, target){
    if(!(creep.pos.isNearTo(target))){
        creep.moveTo(target, {visualizePathStyle: {stroke: '#0811ff'}});
        return false
    }else return true
}

function inTargetRoom(creep){
    if(creep.room.name !== creep.memory.target_room) {
        creep.moveTo(Game.flags[creep.memory.target_room], {visualizePathStyle: {stroke: '#0811ff'}});
        return false
    }else return true
}

function looting(creep){
    if(creep.carry.energy === creep.carryCapacity){
        return false
    }else{
        var dropped_loot = creep.pos.find(FIND_DROPPED_RESOURCES)
        if (dropped_loot.length > 0){
            var range = dropped_loot.getRangeTo(dropped_loot[0])
            var value = sumResource(dropped_loot)
            creep.say(value)
        }
    }
}

function sumResource(dropped_loot){
    var value = 0;
    for(i=0;i<dropped_loot.length;i++){
        value += dropped_loot[i].amount
    }
    return value
}


function xyxljswhd(creep){
    creep.memory.found = false
    var break_point = 250
    if(creep.carry.energy < creep.carryCapacity-break_point){
        var dropped_resources = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4)

        if(dropped_resources.length > 0){
            if(dropped_resources[0] && dropped_resources[0].energy >= break_point) {
                //console.log("Dropped Energy: " + dropped_resources[0].energy)
                creep.say("energy " + dropped_resources[0].energy)
                creep.memory.found = true
                if(creep.pickup(dropped_resources[0]) === ERR_NOT_IN_RANGE){
                    creep.moveTo(dropped_resources[0], {visualizePathStyle: {stroke: '#ff0000'}});
                }
            }
        } // Nothing found
    } // creep cargo full
    return creep.memory.found
}

module.exports = roleExplorer;