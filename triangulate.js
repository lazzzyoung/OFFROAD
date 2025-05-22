// 삼각측량
function tagPos(anchorLen, len1, len2) {
    const cosA = (len1 ** 2 + len2 ** 2 - anchorLen ** 2) / (2 * len1 * len2);
    const x = len1 * cosA;
    const y = len1 * Math.sqrt(1 - cosA ** 2);
    return [parseFloat(x.toFixed(1)), parseFloat(y.toFixed(1))];
}


// 삼변측량
function trilaterate(ap1, ap2, ap3) {
    const [x1, y1, d1] = ap1;
    const [x2, y2, d2] = ap2;
    const [x3, y3, d3] = ap3;

    const A = 2 * (x2 - x1);
    const B = 2 * (y2 - y1);
    const C = d1**2 - d2**2 - x1**2 + x2**2 - y1**2 + y2**2;
    const D = 2 * (x3 - x2);
    const E = 2 * (y3 - y2);
    const F = d2**2 - d3**2 - x2**2 + x3**2 - y2**2 + y3**2;

    const denominator = (B * D) - (E * A);
    if (denominator === 0) {
        throw new Error("삼변측량 실패: 분모가 0임");
    }

    const userX = ((F * B) - (E * C)) / denominator;
    const userY = ((F * A) - (D * C)) / ((A * E) - (D * B));

    return [parseFloat(userX.toFixed(2)), parseFloat(userY.toFixed(2))];
}

module.exports = { tagPos, trilaterate };