//
// Created by nuno on 19-06-2017.
//

#if __UNIX

#ifndef ZASTUSB_SERIALPORT_H
#define ZASTUSB_SERIALPORT_H

class SerialPort {
private:
    int fileDescriptor;

public:
    SerialPort();
    ~SerialPort();

    int connect();
    int connect(char *device);

    void disconnect(void);

    int sendData(unsigned char *buffer, int len);
    int receiveData(unsigned char *buffer, int len);

    int bytesToRead();
    void clear();
};


#endif //ZASTUSB_SERIALPORT_H
#endif //__UNIX
