cmake_minimum_required(VERSION 3.7)
project(ZastUSB)

set(CMAKE_CXX_STANDARD 14)



if(WIN32)
    set(SOURCE_FILES Source/main.cpp Source/Windows/SerialPort.cpp Headers/Windows/SerialPort.h Headers/USBManager.h Source/USBManager.cpp Headers/UDPServer.h Source/UDPServer.cpp Headers/ZaBeaconCommand.hpp)
    add_definitions(-D__WIN32)

    set(Boost_DEBUG ON)
    #set(Boost_USE_STATIC_LIBS   ON)
    MESSAGE(STATUS "DIR ->: ${Boost_INCLUDE_DIRS}")
    FIND_PACKAGE(Boost COMPONENTS system REQUIRED)

    INCLUDE_DIRECTORIES(${Boost_INCLUDE_DIRS})
    INCLUDE_DIRECTORIES(Includes)

    add_executable(ZastUSB ${SOURCE_FILES})

    target_include_directories(ZastUSB PUBLIC Includes/libusb-1.0)

    target_link_libraries(ZastUSB LINK_PUBLIC ${Boost_INCLUDE_DIRS} boost_system wsock32 ws2_32 usb-1.0)
endif (WIN32)

if(UNIX)
    set(SOURCE_FILES Source/main.cpp Source/Unix/SerialPort.cpp Headers/Unix/SerialPort.h Headers/USBManager.h Source/USBManager.cpp Headers/UDPServer.h Source/UDPServer.cpp Headers/ZaBeaconCommand.hpp)
    add_definitions(-D__UNIX)

    FIND_PACKAGE(Boost 1.6.4 REQUIRED COMPONENTS system)

    INCLUDE_DIRECTORIES(${Boost_INCLUDE_DIR})
    INCLUDE_DIRECTORIES(Includes)

    add_executable(ZastUSB ${SOURCE_FILES})

    target_include_directories(ZastUSB PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/Includes/libusb-1.0)

    target_link_libraries(ZastUSB LINK_PUBLIC ${Boost_LIBRARIES} usb-1.0)
endif (UNIX)






