import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import {Match, ValidationError} from "./match";

const app = express();
const server = http.createServer(app);
const io = socketio(server, {path: '/ws/socket.io'});

const matches = [new Match('default', 'skat')]

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.on('joinMatch', ({matchId, displayName}, reply) => {
        console.log(`Match ${matchId} joined with name ${displayName} by ${socket.id}`)
        let match = matches.filter(match => match.id === matchId).pop()
        if (!match) {
            console.log(`Creating match ${matchId}...`)
            match = new Match(matchId)
            matches.push(match)
        }

        match.playerMap.addPlayer(socket.id)
        match.playerMap.updateDisplayName(socket.id, displayName)

        socket.join(matchId)
        socket.in(matchId).emit('syncState')
        reply({gameState: match.getGameStateFor(socket.id)})

        socket.on('takeSeat', ({seatNumber}, reply) => {
            console.log(`Seat ${seatNumber} taken by socket ${socket.id}`);
            match.playerMap.updateSeatNumber(socket.id, seatNumber)

            socket.in(matchId).emit('syncState')
            reply({gameState: match.getGameStateFor(socket.id)})
        });

        socket.on('applyCommand', ({commandRequest}, reply) => {
            console.log(`Command ${commandRequest.command} requested by socket ${socket.id}`);
            try {
                match.applyCommandRequest(commandRequest);
                socket.in(matchId).emit('syncState')
                reply({gameState: match.getGameStateFor(socket.id)})
            } catch (err) {
                if (err instanceof ValidationError) {
                    reply({error: err.message});
                } else {
                    throw err
                }
            }
        })

        socket.on('syncState', (reply) => {
            console.log(`Game state synced by ${socket.id}`)
            reply({gameState: match.getGameStateFor(socket.id)})
        });

        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected`);
            match.playerMap.removePlayer(socket.id)

            socket.leave(matchId)
            socket.in(matchId).emit('syncState')
        });
    })
})

server.listen(8000, () => {
    console.log('listening on *:8000');
});

