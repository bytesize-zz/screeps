/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.fighter');
 * mod.thing == 'a thing'; // true
 */

var roleFighter = {
    run: function(creep) {
        if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        else
        if(inTargetRoom(creep)){

            if(!attackTower(creep) && !attackingEnemy(creep)) attackWeakSpot(creep)

            if(creep.hits < creep.hitsMax/5 && creep.ticksToLive > 500) creep.memory.target_room = creep.memory.home_room
            if(creep.hits === creep.hitsMax && creep.memory.target_room === creep.memory.home_room) creep.memory.target_room = creep.memory.work_room

            /*
            var enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS)

            if(enemy){
                if(creep.attack(enemy) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(enemy, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }else {
                var hostileStructure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES)
                if(hostileStructure) {
                    if (creep.attack(hostileStructure) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(hostileStructure, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }else {
                    var hostileSites = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES)
                    console.log(hostileSites)

                    if (hostileSites)creep.moveTo (hostileSites, {visualizePathStyle: {stroke: '#ffffff'}});
                    else if (creep.hits < creep.hitsMax) inHomeRoom(creep)
                }

            }
        */}
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

function attackingEnemy(creep){
    var enemy = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
      //console.log("Enemy Range: " + creep.pos.getRangeTo(enemy))
    if(!enemy || creep.pos.getRangeTo(enemy) > 50 || creep.pos.getRangeTo(enemy) == NaN){
          //console.log("attackingEnemy: false")
        return false
    }else{
        if (atPostition(creep, enemy)) creep.attack(enemy)
        //console.log("attackingEnemy: true")
        return true
    }
}

function attackWeakSpot(creep){
    var weakSpot = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_WALL ||
                structure.structureType === STRUCTURE_RAMPART)
                && structure.hits < 10000 }});

    console.log("WeakSpot: " + weakSpot)
    if(weakSpot){
        if(atPostition(creep, weakSpot)) creep.attack(weakSpot)
        return true
    } else return false
}

function attackTower(creep){
    tower = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_TOWER)
        }});
    //console.log("Tower Range: " + creep.pos.getRangeTo(tower) + tower)

    if(!tower || creep.pos.getRangeTo(tower) > 50 || creep.pos.getRangeTo(tower) == NaN){
        //console.log("attackingTower: false")
        return false
    }else{
        if (atPostition(creep, tower))creep.attack(tower)
        //console.log("attackingTower: true")
        return true
    }
}

module.exports = roleFighter;