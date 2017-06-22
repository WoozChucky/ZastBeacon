//
// Created by root on 21-06-2017.
//

#include "../Headers/UDPServer.h"

#pragma clang diagnostic push
#pragma ide diagnostic ignored "InfiniteRecursion"
UDPServer::UDPServer(boost::asio::io_service& io_service, unsigned short port) : _socket(io_service, udp::endpoint(udp::v4(), port)) {
    std::cout << "UDP Server listening on port " << port << std::endl;

    _usbManager = new USBManager();

    _usbManager->initialize();

    _usbManager->scanDevices();

    _usbManager->connect(1); // connects to device with index 0, assuming it exists for now

    listen();
}

UDPServer::~UDPServer() {
    if(_socket.is_open()){
        _socket.close();
    }

    _usbManager->closeDevice();
    _usbManager->shutdown();

    delete [] _usbManager;
    std::cout << "UDPServer destroyed" << endl;
}

void UDPServer::listen() {
    _socket.async_receive_from(
            boost::asio::buffer(&_command, sizeof(struct ZaBeaconCommand)),
           _senderEndpoint,
            [this](boost::system::error_code errorCode, std::size_t bytesReceived) {

                std::cout << "Got data from " << _senderEndpoint.address().to_string() << ":" << _senderEndpoint.port() << std::endl;

                if(!errorCode && bytesReceived > 0) {

                    std::cout << "Received " << bytesReceived << " bytes." << std::endl;
                    //std::cout << "Data -> " << _buffer << std::endl;

                    switch (_command.operationType) {
                        default:
                            send("Unknown command");
                            break;
                        case OPERATION_TYPE_OPEN: {
                            //send request to usb manager and wait for response

                            _usbManager->writeData(_command);

                            int result = _usbManager->readData();

                            sprintf(_buffer, "%d",
                                    result); // cast result from gate response to buffer to be sent to NodeJS again

                            send(_buffer);

                            break;
                        }

                        case OPERATION_TYPE_VALIDATE: {
                            send("Validation was successful");
                            break;
                        }
                        case OPERATION_TYPE_CONFIGURE: {
                            //send request via udp client to Node.JS udp server with Bluetooth configurations
                            send("Configuration was successful");
                            break;
                        }
                    }
                } else {

                    std::cerr << errorCode.message() << std::endl;

                    listen(); //should throw error maybe ?
                }
            }
    );
}

void UDPServer::send(std::size_t length) {
    _socket.async_send_to(
            boost::asio::buffer(_buffer, length),
            _senderEndpoint,
            [this](boost::system::error_code /*errorCode*/, std::size_t /*bytesSent*/) //params are ignored on purpose for now
            {
                listen();
            }
    );
}

void UDPServer::send(std::string message) {
    _socket.async_send_to(
            boost::asio::buffer(message, sizeof(message)),
            _senderEndpoint,
            [this](boost::system::error_code /*errorCode*/, std::size_t /*bytesSent*/) //params are ignored on purpose for now
            {
                listen();
            }
    );
}


#pragma clang diagnostic pop