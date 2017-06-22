//
// Created by nuno on 19-06-2017.
//

#if __WIN32

#include <windows.h>

#ifndef ZASTUSB_SERIALPORT_H
#define ZASTUSB_SERIALPORT_H

class SerialPort {
private:
    HANDLE serialPortHandle;

public:
    SerialPort();
    ~SerialPort();

    int connect();
    int connect(LPCSTR device);

    void disconnect(void);

    int sendData(unsigned char *buffer, int len);
    int receiveData(unsigned char *buffer, int len);

    void clear();
};

#endif //ZASTUSB_SERIALPORT_H
#endif //__WIN32
