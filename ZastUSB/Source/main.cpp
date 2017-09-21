#include "../Headers/UDPServer.h"

int main() {

    boost::asio::io_service io_service;

    UDPServer udpServer(io_service, 9000);

    io_service.run();

    return 0;
}