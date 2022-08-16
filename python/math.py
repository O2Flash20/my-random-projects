from math import floor

# multoplication and division for floats
# add and subtract for negative numbers
# make a floor function


def add(input1, input2):
    return input1 - - input2


def multiply(input1, input2):
    output = 0
    for i in range(input2):
        output = add(output, input1)
    return output


def divide(input1, input2):
    output = input1
    numLoops = 0
    while output > 0:
        output -= input2
        numLoops = add(numLoops, 1)
    return numLoops


def modulo(input1, input2):
    return floor(multiply((input1/input2 - floor(input1/input2)), input2))


def powerOf(input1, input2):
    output = input1
    for i in range(input2-1):
        output = multiply(output, input1)
    return output


def root(input1, input2):
    for i in range(input1):
        if(powerOf(i, input2) == input1):
            return i

# doesn't work because no negatives


def absolute(input):
    return root(powerOf(input, 2), 2)


# print(add(3, 4))
# print(multiply(25, 5))
# print(divide(5, 0.5))
# print(modulo(23, 5))
# print(powerOf(-5, 2))
# print(root(625, 4))
# print(absolute(-1))
