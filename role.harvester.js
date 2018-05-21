/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.harvester');
 * mod.thing == 'a thing'; // true
 */

var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {
        
        if (creep.memory.resource == undefined) resource = 0;
        else resource = creep.memory.resource;
        
        if(true){
	    //if(creep.carry.energy < creep.carryCapacity) {
	        var dropped_energy = creep.pos.findInRange(FIND_DROPPED_RESOURCES, 3);
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.pickup(dropped_energy[0]) == ERR_NOT_IN_RANGE){
                creep.moveTo(dropped_energy[0], {visualizePathStyle: {stroke: '#ffaa00'}});
            }else
                if(creep.harvest(sources[resource]) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources[resource], {visualizePathStyle: {stroke: '#ffaa00'}});
                }
        }
        else {
            var container = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER)
                    }
            });

            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == (STRUCTURE_EXTENSION || STRUCTURE_SPAWN || STRUCTURE_TOWER) 
                        && structure.energy < structure.energyCapacity;
                    }
            });
            if(targets.length > 0) {
                if(creep.transfer(container[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else{ 

                creep.moveTo(Game.flags.Flag1, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleHarvester;