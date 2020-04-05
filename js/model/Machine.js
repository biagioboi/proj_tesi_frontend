class Machine {

    constructor(name, status, powerOn, start, beatingSpeedPerHours, startMouldAssembly, endMouldAssembly, changeOfWorkShift, secondChangeOfWorkShift, goodBeatings, badBeatings) {
        this.name = name;
        this.status = status;
        this.powerOn = powerOn;
        this.start = start;
        this.beatingSpeedPerHours = beatingSpeedPerHours;
        this.startMouldAssembly = startMouldAssembly;
        this.endMouldAssembly = endMouldAssembly;
        this.changeOfWorkShift = changeOfWorkShift;
        this.secondChangeOfWorkShift = secondChangeOfWorkShift;
        this.goodBeatings = goodBeatings;
        this.badBeatings = badBeatings;
        this.numExpectedProduct = null;
        this.numProduct = null;
        this.numGoodProduct = null;
        this.numBadProduct = null;
    }

}