import express from 'express'
import http from 'http'
import socketio from 'socket.io'
import {Match} from "./match";

const app = express();
const server = http.createServer(app);
const io = socketio(server, {path: '/ws/socket.io'});

const matches = [new Match('default', 'skat')]

io.on('connection', (socket) => {
    console.log(`Socket ${socket.id} connected`);

    socket.on('startMatch', ({matchId, gameId}) => {
        matches.push(new Match(matchId, gameId))
    })

    socket.on('joinMatch', ({matchId, displayName}) => {
        function broadcastStateUpdate() {
            match.playerMap.getClientIds().forEach(clientId => {
                io.to(clientId).emit(
                    'updateState',
                    {
                        gameState: match.getGameStateFor(clientId),
                        moveHistory: match.moveHistory
                    }
                )
            })
        }

        const match = matches.filter(match => match.id === matchId).pop() || new Match(matchId)
        match.playerMap.addPlayer(socket.id)
        match.playerMap.updateDisplayName(socket.id, displayName)
        broadcastStateUpdate()

        socket.on('getState', (reply) => {
            reply({
                gameState: match.getGameStateFor(socket.id),
                moveHistory: match.moveHistory
            })
        })

        socket.on('requestSeat', (seatNumber) => {
            match.playerMap.updateSeatNumber(socket.id, seatNumber)
            broadcastStateUpdate()
        });

        socket.on('requestMove', (commandRequest) => {
            console.log(`Requested move by socket ${socket.id}:`);
            console.log(commandRequest);
            try {
                match.applyCommandRequest(commandRequest);
                broadcastStateUpdate()
            } catch (err) {
                if (err instanceof ValidationError) {
                    socket.emit('rejectMove', {error: err.message});
                } else {
                    throw err
                }
            }
        })

        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected`);
            socket.leave(matchId)
            match.playerMap.removePlayer(socket.id)
            broadcastStateUpdate()
        });
    })
})

server.listen(8000, () => {
    console.log('listening on *:8000');
});

