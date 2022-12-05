var Population = (function () {
    function Population(popsize, mutationRate) {
        this.mutationRate = mutationRate;
        this.matingPool = [];
        this.generation = 1;
        this.population = [];
        for (var i = 0; i < popsize; i++) {
            this.population[i] = new Chromosome();
        }
    }
    Population.prototype.run = function () {
        for (var i = 0; i < this.population.length; i++) {
            this.population[i].move();
            this.population[i].show();
        }
    };
    Population.prototype.calcFitness = function () {
        for (var i = 0; i < this.population.length; i++) {
            this.population[i].calcFitness();
        }
    };
    Population.prototype.naturalSelection = function () {
        this.matingPool = [];
        var maxFitness = this.getMaxFitness();
        for (var i = 0; i < this.population.length; i++) {
            var fitnessNormal = map(this.population[i].getFitness(), 0, maxFitness, 0, 1);
            var n = floor(fitnessNormal * 100);
            for (var j = 0; j < n; j++) {
                this.matingPool.push(this.population[i]);
            }
        }
    };
    Population.prototype.generate = function () {
        var partnerA, partnerB, indexA, indexB;
        for (var i = 0; i < this.population.length; i++) {
            indexA = floor(random(this.matingPool.length));
            indexB = floor(random(this.matingPool.length));
            partnerA = this.matingPool[indexA].dna;
            partnerB = this.matingPool[indexB].dna;
            var child = partnerA.crossover(partnerB);
            child.mutate(this.mutationRate);
            this.population[i] = new Chromosome(child);
        }
        this.generation++;
    };
    Population.prototype.getMaxFitness = function () {
        var record = 0;
        for (var i = 0; i < this.population.length; i++) {
            if (this.population[i].getFitness() > record) {
                record = this.population[i].getFitness();
            }
        }
        return record;
    };
    Population.prototype.getGeneration = function () {
        return this.generation;
    };
    Population.prototype.getAverage = function () {
        var total = 0;
        for (var i = 0; i < this.population.length; i++) {
            total += this.population[i].fitness;
        }
        return total / this.population.length;
    };
    return Population;
}());
var DNA = (function () {
    function DNA(genes) {
        this.maxForce = 0.5;
        this.genes = [];
        if (arguments.length < 1) {
            for (var i = 0; i < params.LifeTime; i++) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].mult(random(this.maxForce));
            }
        }
        else {
            this.genes = genes;
        }
    }
    DNA.prototype.crossover = function (partner) {
        var childgenes = [];
        var midpoint = floor(random(this.genes.length));
        for (var i = 0; i < this.genes.length; i++) {
            if (i > midpoint)
                childgenes[i] = this.genes[i];
            else
                childgenes[i] = partner.genes[i];
        }
        var newchild = new DNA(childgenes);
        return newchild;
    };
    DNA.prototype.mutate = function (mutationRate) {
        for (var i = 0; i < this.genes.length; i++) {
            if (random(1) < mutationRate) {
                this.genes[i] = p5.Vector.random2D();
                this.genes[i].mult(random(this.maxForce));
            }
        }
    };
    return DNA;
}());
function euclid(x1, y1, x2, y2) {
    return sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));
}
var Chromosome = (function () {
    function Chromosome(dna) {
        this.position = createVector(width / 2, params.Diameter);
        this.velocity = createVector();
        this.acceleration = createVector();
        this.fitness = 0;
        if (arguments.length < 1) {
            this.dna = new DNA();
        }
        else {
            this.dna = dna;
        }
        this.geneCounter = 0;
        this.targetHit = false;
    }
    Chromosome.prototype.calcFitness = function () {
        var d = euclid(this.position.x, this.position.y, target.x, target.y);
        this.fitness = pow(1 / d, 2);
    };
    Chromosome.prototype.show = function () {
        fill(255, 0, 0);
        ellipse(this.position.x, this.position.y, params.Diameter, params.Diameter);
    };
    Chromosome.prototype.move = function () {
        if (!this.isHitTarget()) {
            this.applyForce(this.dna.genes[this.geneCounter]);
            this.geneCounter = (this.geneCounter + 1) % this.dna.genes.length;
            this.velocity.add(this.acceleration);
            this.position.add(this.velocity);
            this.acceleration.mult(0);
        }
    };
    Chromosome.prototype.applyForce = function (f) {
        this.acceleration.add(f);
    };
    Chromosome.prototype.isHitTarget = function () {
        var state = this.targetHit;
        var d = euclid(this.position.x, this.position.y, target.x, target.y);
        if (d < params.Diameter)
            this.targetHit = true;
        else
            this.targetHit = false;
        if (!state && this.targetHit)
            hitScore++;
        return this.targetHit;
    };
    Chromosome.prototype.getFitness = function () {
        return this.fitness;
    };
    return Chromosome;
}());
var gui = new dat.GUI();
var params = {
    Diameter: 30,
    LifeTime: 160,
    PopulationSize: 50,
    MutationRate: 0.01,
    Download_Image: function () { return save(); },
};
gui.add(params, "Diameter", 0, 100, 1);
gui.add(params, "LifeTime", 0, 200, 1);
gui.add(params, "PopulationSize", 0, 100, 1).onChange(function (value) {
    population.population = [];
    for (var i = 0; i < value; i++) {
        population.population.push(new Chromosome());
    }
});
gui.add(params, "MutationRate", 0, 1, 0.01);
gui.add(params, "Download_Image");
var hitScore = 0;
var highScore = 0;
var lifeCounter = params.LifeTime;
var population;
var popsize = 50;
var mutationRate = params.MutationRate;
var target;
var generationP, lifeP, hitP;
function draw() {
    background(220);
    fill(0, 0, 255);
    ellipse(target.x, target.y, params.Diameter, params.Diameter);
    if (lifeCounter > 0) {
        population.run();
        lifeCounter--;
        timerP.html("<b>Remaining time: " + lifeCounter + "</b>");
    }
    else {
        lifeCounter = params.LifeTime;
        if (hitScore > highScore)
            highScore = hitScore;
        highScoreP.html("<b>Highscore: " + highScore + " hit</b>");
        hitScore = 0;
        population.calcFitness();
        population.naturalSelection();
        population.generate();
        fill(0);
        generationP.html("<b>Generation: " + population.getGeneration() + "</b>");
    }
    hitP.html("<b>Target hit: " + hitScore + "/" + params.PopulationSize + "</b>");
}
function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        target.x = mouseX;
        target.y = mouseY;
        highScore = 0;
    }
}
function setup() {
    p6_CreateCanvas();
    population = new Population(params.PopulationSize, params.MutationRate);
    target = createVector(width - params.Diameter / 2, height - params.Diameter / 2);
    timerP = createP("<b>Remaining: " + lifeCounter + "</b>");
    timerP.position(10, height + 75);
    generationP = createP("<b>Generation: 1</b>");
    generationP.position(10, height + 95);
    hitP = createP("<b>Target hit 0/" + params.PopulationSize + "</b>");
    hitP.position(10, height + 115);
    highScoreP = createP("<b>Highscore: " + highScore + " hit</b>");
    highScoreP.position(10, height + 135);
}
function windowResized() {
    p6_ResizeCanvas();
}
var __ASPECT_RATIO = 1;
var __MARGIN_SIZE = 25;
function __desiredCanvasWidth() {
    var windowRatio = windowWidth / windowHeight;
    if (__ASPECT_RATIO > windowRatio) {
        return windowWidth - __MARGIN_SIZE * 2;
    }
    else {
        return __desiredCanvasHeight() * __ASPECT_RATIO;
    }
}
function __desiredCanvasHeight() {
    var windowRatio = windowWidth / windowHeight;
    if (__ASPECT_RATIO > windowRatio) {
        return __desiredCanvasWidth() / __ASPECT_RATIO;
    }
    else {
        return windowHeight - __MARGIN_SIZE * 2;
    }
}
var __canvas;
function __centerCanvas() {
    __canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
}
function p6_CreateCanvas() {
    __canvas = createCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
    __centerCanvas();
}
function p6_ResizeCanvas() {
    resizeCanvas(__desiredCanvasWidth(), __desiredCanvasHeight());
    __centerCanvas();
}
var p6_SaveImageSequence = function (durationInFrames, fileExtension) {
    if (frameCount <= durationInFrames) {
        noLoop();
        var filename_1 = nf(frameCount - 1, ceil(log(durationInFrames) / log(10)));
        var mimeType = (function () {
            switch (fileExtension) {
                case 'png':
                    return 'image/png';
                case 'jpeg':
                case 'jpg':
                    return 'image/jpeg';
            }
        })();
        __canvas.elt.toBlob(function (blob) {
            p5.prototype.downloadFile(blob, filename_1, fileExtension);
            setTimeout(function () { return loop(); }, 100);
        }, mimeType);
    }
};
//# sourceMappingURL=../src/src/build.js.map