/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.upgrader');
 * mod.thing == 'a thing'; // true
 */
require('tools');

function refuel_at_container(creep){

    var energy_needed = creep.energyCapacity - creep.energy

        var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {return (structure.structureType === STRUCTURE_CONTAINER && structure.store.energy >= 100 )}});
        //console.log(container)
        if (creep.withdraw(container, RESOURCE_ENERGY, energy_needed) === ERR_NOT_IN_RANGE) {
            creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
        }//else repairContainer(creep, container)
}

function repairContainer(creep) {
    var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType === STRUCTURE_CONTAINER && structure.hits < structure.hitsMax - 1000)}});
    if (creep.repair(container) === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
}

function inTargetRoom(creep){
    if(creep.room.name !== creep.memory.target_room){
        creep.moveTo(Game.flags[creep.memory.target_room], {visualizePathStyle: {stroke: '#0811ff'}})
        return false
    }else return true
}

function inHomeRoom(creep){
    if(creep.room.name !== creep.memory.home_room){
        creep.moveTo(Game.flags.Flag1)
        return false
    }else return true
}

function signController(creep){
   if(creep.signController( creep.room.controller, 'Bytesize\'s bite size is eight times greater than a Bitesize\'s bite size!')  === ERR_NOT_IN_RANGE){
       creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
   }
}

function noEnemys(creep){
    enemys = creep.room.find(FIND_HOSTILE_CREEPS)

    if(enemys.length > 0) {
        inHomeRoom(creep)
        return false
    } else return true
}

function callForHelp(creep){
    enemys = creep.room.find(FIND_HOSTILE_CREEPS)
    home_room = Game.rooms[creep.memory.home_room]

    //console.log(home_room)

    if(enemys.length > 0) {
        home_room.memory.alert = enemys.length
    } else delete home_room.memory.alert
}

function checkForDroppedEnergy(creep){
    creep.memory.found = false
    var break_point = 100
    if(creep.carry.energy < creep.carryCapacity-break_point){
        var dropped_energy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
        if(dropped_energy && dropped_energy.amount >= break_point) {
            //console.log("Dropped Energy: " + dropped_energy[0].energy)
            creep.say(dropped_energy.resourceType)
            creep.memory.found = true
            if(creep.pickup(dropped_energy === ERR_NOT_IN_RANGE)){
                creep.moveTo(dropped_energy, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }else creep.memory.found = false
    } else creep.memory.found = false
    return creep.memory.found
}

var roleUpgrader = {
    /** @param {Creep} creep **/
    run: function (creep) {
        if(!creep.memory.target_room) creep.memory.target_room = creep.memory.work_room;
        else
        if(inTargetRoom(creep)){
            callForHelp(creep)
            if(!checkForDroppedEnergy(creep)){}
            var storage = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType === STRUCTURE_STORAGE))
                }});

            if (!checkForDroppedEnergy(creep)) {
                if (creep.memory.upgrading && creep.carry.energy === 0) {
                    //signController(creep)
                    creep.memory.upgrading = false;
                    creep.say('🔄 refuel');
                }
                if (!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
                    creep.memory.upgrading = true;
                    creep.say('⚡ upgrade');
                }

                if (creep.memory.upgrading) { //Game.spawns['Home'].memory.maxStorage) {
                    //signController(creep)
                    //console.log(creep.claimController(creep.room.controller))
                    repairContainer(creep)
                    if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }else
                        if(/*(creep.claimController(creep.room.controller) === ERR_NOT_IN_RANGE) || */(creep.reserveController(creep.room.controller) === ERR_NOT_IN_RANGE)) {
                            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else refuel_at_container(creep);
            }
        }
    }
};

module.exports = roleUpgrader;








