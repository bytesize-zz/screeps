/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('prototype.spawn');
 * mod.thing == 'a thing'; // true
 */

module.exports = function(){
    StructureSpawn.prototype.createBuilderCreep =
        function(energy, home_room, work_room) {
            var modules = calculateBuilderModules(energy)
            var newName =  modules.length + '-size Builder' + Game.time;
            console.log('Spawning new builder: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'builder', home_room: home_room, work_room: work_room}});
        };

    function calculateBuilderModules(energy){
        var remaining_capacity = energy
        var modules = [];

        var movePrice = 50;
        var workPrice = 100;
        var carryPrice = 50;

        while (remaining_capacity >= movePrice){
            modules.push(MOVE)
            remaining_capacity -= movePrice
            if (remaining_capacity >= carryPrice){
                modules.push(CARRY)
                remaining_capacity -= carryPrice
                if (remaining_capacity >= workPrice){
                    modules.push(WORK)
                    remaining_capacity -= workPrice
                }
            }
        }
        return modules
    }
};

module.exports = function(){
    StructureSpawn.createMinerCreep =
        function(energy, home_room, work_room, resource_id) {
            var modules = calculateMinerModules(energy)
            var newName = modules.length + '-size Miner' + Game.time;
            console.log('Spawning new miner: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'miner', resource: resource_id, home_room: home_room, work_room: work_room}});

        };

    function calculateMinerModules(energy){
        var remaining_capacity = energy
        var modules = []

        var movePrice = 50
        var workPrice = 100
        var carryPrice = 50

        //Miner with 5 WORK drains source completely
        //3 MOVE can fully speed 6 WORK on a street
        modules.push(MOVE)
        remaining_capacity -= movePrice
        modules.push(CARRY)
        remaining_capacity -= carryPrice

        for(j = 0; j <= 4; j++) {
            if (remaining_capacity >= workPrice){
                modules.push(WORK)
                remaining_capacity -= workPrice
            } else break
        }
        for(j = 0; j < 2; j++) {
            if (remaining_capacity >= movePrice){
                modules.push(MOVE)
                remaining_capacity -= movePrice
            } else break
        }
        return modules    }
}

module.exports = function(){
    StructureSpawn.prototype.createTransporterCreep =
        function(energy, home_room, work_room) {
            var modules = calculateTransporterModules(energy)
            var newName = modules.length + '-size Transporter' + Game.time;
            console.log('Spawning new transporter: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'transporter', home_room: home_room, work_room: work_room}});
        };

    function calculateTransporterModules(energy){
        var remaining_capacity = energy
        var modules = []
    
        var movePrice = 50
        var carryPrice = 50
    
        while(remaining_capacity >= movePrice){
            modules.push(MOVE); remaining_capacity -= movePrice;
    
            if(remaining_capacity >= carryPrice){modules.push(CARRY); remaining_capacity -= carryPrice}else break;
            if(remaining_capacity >= carryPrice){modules.push(CARRY); remaining_capacity -= carryPrice}
        }
        return modules
    }
}

module.exports = function(){
    StructureSpawn.prototype.createUpgraderCreep =
        function(energy, home_room, work_room) {
            var modules = calculateUpgraderModules(energy)
            var newName = modules.length + '-size Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'upgrader', home_room: home_room, work_room: work_room}});
        };


    function calculateUpgraderModules(energy){
        var remaining_capacity = energy

        var modules = []

        var movePrice = 50
        var workPrice = 100
        var carryPrice = 50

        modules.push(MOVE)
        remaining_capacity -= movePrice
        modules.push(CARRY)
        remaining_capacity -= carryPrice
        modules.push(WORK)
        remaining_capacity -= workPrice

        while(remaining_capacity >= movePrice){
            modules.push(MOVE); remaining_capacity -= movePrice;
            for(i=0;i<3;i++){
                if(remaining_capacity >= workPrice){modules.push(WORK); remaining_capacity -= workPrice;}else break
            }
        }
        return modules
    }
        
}

module.exports = function() {
    StructureSpawn.prototype.createTransporterCreep =
        function (energy, home_room, work_room) {
            var modules = [TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]
            var newName = modules.length + '-size Fighter' + Game.time;
            console.log('Spawning new fighter: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'fighter', home_room: home_room, work_room: work_room}});
        }
}

module.exports = function() {
    StructureSpawn.prototype.createTransporterCreep =
        function (energy, home_room, work_room) {
            var modules = [MOVE, MOVE]
            var newName = modules.length + '-size Explorer' + Game.time;
            console.log('Spawning new explorer: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'explorer', home_room: home_room, work_room: work_room}});
        }
}

module.exports = function() {
    StructureSpawn.prototype.createClaimerCreep =
        function (energy, home_room, work_room) {
            var modules = [MOVE, MOVE, CARRY, CARRY, CLAIM, CLAIM]
            var newName = modules.length + '-size Claimer' + Game.time;
            console.log('Spawning new claimer: ' + newName);
            return this.spawnCreep(modules, newName,
                {memory: {role: 'upgrader', home_room: home_room, work_room: work_room}});
        }
}





function getRooms(){
    return ['E41S26', 'E42S26']
}

function getSourceCount(roomName){

    if (roomName === 'E41S26') return 2
    if (roomName === 'E41S27') return 1
    if (roomName === 'E42S26') return 2
    if (roomName === 'E42S27') return 1
}