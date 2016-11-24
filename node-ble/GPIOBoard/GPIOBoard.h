#include <string>
#include <stdio.h>
#include <thread>
#include <iostream>
#include <sstream>
#include <unistd.h>
#include <stdlib.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/ioctl.h>
#include <sys/socket.h>

class GPIOBoard
{
    public:
        /** Default constructor */
        GPIOBoard(std::string num);
        /** Default destructor */
        virtual ~GPIOBoard();

        int export_gpio();
        int unexport_gpio();

        int setdir_gpio(std::string dir);
        int setval_gpio(std::string val);
        int getval_gpio(std::string& val);
        std::string get_gpionum();

    protected:
    private:
        std::string gpionum;
};
