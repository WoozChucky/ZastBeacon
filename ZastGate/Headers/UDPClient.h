//
// Created by root on 21-06-2017.
//

#ifndef ZASTGATE_UDPCLIENT_H
#define ZASTGATE_UDPCLIENT_H

#define MAX_LENGTH 1024
#define GATE_CONTROLLER_IP "127.0.0.1"
#define GATE_CONTROLLER_PORT "9005"

class UDPClient {
public:
    UDPClient();
    ~UDPClient();

    int getResponseFromGate(unsigned char * command);
};

#endif //ZASTGATE_UDPCLIENT_H
