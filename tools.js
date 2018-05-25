/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('tools');
 * mod.thing == 'a thing'; // true
 */

module.exports.checkForDroppedEnergy2 = function(creep){
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
};

module.exports.atPostition = function(creep, target){
    if(!(creep.pos.isNearTo(target))){
        creep.moveTo(target, {visualizePathStyle: {stroke: '#3bff09'}});
        return false
    }else return true
};

module.exports.inTargetRoom = function(creep){
    if(creep.room.name !== creep.memory.target_room) {
        creep.moveTo(Game.flags[creep.memory.target_room], {visualizePathStyle: {stroke: '#0811ff'}});
        return false
    }else return true
};

module.exports.noEnemys = function(creep){
    enemys = creep.room.find(FIND_HOSTILE_CREEPS);

    return(enemys.length > 0)
};

module.exports.identifyControllerContainer = function(room_name){
    room = Game.rooms[room_name]
    if(room) {
        controller = room.controller
        if (controller) {
            //console.log(controller)
            controllerContainer = controller.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_CONTAINER
                }
            })
            //console.log(controllerContainer[0].id)
            room.memory.controllerContainer = controllerContainer[0].id
        }
    }
}

module.exports.test = function(){
    console.log("Test")
}