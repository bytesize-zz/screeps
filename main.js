var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleTransporter = require('role.transporter');
var roleMiner = require('role.miner');
var roleExplorer = require('role.explorer');
var roleFighter = require('role.fighter');
var roleHealer = require('role.healer');

require('prototype.spawn')();
var tools = require('tools')
var wall_heal_multiplier = 100
var rampart_heal_multiplier = 100
var structure_heal_multiplier = 100


module.exports.loop = function () {

    if (defendRoom('E41S26')) {
        healCreeps('E41S26');
        if (repairStructures('E41S26') && repairDefence('E41S26')) Game.spawns['Home'].memory.hp += 1
        }
    if (defendRoom('E42S26')) {
        healCreeps('E42S26');
        if (repairStructures('E42S26') && repairDefence('E42S26')) Game.spawns['Spawn2'].memory.hp += 1
    }

    if (Game.spawns['Home'].memory.hp > 1500) Game.spawns['Home'].memory.hp = 1;
    if (Game.spawns['Spawn2'].memory.hp > 1500) Game.spawns['Spawn2'].memory.hp = 1;
    //console.log("Repair modifier i: " + Game.spawns['Home'].memory.hp * 100)

    spawn_controll();
    //tools.test()
    maximum_capacity = Game.rooms['E41S26'].energyCapacityAvailable
    //console.log(maximum_capacity)

    var storage = Game.rooms.E41S26.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return ((structure.structureType === STRUCTURE_STORAGE))
        }
    });

    if (!Game.spawns['Home'].memory.maxStorage) Game.spawns['Home'].memory.maxStorage = 1
    else {
        if (storage[0] && storage[0].store[RESOURCE_ENERGY] > Game.spawns['Home'].memory.maxStorage)
            Game.spawns['Home'].memory.maxStorage = storage[0].store[RESOURCE_ENERGY]

        console.log("Storage: " + storage[0].store[RESOURCE_ENERGY] + "/" + Game.spawns['Home'].memory.maxStorage)
    }


    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role === 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role === 'transporter') {
            roleTransporter.run(creep);
        }
        if (creep.memory.role === 'miner') {
            roleMiner.run(creep);
        }
        if (creep.memory.role === 'explorer') {
            roleExplorer.run(creep);
        }
        if (creep.memory.role === 'fighter') {
            roleFighter.run(creep);
        }
        if (creep.memory.role === 'healer') {
            roleHealer.run(creep);
        }
    }
}



    function spawn_controll() {
        var myRooms = ['E41S26', 'E42S26']
        var mySpawns = ['Home', 'Spawn2']

        var energy_status = Game.rooms[myRooms[0]].energyAvailable;

        console.log(energy_status)

        //Game.rooms[myRooms[1]].memory.slave_rooms = ['E42S27']

        buildTransporter(mySpawns[0])
        buildTransporter(mySpawns[1])
        buildMiner(mySpawns[0])
        buildMiner(mySpawns[1])
        buildBuilder(mySpawns[0])
        buildBuilder(mySpawns[1])
        buildUpgrader(mySpawns[0])
        buildUpgrader(mySpawns[1])


        var minimumMiner = 2;
        var maximumMiner = 3;
        var minimumTransporter = 3;
        var maximumTransporter = 4;
        var maximumUpgrader = 2;
        var maximumBuilder = 2;
        var maxExplorer = 0;

        var miners = _.filter(Game.creeps, (creep) => creep.memory.role === 'miner');
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
        var transporters = _.filter(Game.creeps, (creep) => creep.memory.role === 'transporter');
        var explorers = _.filter(Game.creeps, (creep) => creep.memory.role === 'explorer');
        var fighters = _.filter(Game.creeps, (creep) => creep.memory.role === 'fighter');
        var healer= _.filter(Game.creeps, (creep) => creep.memory.role === 'healer');

        console.log("Miner: " + miners.length + "/" + maximumMiner + " | Transporter: " + transporters.length + "/" + maximumTransporter
            + " | Builder: " + builders.length + "/" + maximumBuilder + " | Upgrader: " + upgraders.length + "/" + maximumUpgrader
            + " | Explorer: " + explorers.length + "/" + maxExplorer
            + " | Fighter: " + fighters.length)

        //if (builders.length < 1) Builder(1500, 'E42S26')
        //if(fighters.length < 4 ) buildFighter(mySpawns[0])
        //if(fighters.length < 4 ) buildFighter(mySpawns[1])

        for(i=0; i< mySpawns.length;i++){
            if (Game.spawns[mySpawns[i]].spawning) {
                var spawningCreep = Game.creeps[Game.spawns[mySpawns[i]].spawning.name];
                Game.spawns[mySpawns[i]].room.visual.text(
                    '🛠️' + spawningCreep.memory.role,
                    Game.spawns[mySpawns[i]].pos.x + 1,
                    Game.spawns[mySpawns[i]].pos.y,
                    {align: 'left', opacity: 0.8});
                clearDeadCreeps()
            }
        }
    }
        function buildFighter(spawn){
            room = Game.spawns[spawn].room
            maximum_capacity = room.energyCapacityAvailable
            energy_status = room.energyAvailable;
            if(maximum_capacity > 1500) energy = maximum_capacity
            else energy = maximum_capacity

            attackRoom = "E41S28"

            if ((!Game.spawns[spawn].spawning) && energy_status >= energy) {
                fighter = _.filter(Game.creeps, (c) => (c.memory.role === "fighter" && c.memory.work_room === attackRoom))
                transporter = _.filter(Game.creeps, (c) => (c.memory.role === "transporter" && c.memory.work_room === room.name))
                miner = _.filter(Game.creeps, (c) => (c.memory.role === "miner" && c.memory.work_room === room.name))

                //console.log(fighter + miner.length+ transporter.length)
                if(fighter.length < 2 && transporter.length >= 2 && miner.length >= 1) Fighter(spawn, energy, attackRoom)

            }
        }

        function buildHealer(spawn) {
            room = Game.spawns[spawn].room
            maximum_capacity = room.energyCapacityAvailable
            energy_status = room.energyAvailable;

            attackRoom = "E41S28"

            if (maximum_capacity > 1500) energy = maximum_capacity
            else energy = maximum_capacity

            if ((!Game.spawns[spawn].spawning) && energy_status >= energy) {
                healer = _.filter(Game.creeps, (c) => (c.memory.role === "healer" && c.memory.work_room === attackRoom))
            }

        }

        function maxResourceMiner(resource_id) {
            if (_.sum(Game.creeps, (c) => c.memory.resource === resource_id) < 2)
                return false
            else return true
        }

        function buildMiner(spawn) {
            //maximum_capacity = Game.rooms[home].energyCapacityAvailable
            //energy_status = Game.rooms[home].energyAvailable;
            maximum_capacity = Game.spawns[spawn].room.energyCapacityAvailable
            energy_status = Game.spawns[spawn].room.energyAvailable;
            if(maximum_capacity > 1500) energy = 1500
            else energy = maximum_capacity
            room = Game.spawns[spawn].room
            //console.log(room)
            miners = _.filter(Game.creeps, (c) => (c.memory.role === "miner" && c.memory.work_room === room.name))

            if ((!Game.spawns[spawn].spawning) && energy_status >= energy) {
                sources = getSourceCount(room.name)
                for (j = 0; j < sources; j++) {
                    miner = _.filter(Game.creeps, (c) => (c.memory.role === "miner" && c.memory.work_room === room.name && c.memory.resource === j))
                    if (miner.length < 1 || (miner.length === 1 && miner[0].ticksToLive < 50)) {
                        Miner(spawn, energy, j, room.name)
                        break;
                    }
                }
                if(miners.length >= sources){
                   slaves = room.memory.slave_rooms
                    console.log(slaves)
                }
            }
        }

        function buildTransporter(spawn) {
            //maximum_capacity = Game.rooms[home].energyCapacityAvailable
            //energy_status = Game.rooms[home].energyAvailable;
            maximum_capacity = Game.spawns[spawn].room.energyCapacityAvailable
            energy_status = Game.spawns[spawn].room.energyAvailable;
            if(maximum_capacity > 1500) energy = 1500
            else energy = maximum_capacity
            room = Game.spawns[spawn].room

            if ((!Game.spawns[spawn].spawning) && energy_status >= energy) {
                transporterMax = 2  // function to calculate the needed transporter ?

                    transporter = _.filter(Game.creeps, (c) => (c.memory.role === "transporter" && c.memory.work_room === room.name))
                    if (transporter.length < transporterMax || (transporter.length === (transporterMax) && transporter[0].ticksToLive < 50)) {
                        Transporter(spawn, energy, room.name)
                }
            }
        }

        function buildBuilder(spawn) {
            //maximum_capacity = Game.rooms[home].energyCapacityAvailable
            //energy_status = Game.rooms[home].energyAvailable;
            maximum_capacity = Game.spawns[spawn].room.energyCapacityAvailable
            energy_status = Game.spawns[spawn].room.energyAvailable;
            if(maximum_capacity > 1500) energy = 1500
            else energy = maximum_capacity
            room = Game.spawns[spawn].room

            sites = room.find(FIND_CONSTRUCTION_SITES)

            if(sites.length > 0)
            if ((!Game.spawns[spawn].spawning) && energy_status >= energy) {
                builder = _.filter(Game.creeps, (c) => (c.memory.role === "builder" && c.memory.work_room === room.name))
                if (builder.length < 1 || (builder.length === 1 && builder[0].ticksToLive < 50)) {
                    Builder(spawn, energy, room.name)
                }
            }
        }

        function buildUpgrader(spawn) {
            //maximum_capacity = Game.rooms[home].energyCapacityAvailable
            //energy_status = Game.rooms[home].energyAvailable;
            maximum_capacity = Game.spawns[spawn].room.energyCapacityAvailable
            energy_status = Game.spawns[spawn].room.energyAvailable;
            energy = maximum_capacity
            room = Game.spawns[spawn].room

            if ((!Game.spawns[spawn].spawning) && energy_status >= energy) {
                upgrader = _.filter(Game.creeps, (c) => (c.memory.role === "upgrader" && c.memory.work_room === room.name))

                if (upgrader.length < 1 || (upgrader.length === 1 && upgrader[0].ticksToLive < 50)) {
                    if (!(room) || (!(room.controller.my))) {
                        Claimer(spawn, energy, room.name)
                    } else {
                        Upgrader(spawn, energy, room.name)
                        }

                }
            }
        }

        function getRooms() {
            const rooms = ['E41S26', 'E42S26']
            return rooms
        }

        function getSourceCount(roomName) {

            if (roomName === 'E41S26') return 2
            if (roomName === 'E41S27') return 1
            if (roomName === 'E42S26') return 2
            if (roomName === 'E42S27') return 1
        }

        function Healer(spawn, energy, work_room){
            var modules = calculateHealerModules(energy)
            var newName = modules.length + '-size Healer' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new healer: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'healer', home_room: home_room, work_room: work_room}});


        }

        function Miner(spawn, energy, resource_id, work_room) {
            var modules = calculateMinerModules(energy)
            var newName = modules.length + '-size Miner' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new miner: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'miner', resource: resource_id, home_room: home_room, work_room: work_room}});
        }

        function Transporter(spawn,energy, work_room) {
            var modules = calculateTransporterModules(energy)
            var newName = modules.length + '-size Transporter' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new transporter: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'transporter', home_room: home_room, work_room: work_room}});
        }

        function Builder(spawn, energy, work_room) {
            var modules = calculateBuilderModules(energy)
            var newName = modules.length + '-size Builder' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new builder: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'builder', home_room: home_room, work_room: work_room}});
        }

        function Upgrader(spawn, energy, work_room) {
            var modules = calculateUpgraderModules(energy)
            var newName = modules.length + '-size Upgrader' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new upgrader: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'upgrader', home_room: home_room, work_room: work_room}});
        }

        function Claimer(spawn, energy, work_room) {
            var modules = [MOVE, MOVE, CARRY, CARRY, CLAIM, CLAIM]
            var newName = modules.length + '-size Claimer' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new claimer: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'upgrader', home_room: home_room, work_room: work_room}});
        }

        function Explorer(spawn, energy, home_room, work_room) {
            var modules = [MOVE, MOVE]
            var newName = modules.length + '-size Explorer' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new explorer: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'explorer', home_room: home_room, work_room: work_room}});
        }

        function Fighter(spawn, home_room, work_room) {
            var modules = calculateFighterModules(energy)
            var newName = modules.length + '-size Fighter' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new fighter: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'fighter', home_room: home_room, work_room: work_room}});
        }

        function CannonFodder(spawn, home_room, work_room){
            var modules = calculateFodderModules(energy)
            var newName = modules.length + '-size CannonFodder' + Game.time;
            home_room = Game.spawns[spawn].room.name
            console.log('Spawning new CannonFodder: ' + newName);
            Game.spawns[spawn].spawnCreep(modules, newName,
                {memory: {role: 'fighter', home_room: home_room, work_room: work_room}});

        }

        function calculateFodderModules(energy){
            remaining_capacity = energy
            modules = []
            moves = []
            toughs = []

            movePrice = 50
            toughPrice = 10

            while(remaining_capacity >= toughPrice){
                if(remaining_capacity >= movePrice){ moves.push(MOVE); remaining_capacity -= movePrice;}
                if(remaining_capacity >= toughPrice){ toughs.push(TOUGH); remaining_capacity -= toughPrice;}
            }
            modules = modules.concat(toughs)
            modules = modules.concat(moves)

            return modules
        }

        function calculateHealerModules(energy) {
            remaining_capacity = energy
            modules = []
            moves = []
            toughs = []

            movePrice = 50
            toughPrice = 10
            healPrice = 250

        }

        function calculateFighterModules(energy){
            remaining_capacity = energy
            modules = []

            moves= []
            toughs = []
            attacks = []

            movePrice = 50
            toughPrice = 10
            attackPrice = 80

            while(remaining_capacity >=10){
                if(remaining_capacity >= movePrice){ moves.push(MOVE); remaining_capacity -= movePrice;}
                if(remaining_capacity >= movePrice){ moves.push(MOVE); remaining_capacity -= movePrice;}
                if(remaining_capacity >= toughPrice){ toughs.push(TOUGH); remaining_capacity -= toughPrice;}
                if(remaining_capacity >= attackPrice){ attacks.push(ATTACK); remaining_capacity -= attackPrice;}
            }

            modules = modules.concat(toughs)
            modules = modules.concat(moves)
            modules = modules.concat(attacks)

            return modules
        }

        //function calculateHealerModules(energy){
//
//
//
// }

        function calculateTransporterModules(energy) {
            var remaining_capacity = energy
            var modules = []

            var movePrice = 50
            var carryPrice = 50

            while (remaining_capacity >= movePrice) {
                modules.push(MOVE);
                remaining_capacity -= movePrice;

                if (remaining_capacity >= carryPrice) {
                    modules.push(CARRY);
                    remaining_capacity -= carryPrice
                } else break;
                if (remaining_capacity >= carryPrice) {
                    modules.push(CARRY);
                    remaining_capacity -= carryPrice
                }
            }
            return modules
        }

        function calculateBuilderModules(energy) {
            var remaining_capacity = energy
            var modules = []

            var movePrice = 50
            var workPrice = 100
            var carryPrice = 50

            while (remaining_capacity >= movePrice) {
                modules.push(MOVE)
                remaining_capacity -= movePrice
                if (remaining_capacity >= carryPrice) {
                    modules.push(CARRY)
                    remaining_capacity -= carryPrice
                    if (remaining_capacity >= workPrice) {
                        modules.push(WORK)
                        remaining_capacity -= workPrice
                    }
                }
            }
            return modules
        }

        function calculateMinerModules(energy) {
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

            for (j = 0; j <= 5; j++) {
                if (remaining_capacity >= workPrice) {
                    modules.push(WORK)
                    remaining_capacity -= workPrice
                } else break
            }
            for (j = 0; j < 2; j++) {
                if (remaining_capacity >= movePrice) {
                    modules.push(MOVE)
                    remaining_capacity -= movePrice
                } else break
            }
            return modules
        }

        function calculateUpgraderModules(energy) {
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

            while (remaining_capacity >= movePrice) {
                modules.push(MOVE);
                remaining_capacity -= movePrice;
                for (i = 0; i < 3; i++) {
                    if (remaining_capacity >= workPrice) {
                        modules.push(WORK);
                        remaining_capacity -= workPrice;
                    } else break
                }
            }
            return modules
        }

        function defendRoom(roomName) {
            var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                var username = hostiles[0].owner.username;
                Game.notify(`User ${username} spotted in room ${roomName}`);
                var towers = Game.rooms[roomName].find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.attack(hostiles[0]));
                return false
            } else return true
        }

        function repairStructures(roomName) {
            var i = Game.spawns['Home'].memory.hp
            var healpower = 1000

            var damagedStructures = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType !== STRUCTURE_WALL &&
                        structure.structureType !== STRUCTURE_RAMPART &&
                        structure.hits < i * structure_heal_multiplier &&
                        structure.hitsMax - structure.hits > healpower

                }
            });
            if (damagedStructures.length > 0) {
                //console.log(damagedStructures)
                console.log("Tower repair target has: " + damagedStructures[0].hits)
                var towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.repair(damagedStructures[0]));
                return false        // check if lenth > 1 and item is fully healed
            } else return true
        }

        function repairDefence(roomName) {
            var i = Game.spawns['Home'].memory.hp
            var healpower = 1000
            /*
            var damagedWall = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return  structure.structureType === STRUCTURE_WALL &&
                            structure.hits < i * wall_heal_multiplier}});

            var damagedRampart = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return  structure.structureType === STRUCTURE_RAMPART &&
                            structure.hits < i * rampart_heal_multiplier}});
            */
            var damagedDefences = Game.rooms[roomName].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_RAMPART ||
                        structure.structureType === STRUCTURE_WALL) &&
                        structure.hits < i * rampart_heal_multiplier
                }});

            if (damagedDefences.length > 0) {
                //console.log(damagedDefences)
                console.log("Tower repair target has: " + damagedDefences[0].hits)
                //console.log("Damaged Defence: " + damagedDefences[0])
                var towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.repair(damagedDefences[0]));
                return false        // check if lenth > 1 and item is fully healed
            } else return true
        }

        function healCreeps(roomName) {
            var damagedCreeps = Game.rooms[roomName].find(FIND_MY_CREEPS, {filter: (creep) => creep.hits < creep.hitsMax});

            if (damagedCreeps.length > 0) {
                var towers = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                towers.forEach(tower => tower.heal(damagedCreeps[0]));
            }
        }


        function clearDeadCreeps() {
            for (let name in Memory.creeps) {
                if (Game.creeps[name] === undefined) {
                    delete Memory.creeps[name]
                }
            }
        }

        function setSlaveRoom(home_room, slave_room){
            Game.rooms[home_room].memory.slave_rooms.push(slave_room)
        }


