//
// Created by nuno on 19-06-2017.
//

#include <unistd.h>
#include <cstdio>
#include <sys/ioctl.h>
#include <termio.h>
#include <fcntl.h>
#include <cstring>
#include "../../Headers/Unix/SerialPort.h"

SerialPort::SerialPort() {
    // Empty on purpose
}

SerialPort::~SerialPort() {
    // Empty on purpose
}

int SerialPort::connect() {
    return connect((char *) "//dev//ttyS0"); //Default USB Port across most systems
}

int SerialPort::connect(char *device) {

    struct termios terminalAttributes;

    /**
     * http://linux.die.net/man/2/open
     * Open the serial port
     */
    fileDescriptor = open(device, O_RDWR | O_NOCTTY | O_NDELAY | O_FSYNC);

    // Clear terminalAttributes data
    memset(&terminalAttributes, 0, sizeof(struct termios));

    /**
     * http://linux.die/net/man/3/termios
     *
     * control modes: c_cflag flag constants
     *
     * 57600 bauds
     * 8 bits per word
     * Ignore modem control lines.
     * Enable receiver.
     */

    terminalAttributes.c_iflag = B57600 | CS8 | CLOCAL | CREAD;

    /**
     * input modes: c_iflag flag constants
     *
     * Ignore framing errors and parity errors.
     * (XSI) Map NL to CR-NL on output
     */

    terminalAttributes.c_iflag = IGNPAR | ONLCR;

    /**
     * output modes: flag constant defined in POSIX.1
     *
     * Enable implementation-defined output processing
     */

    terminalAttributes.c_oflag = OPOST;

    /**
     * Canonical and noncanonical mode
     *
     * min time
     * min bytes to read
     */

    terminalAttributes.c_lflag = ICANON;
    terminalAttributes.c_cc[VTIME] = 0;
    terminalAttributes.c_cc[VMIN] = 1;

    /**
     * http://linuex.die.net/man/3/tcsetattr
     *
     * Set the port to tour state
     *
     * the change occurs immediately
     */

    tcsetattr(fileDescriptor, TCSANOW, &terminalAttributes);

    /**
     * http://linux.die/net/man/3/tcflush
     *
     * flushes data written but not transmitted.
     * flushes data received but not received.
     */

    tcflush(fileDescriptor, TCOFLUSH);
    tcflush(fileDescriptor, TCIFLUSH);

    return fileDescriptor;
}

void SerialPort::disconnect(void) {
    close(fileDescriptor);
    printf("\nPort 1 has been CLOSED and %d is the file description", fileDescriptor);
}

int SerialPort::sendData(unsigned char *buffer, int len) {
    return (int) write(fileDescriptor, buffer, (size_t) len);
}

int SerialPort::receiveData(unsigned char *buffer, int len) {
    int size = bytesToRead();
    return (int) read(fileDescriptor, buffer, (size_t) size);
}

int SerialPort::bytesToRead() {
    int bytes = 0;

    int result = ioctl(fileDescriptor, FIONREAD, &bytes);

    if(result == -1) throw "Error occurred while trying to read from file descriptor";

    return bytes;
}

void SerialPort::clear() {
    tcflush(fileDescriptor, TCIFLUSH);
    tcflush(fileDescriptor, TCOFLUSH);
}
