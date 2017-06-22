

#include "../Headers/USBManager.h"

int main() {

    USBManager *usbManager = new USBManager();
    UDPClient *udpClient = new UDPClient();

    unsigned char * command;
    int result;

    usbManager->initialize();

    usbManager->scanDevices();

    usbManager->connect(0);

    while(usbManager->readData(&command) != -1) {

        //send command via udp client to gate controller
        // read response from udp client
        result = udpClient->getResponseFromGate(command);

        //cast int to const char array
        // redirect response via usb
        usbManager->writeData(std::to_string(result).c_str());
    }

    return 0;
}