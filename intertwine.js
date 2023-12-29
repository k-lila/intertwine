const canvas = document.getElementById('intertwine');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class CutThrough {
    constructor(totalLines, pointsByLine) {
        this.totalLines = totalLines;
        this.pointsByLine = pointsByLine;
        this.topPoints = [];
        this.botPoints = [];
        this.coefficients = [];
        this.points = [];
        this.settings();
        this.init();
        this.debug();
    }
    settings() {
        ctx.strokeStyle = 'white';
    }
    init() {
        this.getTopBotPoints();
        this.getCoefficients();
        this.getPointsByLine();
    }
    getTopBotPoints() {
        const getnum = () => {
            return Math.floor(Math.random() * canvas.width)
        }
        for (let i = 0; i < this.totalLines; i++) {
            this.topPoints.push(getnum());
            this.botPoints.push(getnum());
        }
        this.topPoints.push(0);
        this.botPoints.push(0);
        this.topPoints.push(canvas.width);
        this.botPoints.push(canvas.width);
        this.topPoints = this.topPoints.sort((a,b) => a - b);
        this.botPoints = this.botPoints.sort((a,b) => a - b);
    }
    getCoefficients() {
        for (let i = 0; i < this.topPoints.length; i++) {
            const x1 = this.topPoints[i];
            const y1 = 0;
            const x2 = this.botPoints[i];
            const y2 = canvas.height;
            const angular = (y2 - y1) / (x2 - x1);
            var linear = y1 - (angular * x1);
            if (!linear) {linear = 0}
            this.coefficients.push([angular, linear]);
        }
    }
    getPointsByLine() {
        this.points = [];
        for (let linha = 0; linha < this.topPoints.length; linha++) {
            var _pointsLista = [];
            for (let pointLine = 0; pointLine < this.pointsByLine; pointLine++) {
                const y = Math.random() * canvas.height;
                var x;
                if (this.coefficients[linha][1] == -Infinity) {
                    x = this.topPoints[linha];
                } else {
                    x = (y - this.coefficients[linha][1]) / this.coefficients[linha][0];
                }
                _pointsLista.push([x, y]);
            }
            _pointsLista = _pointsLista.sort((a, b) => a[1] - b[1]);
            this.points.push(_pointsLista);
        }
    }
    debug() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'l') {
                for (let i = 0; i < this.points.length; i++) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.lineWidth = 1;
                    ctx.moveTo(this.topPoints[i], 0);
                    ctx.lineTo(this.botPoints[i], canvas.height);
                    ctx.stroke();
                    ctx.restore();
                }
            } else if (event.key === 'p') {
                this.points.forEach(_lista => {
                    _lista.forEach(point => {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(point[0], point[1], 2, 0, Math.PI * 2);
                        ctx.fillStyle = 'red';
                        ctx.fill();
                        ctx.closePath();
                        ctx.restore();
                    })
                })
            } else if (event.key === 'r') {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.draw();
            }
        })
    }
}

class Intertwine extends CutThrough {
    constructor(totalLines, pointsByLine) {
        super(totalLines, pointsByLine);
        this.history = [];
        this.get_history();
    }
    get_history() {
        this.points.forEach(line => {
            var new_line = []
            line.forEach(point => {
                new_line.push([point[0], point[1]]);
            });
            this.history.push(new_line)
        });
    }
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i <= this.totalLines; i++) {
            this.points[i].forEach((point, index) => {
                ctx.save();
                ctx.lineWidth = 0.3;
                // ctx.setLineDash([125, 1]);
                ctx.beginPath();
                ctx.moveTo(point[0], point[1]);
                ctx.lineTo(this.points[i + 1][index][0], this.points[i + 1][index][1]);
                ctx.stroke();
                ctx.restore();
            })
        }
    }
    entropy() {
        this.points.forEach((lista, index) => {
            lista.forEach(point => {
                point[1] += Math.random() * Math.random();
                point[1] -= Math.random() * Math.random();
                if (index != this.points.length - 1) {
                    if (index != 0) {
                        point[0] += Math.random() * Math.random();
                        point[0] -= Math.random() * Math.random();
                    }
                } 
            })
        })
    }
    slide() {
        this.points.forEach((lista, index) => {
            const angular = this.coefficients[index][0];
            lista.forEach(point => {
                const linear = point[1] - (angular * point[0]);
                point[1] += Math.random();
                point[1] -= Math.random();
                if (index != 0) {
                    if ((linear != -Infinity) && (linear != 0)) {
                        point[0] = ([point[1]] - linear) / angular;
                    }            
                }
            })
        })
    }

    back(initialState = false) {
        if (initialState) {
            this.points.forEach((lista, index) => {
                lista.forEach((point, i) => {
                    point[0] = this.history[index][i][0];
                    point[1] = this.history[index][i][1];
                })
            })
        } else {
            this.points.forEach((lista, index) => {
                lista.forEach((point, i) => {
                    const difX = this.history[index][i][0] - point[0];
                    const difY = this.history[index][i][1] - point[1];
                    if (difX > 0) {
                        point[0] += Math.random() * 0.5;
                    } else if (difX < 0) {
                        point[0] -= Math.random() * 0.5;
                    }
                    if (difY > 0) {
                        point[1] += Math.random() * 0.5;
                    } else if (difY < 0) {
                        point[1] -= Math.random() * 0.5;
                    }
                })
            })
        }
    }
}

const intertwine = new Intertwine(20, 1000);
intertwine.draw();
var frame = 0;

function animate() {
    //alguém esteve aqui
    frame += 1;
    if (frame < 200) {
        intertwine.entropy();
        intertwine.slide();
    } else {
        intertwine.back()
    }
    if (frame == 250) {
        intertwine.back(true)
        frame = 0
    }
    intertwine.draw();
    setTimeout(() => {
        requestAnimationFrame(animate);
    }, 1000/60)
}

animate()
