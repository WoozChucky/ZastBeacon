//
// Created by root on 21-06-2017.
//

#include <iostream>
#include <cstring>
#include <boost/asio.hpp>

#include "../Headers/UDPClient.h"

using boost::asio::ip::udp;

UDPClient::UDPClient() {

}

UDPClient::~UDPClient() {

}

int UDPClient::getResponseFromGate(unsigned char * command) {

    boost::asio::io_service io_service;

    udp::socket s(io_service, udp::endpoint(udp::v4(), 0));

    udp::resolver resolver(io_service);
    udp::endpoint endpoint = *resolver.resolve({udp::v4(), GATE_CONTROLLER_IP, GATE_CONTROLLER_PORT});

    s.send_to(boost::asio::buffer(command, sizeof(command)), endpoint);

    char reply[MAX_LENGTH];
    udp::endpoint sender_endpoint;

    size_t reply_length = s.receive_from(
            boost::asio::buffer(reply, MAX_LENGTH), sender_endpoint);
    std::cout << "Reply is: ";
    std::cout.write(reply, reply_length);

    s.close();

    return atoi(reply);
}