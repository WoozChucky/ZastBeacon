cmake_minimum_required(VERSION 3.7)
project(ZastGate)

set(CMAKE_CXX_STANDARD 14)



if(WIN32)
    set(SOURCE_FILES Source/main.cpp Headers/USBManager.h Source/USBManager.cpp Headers/UDPClient.h Source/UDPClient.cpp)
    add_definitions(-D__WIN32)
    INCLUDE_DIRECTORIES(Includes/Windows)

    add_executable(ZastUSB ${SOURCE_FILES})
endif (WIN32)

if(UNIX)
    set(SOURCE_FILES Source/main.cpp Headers/USBManager.h Source/USBManager.cpp Headers/UDPClient.h Source/UDPClient.cpp)
    add_definitions(-D__UNIX)

    FIND_PACKAGE(Boost 1.6.4 REQUIRED COMPONENTS system)

    INCLUDE_DIRECTORIES(${Boost_INCLUDE_DIR})
    INCLUDE_DIRECTORIES(Includes/Unix)

    add_executable(ZastUSB ${SOURCE_FILES})

    target_include_directories(ZastUSB PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/Includes/Unix/libusb-1.0)

    target_link_libraries(ZastUSB LINK_PUBLIC ${Boost_LIBRARIES} usb-1.0 -lpthread)
endif (UNIX)