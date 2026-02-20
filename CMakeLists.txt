cmake_minimum_required(VERSION 3.16)
project(CalcIOS LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

enable_testing()

add_library(calcios_engine cpp/CalculatorEngine.cpp)
target_include_directories(calcios_engine PUBLIC cpp)

add_executable(calcios_cli cpp/main.cpp)
target_link_libraries(calcios_cli PRIVATE calcios_engine)

add_executable(calcios_tests cpp/tests.cpp)
target_link_libraries(calcios_tests PRIVATE calcios_engine)
add_test(NAME calcios_tests COMMAND calcios_tests)
