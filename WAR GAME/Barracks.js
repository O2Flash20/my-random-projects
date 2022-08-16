class Barracks extends Fortress {
    emit(num) {
        legions.push(new Legion(this, 1))
    }
}