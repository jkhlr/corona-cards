import SocketIO from "socket.io-client"

export default SocketIO(
    '/',
    {
        path: "/ws/socket.io",
        autoConnect: true
    }
)
