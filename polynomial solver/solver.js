// Matrix.entries[row][column]
class Matrix {
    constructor(rows, columns) {
        this.rows = rows
        this.columns = columns

        this.entries = []

        for (let j = 0; j < rows; j++) {
            let thisRow = []
            for (let i = 0; i < columns; i++) {
                thisRow.push(i == j ? 1 : 0)
            }
            this.entries.push(thisRow)
        }
    }

    multiplyScalar(scalar) {
        let multiplied = new Matrix(this.rows, this.columns)
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                multiplied.entries[i][j] = this.entries[i][j] * scalar
            }
        }

        return multiplied
    }

    determinant() {
        // if the number of rows and columns is 2, just get the number the quick way
        if (this.rows == 2 && this.columns == 2) {
            return this.entries[0][0] * this.entries[1][1] - this.entries[0][1] * this.entries[1][0]
        }

        let solution = 0

        for (let i = 0; i < this.columns; i++) { //go through the top row
            const entry = this.entries[0][i]
            const sign = (-1) ** (2 + i) //-1(row+column) but with the index starting at 1 instead of 0

            const minorMatrix = new Matrix(this.rows - 1, this.columns - 1)
            // fill in the matrix
            let minorEntries = []
            for (let j = 1; j < this.rows; j++) {
                let thisRow = []
                for (let k = 0; k < this.columns - 1; k++) {
                    thisRow.push(k < i ? this.entries[j][k] : this.entries[j][k + 1])
                }
                minorEntries.push(thisRow)
            }
            minorMatrix.entries = minorEntries
            const minor = minorMatrix.determinant(false)

            solution += entry * sign * minor
        }

        return solution
    }

    cofactor() {
        let cofactor = new Matrix(this.rows, this.columns)

        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {

                let minorMatrix = new Matrix(this.rows - 1, this.columns - 1)
                let minorMatrixEntries = []
                for (let k = 0; k < this.rows - 1; k++) {
                    let thisRow = []
                    for (let l = 0; l < this.columns - 1; l++) {
                        const rowIndex = k < i ? k : k + 1; const columnIndex = l < j ? l : l + 1
                        thisRow.push(
                            this.entries
                            [rowIndex]
                            [columnIndex]
                        )
                    }
                    minorMatrixEntries.push(thisRow)
                }
                minorMatrix.entries = minorMatrixEntries

                cofactor.entries[i][j] = minorMatrix.determinant() * (-1) ** (i + 1 + j + 1)
            }
        }

        return cofactor
    }

    transpose() {
        let transpose = new Matrix(this.rows, this.columns)
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                transpose.entries[i][j] = this.entries[j][i]
            }
        }
        return transpose
    }

    adjoint() {
        return this.cofactor().transpose()
    }

    inverse() {
        return this.adjoint().multiplyScalar(1 / this.determinant())
    }

    multiplyVector(vector) {
        if (this.columns !== vector.rows) { console.log("Matrix multiplication not gonna workie") }
        let product = new Matrix(vector.rows, 1)
        product.entries[0][0] = 0 //make it be all 0s to start

        for (let i = 0; i < vector.rows; i++) {
            for (let j = 0; j < vector.rows; j++) {
                product.entries[i][0] += vector.entries[j][0] * this.entries[i][j]
            }
        }

        return product
    }
}

// pointsArray: [{isDerivative, x, y}, {isDerivative, x, y}, ...]
// Ax = b => x = A(^-1) b
function pointsToPolynomialParameters(pointsArray) {
    let A = new Matrix(pointsArray.length, pointsArray.length)
    let b = new Matrix(pointsArray.length, 1)

    // set up the b vector
    for (let i = 0; i < b.rows; i++) {
        b.entries[i][0] = pointsArray[i].y
    }

    // set up the A matrix
    for (let i = 0; i < A.rows; i++) {
        for (let j = 0; j < A.columns; j++) {
            const k = A.columns - 1 - j
            if (pointsArray[i].isDerivative) {
                k == 0 ? A.entries[i][j] = 0 : A.entries[i][j] = k * pointsArray[i].x ** (k - 1)
            }
            else {
                A.entries[i][j] = pointsArray[i].x ** k
            }
        }
    }

    return A.inverse().multiplyVector(b)
}